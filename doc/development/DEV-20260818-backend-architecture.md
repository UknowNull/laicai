# DEV-20260818-backend-architecture

status: planned
date: 2026-08-18
related_requests:
  - REQ-20260818-backend-real-implementation
affected_domains:
  - auto-capture
  - ledger-engine
  - import-pipeline
  - analysis-llm
  - privacy-security

## 1. 目标

把「前端模拟 + 占位」升级为**真正的后台功能**，四块：

1. **Android 通知捕获**（原生 Kotlin 插件 + 确定解析管线）→ 自动入账/待确认。
2. **本地 SQLite 持久化**（localStorage → SQLite 迁移）。
3. **云端分析服务**（Node/TS API + LLM 网关抽象，可选授权）。
4. **导入管线**（CSV/OFX/QIF → 映射 → 预览 → 去重 → 入账）。

铁律不变：金额/方向/去重/余额由确定性代码控制（`INV-MONEY-01`）；通知正文不落盘（`INV-PRIVACY-01`）；云分析显式授权/最小化/可关（`INV-PRIVACY-02`）。

## 2. 技术选型（决策摘要，详见 ADR-006）

| 层 | 选型 | 理由 |
| --- | --- | --- |
| 原生插件 | Capacitor 自定义插件（Kotlin） | 复用现有壳，通知监听必须原生 |
| 本地存储 | SQLite（`@capacitor-community/sqlite` 或原生） | 金额级持久化、事务、迁移 |
| 解析引擎 | TS/JS 单一库（`src/engine/parse/`） | 确定性、可单测、Web/原生桥共用规则 |
| 云端 API | Node 20/22 + TS + Fastify（或 Express） | 与前端同栈、类型共享、轻量 |
| LLM 网关 | Provider 抽象（OpenAI / Anthropic / Ollama） | 可插拔、可本地化、用量可控 |
| 部署 | Docker 单服务 + 反代（可选） | 本地优先，云端可选 |

## 3. 总架构

```text
┌───────────────────────────────────────────────────────────────┐
│ 客户端（Capacitor：WebView + 原生插件）                          │
│  ├─ UI 层（现有，不改结构）                                      │
│  ├─ 引擎层 useLedger → Repo 层（SQLite）                        │
│  │    ├─ parse/   确定解析（金额/方向/商户/时间）                  │
│  │    ├─ dedup/   SHA-256 去重 + 时间窗合并                      │
│  │    └─ confid/  置信度评分 → 入账/待确认                       │
│  ├─ 原生 bridge（@laicai/capture 插件）                          │
│  │    └─ NotificationListenerService → 预过滤 → 提取 → 回调     │
│  └─ 导入（CSV/OFX/QIF parser + 映射器 + 预览）                   │
├───────────────────────────────────────────────────────────────┤
│ 云端（可选，显式授权后开启）                                     │
│  ├─ POST /api/report   周期性报告（确定性指标 + LLM 解释）        │
│  ├─ POST /api/qa       自然语言问答                              │
│  ├─ GET  /api/usage    用量/预算                                  │
│  └─ LLM 网关（provider 抽象）                                    │
└───────────────────────────────────────────────────────────────┘
```

## 4. 模块边界与数据契约

### 4.1 交易模型（SQLite schema，`ledger-engine`）

```sql
CREATE TABLE tx (
  id         TEXT PRIMARY KEY,          -- uuid
  source     TEXT NOT NULL,             -- 'notify' | 'manual' | 'import' | 'demo'
  source_id  TEXT,                      -- 原生通知 id（仅存 id，不存正文）
  merchant   TEXT NOT NULL,
  category   TEXT,
  amount     INTEGER NOT NULL,          -- 最小货币单位（分），±
  direction  INTEGER NOT NULL,          -- -1 支出 / +1 收入 / 0 转账
  account_id TEXT,
  status     TEXT NOT NULL DEFAULT 'ok',-- ok | pending | ignored
  dedup_id   TEXT UNIQUE,               -- SHA-256(source|merchant|amount|timeWindow)
  raw_hint   TEXT,                      -- 冗余提示：不存通知正文
  day        TEXT NOT NULL,             -- 'YYYY-MM-DD'（本地时区）
  ts         INTEGER NOT NULL,          -- UTC 毫秒
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_tx_day ON tx(day);
CREATE INDEX idx_tx_dedup ON tx(dedup_id);

CREATE TABLE pending (
  id         TEXT PRIMARY KEY,
  merchant   TEXT NOT NULL,
  amount     INTEGER NOT NULL,
  reason     TEXT NOT NULL,             -- 分类不明 / 账户未知 / 低置信抄账
  fields     TEXT,                      -- JSON：已提取字段（不含正文）
  ts         INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE account (
  id       TEXT PRIMARY KEY,
  name     TEXT NOT NULL,
  type     TEXT NOT NULL,               -- bank | cash | wallet
  balance  INTEGER NOT NULL DEFAULT 0,  -- 分
  tail     TEXT,                        -- 卡号尾号，供 AUTO-08 匹配
  updated_at INTEGER NOT NULL
);

CREATE TABLE kv (
  key  TEXT PRIMARY KEY,
  val  TEXT NOT NULL                    -- JSON：设置、规则版本、去重水位
);
```

### 4.2 确定性解析管线（`src/engine/parse/`，纯函数，无副作用）

```ts
type RawNotif = {
  sourceId: string;         // 通知唯一 id（仅存 id 用于去重/联动，正文绝不落盘）
  appPkg: string;           // 来源包名
  title: string;            // 短信/标题
  text: string;             // 正文（仅内存）
  ts: number;               // UTC 毫秒
};

type Parsed =
  | { ok: true; tx: {
      merchant: string; category: string; amount: number; // 分（负=支出）
      direction: -1 | 1; accountId: string; confidence: number;
      reason?: string;                                    // 低置信原因
    } }
  | { ok: false; reason: 'unparseable' | 'not-payment'; merchant?: string; amount?: number };

// 入口
parseNotif(raw: RawNotif): Parsed | null;
// 内部：来源预过滤 → 正文提取（限长 512）→ 金额/方向/商户/时间正则 → 分类映射
```

- **金额正则**：`/(?<![¥￥])(\d{1,3}(,\d{3})*|\d+)(\.\d{1,2})?/` + 方向词（「支出/付款/消费」= -1，「收入/到账/退款」= +1，「转账」= 0）。
- **分类映射**（确定性规则）：商户关键词 → 分类表（`src/engine/parse/categories.ts`），未知归「其他」并降置信。
- **置信度**：`confidence = 基础 0.5 + 金额明确 +0.25 + 商户明确 +0.15 + 方向明确 +0.10 − 歧义扣分`；`>= 0.85 入账，< 0.85 待确认`（与原型一致：美团外卖分类不明→待确认）。

### 4.3 去重（`src/engine/dedup/`）

- `dedupId = sha256(\`${source}|${merchant}|${amount}|${timeWindow}\`)`（`ADR-004`）。
- `timeWindow`：按来源类型取 5 分钟桶（`floor(ts/300000)`），银行×钱包合并窗口内同商户同额判为一次。
- Repo 层 `INSERT OR IGNORE` 依赖 `dedup_id UNIQUE`，天然幂等。

### 4.4 原生通知捕获（`@laicai/capture` 插件，Kotlin）

```kotlin
// CapturePlugin.kt —— Capacitor 插件
@CapacitorPlugin(name = "Capture")
class CapturePlugin : Plugin() {
  // 向引擎注册一个「通知 → 引擎」桥，引擎通过 WebView 调用 parseNotif
  // 插件仅传递：sourceId/appPkg/title/text(内存)/ts —— text 不入 SharedPreferences/DB
}
```

- `NotificationListenerService` 生命周期：`onNotificationPosted` → `preFilter(appPkg, title)` → 提取（`extras`/`MessagingStyle`/`tickerText`，限长）→ 通过 bridge 回调 WebView 引擎 → `parseNotif` → 置信 → 入账/待确认。
- 权限：`BIND_NOTIFICATION_LISTENER_SERVICE`；引导页 `SEC-03`。
- `INV-PRIVACY-01`：解析后 `text` 立即 GC；仅存 `sourceId` 与解析结构化字段。
- 后台可靠性（`AUTO-07`）：服务重绑定、退避重试、进程回收后恢复、开机恢复监听。

### 4.5 云端分析服务（`server/`，Node/TS）

```text
server/
├─ src/
│  ├─ index.ts           入口（Fastify）
│  ├─ routes/
│  │  ├─ report.ts       POST /api/report
│  │  └─ qa.ts           POST /api/qa
│  ├─ llm/
│  │  ├─ provider.ts     抽象（OpenAI/Anthropic/Ollama）
│  │  └─ prompts.ts      系统提示（覆盖度/未确认声明强制）
│  ├─ metrics.ts         确定性指标计算（服务端镜像，与客户端同源规则）
│  └─ usage.ts           用量/预算/审计日志
├─ test/                 Vitest 单测 + 契约测试
└─ Dockerfile
```

**请求/响应契约（最小化上传）**

```ts
// POST /api/report
// 客户端只上传「指标」(客户端规则算好的聚合)，不上传原始交易
req: {
  period: { from: string; to: string };
  metrics: {            // 客户端确定性指标
    expense: number; income: number; balance: number;
    mom: number; budgetOverrun: number;
    catRatio: { cat: string; pct: number }[];
    topMerchant: { name: string; count: number; amount: number };
    coverage: number; pendingExcluded: number;
  };
  prompt?: string;      // 用户附加指令（可选）
}
res: {
  report: string;                    // 自然语言报告
  drills: {                          // 可下钻：每个结论都可回到交易
    claim: string; category?: string; merchant?: string; range?: string;
  }[];
  usage: { tokens: number; cost: number };
}

// POST /api/qa
req: { question: string; metrics: MetricsSummary; }
res: { answer: string; drills: Drill[]; usage: Usage; }
```

**错误码（INV-EXT-01）**：

| code | HTTP | 含义 |
| --- | --- | --- |
| `LLM_TIMEOUT` | 504 | 超时（默认 15s，可配置） |
| `LLM_UNAVAILABLE` | 503 | Provider 不可用；客户端回退纯确定性指标 |
| `RATE_LIMIT` | 429 | 超预算/频率；客户端提示稍后再试 |
| `INVALID_MEASURE` | 400 | 指标校验失败（拒绝注入） |
| `AUTH_REQUIRED` | 401 | 未授权（客户端应只在授权后调用） |

- 客户端接入缝：`useLedger.genReport` 替换实现（`service/api.ts`），超时/错误/降级按 `INV-EXT-01`。
- 隐私：服务端**不落库原始交易**；请求仅含聚合指标与可下钻的『聚合级』claim；审计日志只记用量与时期，不记商户/金额明细（`INV-PRIVACY-02`）。

### 4.6 导入管线（`src/engine/import/`）

```text
来源文件 → format detect（CSV/OFX/QIF）→ 行解析器 → 标准行 {day, merchant, amount(分), direction, account, category?}
  → 映射器（栏位映射，微信/支付宝官方模板预设 + 通用列名推断）
  → 预览（与账本去重比对，冲突标红）
  → 确认 → Repo.insertMany（dedup_id 幂等）
```
- `IMP-01/02/05`；PDF/OCR（`IMP-03`）后续里程碑，不阻塞本迭代。
- 与通知解析共用 `parse/` 分类映射与置信逻辑（一致性）。

## 5. 里程碑拆解（实施阶段排序）

| M | 内容 | 依赖 | 验收 |
| --- | --- | --- | --- |
| M1 | SQLite Repo 层（schema/CRUD/迁移）+ 引擎接 Repo | 无 | build + 单测；localStorage → SQLite 迁移脚本 |
| M2 | 解析引擎（parse/dedup/confid）+ 分类映射 | M1 | 单测：微信/支付宝/银行样本 30+ 通过率 ≥90% |
| M3 | 原生插件（Kotlin 通知监听 + 桥） | M2 | 真机通知 → 自动入账/待确认流闭环 |
| M4 | 云端分析服务（Fastify + LLM 网关 + 契约测试） | M1 | `POST /api/report` 契约测试通过；降级路径验证 |
| M5 | 前端接入：genReport/QA 换真 API；授权开关联动 | M4 | 冒烟通过：报告/问答来自真实 API；关授权回退纯指标 |
| M6 | 导入管线（CSV/OFX/QIF + 映射 + 预览 + 去重） | M2 | 微信/支付宝 CSV 样本导入无冲突 |

## 6. 测试策略

- **单元**：`parse/`（样本库 goldens）、`dedup/`（时间窗/跨渠道）、`metrics`（确定性指标）、`import/` 解析器。
- **契约**：`server/test` 对 `/api/report`、`/api/qa` 的请求/响应 schema 测试（mock LLM provider）。
- **冒烟**（现有 `scripts/smoke_react.py` 扩展）：报告/问答文案**不再断言固定字符串**，改为断言 loading→done 状态 + 错误降级路径（LLM 不可用时显示确定性指标）。
- 隐私审计测试：通知正文不落盘（`pending/tx` 表不含 `text` 字段）、`/api/report` 请求体无原始交易。

## 7. 迁移与回滚

- localStorage → SQLite：`kv['migration.v1']` 水位；迁移脚本幂等；失败保留 localStorage 兜底可回退（`INV-BACKUP-01` 前置）。
- 后端服务可独立关闭：客户端在 `cloudOn=false` 或 API 不可用时走纯确定性指标（功能不降级）。
- 回滚：删除新增模块/repo，恢复 `useLedger` 内存实现（git revert）。

## 8. 文档同步义务

本 DEV 落地后即时更新：`domains/auto-capture`、`domains/ledger-engine`、`domains/analysis-llm`、`domains/import-pipeline`、`domains/privacy-security` 状态从「规划/模拟」推进为「已设计/实施中」，并新增 `ADR-006-backend-stack`。

## 9. 部署与 CI

> 本项目主体为「本地优先 + 云端可选」：服务端**仅在用户显式授权后**开启；未部署时产品完全以本地确定性指标运行。

### 9.1 Service 文件结构

```text
server/
├─ src/
│  ├─ index.ts          Fastify 入口（启动 + /health）
│  ├─ config.ts         环境变量校验（Zod）
│  ├─ routes/
│  │  ├─ report.ts     POST /api/report
│  │  └─ qa.ts         POST /api/qa
│  ├─ llm/
│  │  ├─ provider.ts   Provider 抽象（OpenAI / Anthropic / Ollama）
│  │  └─ prompts.ts    系统提示（覆盖度/未确认声明强制）
│  ├─ metrics.ts       确定性指标（服务端镜像，与前端同源）
│  └─ usage.ts         用量/预算/审计日志
├─ test/                Vitest 单测 + 契约测试
├─ Dockerfile
├─ docker-compose.yml  （本地开发用，含 mock LLM）
├─ package.json
└─ tsconfig.json
```

### 9.2 环境变量（Secrets）

| 变量 | 来源 | 说明 |
| --- | --- | --- |
| `LLM_PROVIDER` | Secrets（默认 `openai`） | `openai` | `anthropic` | `ollama` |
| `LLM_API_KEY` | Secrets | 供应商 API Key |
| `LLM_MODEL` | Secrets | 模型名（如 `gpt-4o-mini`） |
| `PORT` | 默认 8080 | 服务端口 |
| `MAX_TOKENS` | 默认 2000 | 单次调用上限 |
| `TIMEOUT_MS` | 默认 15000 | 超时（`INV-EXT-01`） |
| `USAGE_DAILY_USD` | 默认 5 | 单用户每日 USD 限额 |

> 敏感：API Key/密码**从不写入日志、从不落库于审计日志**；审计日志仅记用量、时期、错误类型。

### 9.3 Dockerfile

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./
# 运行时以非 root 账户（安全边界）
USER 10001

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=deps /app /app
EXPOSE 8080
ENTRYPOINT ["node","src/index.js"]
```

### 9.4 docker-compose（本地开发+mock）

```yaml
services:
  laicai-api:
    build: ./server
    env_file: .env          # 本地开发用，生产走 Secrets
    ports: ["8080:8080"]
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:8080/health').on('response',r=>r.statusCode===200?process.exit(0):process.exit(1))"]
      interval: 30s
```

### 9.5 CI 流水线（.github/workflows/server.yml，新增）

```yaml
name: Laicai Server CI
on:
  push: { paths: ['server/**'] }
  pull_request: { paths: ['server/**'] }
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4 with: { node-version: 24, cache: npm, cache-dependency-path: server/package-lock.json }
      - run: npm ci
        working-directory: server
      - run: npm run test:ci      # vitest 单测 + 契约测试
        working-directory: server
      - run: npm run build        # tsc 类型检查 + build
        working-directory: server
  release:
    # push tag v* 或 workflow_dispatch 时，发布 Docker镜像到 GitHub Packages
    needs: test
    runs-on: ubuntu-latest
    ... image: ghcr.io/USER/laicai-api:${{ inputs.version }}
```

### 9.6 部署形态

- **本地优先**：默认不部署服务；用户开启授权后客户端直连 `https://api.laicai.example`（或自托管 URL）。
- **一键部署**：`docker-compose.yml` 拉起服务端；镜像可选 `ghcr.io/USER/laicai-api:v*`。
- **云主机**：渲染 / fly.io / 自托管 VPS，`PORT` + Secrets 即连。
- **可观阅性**：`/health` 健康检查 + 审计日志；服务独立关闭不影响前端。

### 9.7 回滚

- 服务端容器回退上一 tag；客户端 `cloudOn=false` 即刻降级为纯本地确定性模式，无版本依赖。