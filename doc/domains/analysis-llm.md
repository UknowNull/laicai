# 领域：周期分析 LLM（analysis-llm）

## 1. 职责

阶段三能力：确定性指标 + 云端 LLM 周期报告/自然语言问答。区分「确定性」与「解释性」是核心边界。**设计已定（`DEV-20260818-backend-architecture` §4.5），待实施（M4/M5）。**

## 2. 架构（设计定稿）

```text
客户端（确定性指标计算，规则代码）
  -> 组装最小化指标上下文（不含原始交易）
  -> 用户显式授权 + 网络可用
  -> POST /api/report / POST /api/qa（Node Fastify 服务）
  -> LLM 网关（OpenAI/Anthropic/Ollama 抽象，可插拔）
  -> 可下钻卡片（每个结论回到聚合级 claim，非原始交易）
  -> 关闭授权 → 回到纯确定性指标面板（功能不降级）
```

## 3. 入口与代码（当前）

- `react-app/src/engine/ledger.js`：`MONTHLY` 确定性指标（已实现）+ `REPORT_TEXT`/`QA_ANSWERS`（模拟文案）。
- `react-app/src/components/ReportCard.jsx`：报告卡 UI（idle/loading/done 三态，打字机）。
- `react-app/src/components/Pages.jsx`（AnalysisPage）：指标面板 + 问答 chips（模拟文案）。
- 实现细节：`doc/development/DEV-20260818-react-frontend-spec.md`（§4 状态机、§5 S4、§10 AI 边界）。

## 4. 架构边界（铁律，`ADR-003` + `INV-MONEY-02`）

```text
账本 → 确定性指标计算（规则代码，无 LLM）——金额/方向/去重/余额永不经过 LLM
  → 组装「指标 + 覆盖度 + 未确认数」最小上下文
  → 用户显式授权 + 最小化上传 -> LLM 生成报告/回答
  → 输出可下钻卡片（每个结论可回到聚合 claim）
  → 用户可关闭 -> 回到纯确定性指标面板（功能不降级）
```

## 5. API 契约（真实后端，设计定稿）

```ts
// POST /api/report —— 仅上传聚合指标，不上传原始交易
req: {
  period: { from: string; to: string };
  metrics: { expense: number; income: number; balance: number;
             mom: number; budgetOverrun: number;
             catRatio: { cat: string; pct: number }[];
             topMerchant: { name: string; count: number; amount: number };
             coverage: number; pendingExcluded: number; };
  prompt?: string;
}
res: { report: string;
       drills: { claim: string; category?: string; merchant?: string; range?: string; }[];
       usage: { tokens: number; cost: number; }; }

// POST /api/qa
req: { question: string; metrics: MetricsSummary; }
res: { answer: string; drills: Drill[]; usage: Usage; }
```

**错误码（INV-EXT-01）**：

| code | HTTP | 客户端行为 |
| --- | --- | --- |
| `LLM_TIMEOUT` | 504 | 提示稍后重试；降级显示纯指标 |
| `LLM_UNAVAILABLE` | 503 | 显示纯指标面板（功能不降级） |
| `RATE_LIMIT` | 429 | 提示今日额度用尽 |
| `AUTH_REQUIRED` | 401 | 引导用户开启授权 |

## 6. 契约（继承）

- 报告必须包含：分析周期、数据覆盖度、未确认账单数声明（避免误导）。
- 可追溯：结论可下钻到类别/商户/时间范围（聚合级，不追溯到原始交易给 LLM）。
- 授权：首次明确授权弹窗；设置一键关闭（`ANA-04`，React 骨架已实现占位）。
- 数据最小化：**仅上传指标与可下钻 claim，不上传原始交易记录**（`ANA-05`）。
- 外部调用需超时（15s 默认）、阶段名、错误处理与用量（`INV-EXT-01`）。

## 7. 从模拟接入真实 API 的改造路径

- `useLedger.genReport` 替换实现：引入 `src/service/api.ts`；调用 `POST /api/report`；loading/done/error 三态对应 UI。
- QA：`setQa(q)` 换真实 `POST /api/qa`，展示 answer + drills。
- 降级：`cloudOn=false` 或 API 不可用 → 返回固定文案（现有模拟），功能不降级。
- 冒烟：新增断言「loading→done 状态转换」+ 「关授权路径纯指标展示」，**不再断言固定报告字符串**。

## 8. 已知限制

- 当前迭代：前端模拟文案（`REPORT_TEXT`/`QA_ANSWERS`）仍保留为离线/降级路径。
- 后续 LLM 集成只替换 `useLedger.genReport` 的实现（接入点见 `DEV-20260818-react-frontend-spec.md` §10），UI 无变更。
- 云端服务可独立关闭/部署（`server/` Docker 化）。

## 9. 状态

- 确定性指标（ANA-01）：**已实现**（前端客户端）。
- LLM 报告/问答（ANA-02/03）：**模拟 → 设计完成**（DEV §4.5，M4/M5 实施中）。
- 授权开关（ANA-04）：**React 骨架已实现**；接入真实 API 后联动。
- 数据最小化（ANA-05）：**设计完成**（请求体无原始交易）。

## 10. 验证

- 冒烟（`smoke_react.py`）：报告生成 loading→done；问答 chips 展示；关闭云端回归纯指标面板。
- 契约测试（`server/test`）：mock LLM provider，断言 `/api/report` 请求体不含原始交易，response 结构符合 schema。