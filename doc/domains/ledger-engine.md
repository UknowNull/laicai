# 领域：账本引擎（ledger-engine）

## 1. 职责

来财记账的核心数据模型、状态机与持久化层。所有确定性计算（金额/方向/去重/余额）在此域完成，LLM 不触及计算。

## 2. 入口与代码

- `react-app/src/engine/ledger.js`：统一数据模型（`INITIAL_TX`、`INITIAL_PENDING`、`ACCOUNTS`、`MONTHLY` 指标、`CAT_RATIO`）。
- `react-app/src/engine/useLedger.js`：统一状态机（React Hook），消费引擎 + 持久化（`laicai.ledger.v1`）+ 重置。
- `react-app/src/components/Pages.jsx`：页面层消费引擎数据，不直接调用分类/去重逻辑。
- `react-app/src/engine/parse/`（规划）：确定性解析（金额/方向/商户/时间，纯函数）。
- `react-app/src/engine/dedup/`（规划）：SHA-256 去重 + 时间窗合并。

## 3. 数据模型（当前与规划）

### 3.1 当前实现（前端演示，内存 + localStorage）

```ts
type Tx = {
  id: string; day: string; source: string; merchant: string;
  category: string; amount: number; account: string; status: 'ok'|'pending';
  icon?: string; time?: string; tag?: string; confidence?: number;
};
type Pending = {
  id: string; merchant: string; amount: number; reason: string;
  hint?: string; detail?: string; icon?: string; time?: string;
};
```

### 3.2 真实持久化（SQLite，设计定稿）

```sql
CREATE TABLE tx (id TEXT PRIMARY KEY, source TEXT NOT NULL, source_id TEXT,
  merchant TEXT NOT NULL, category TEXT, amount INTEGER NOT NULL, direction INTEGER NOT NULL,
  account_id TEXT, status TEXT NOT NULL DEFAULT 'ok', dedup_id TEXT UNIQUE,
  raw_hint TEXT, day TEXT NOT NULL, ts INTEGER NOT NULL,
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);

CREATE TABLE pending (id TEXT PRIMARY KEY, merchant TEXT NOT NULL, amount INTEGER NOT NULL,
  reason TEXT NOT NULL, fields TEXT, ts INTEGER NOT NULL, created_at INTEGER NOT NULL);

CREATE TABLE account (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0, tail TEXT, updated_at INTEGER NOT NULL);

CREATE TABLE kv (key TEXT PRIMARY KEY, val TEXT NOT NULL);
```

- `amount`：最小货币单位整数（分），±（`INV-MONEY-01`）。
- `ts`：UTC 毫秒（`INV-TIME-01`）。
- `dedup_id`：`sha256(source|merchant|amount|timeWindow)`，`UNIQUE` 约束保证幂等（`ADR-004`）。
- `direction`：-1（支出）、+1（收入）、0（转账）（`INV-MONEY-02`）。

## 4. 契约

- `useLedger` 是唯一状态机入口；页面层不直接计算分类/余额。
- localStorage → SQLite 迁移：`kv['migration.v1']` 水位；迁移脚本幂等；失败保留 localStorage 兜底。
- 完整状态机（全字段与页面交互）：`doc/development/DEV-20260818-react-frontend-spec.md`（§3 数据契约、§4 状态机表、§5 页面详解）。
- 试用能力（localStorage 持久化 + resetData）：`DEV-20260818-react-frontend-spec.md` §12。

## 5. 试用能力（当前已实现）

- key `laicai.ledger.v1` 持久化 txList/pending/filter/q/notifOn/cloudOn；刷新不丢。
- `resetData()`（S5 我的 → 重置演示数据）：清存储并恢复演示初始数据（8 笔 + badge 3）。
- 存储不可用时静默降级内存态；详见 `DEV-20260818-react-frontend-spec.md` §12 与 `REQ-20260818-trial-runnable`。

## 6. 验证

- 冒烟（`smoke_react.py`）：记一笔/刷新保留/重置 8 笔 + badge 3 / 主题切换 / pageerror 0。
- 真实 SQLite 迁移：M1 里程碑单测覆盖（§4.2 真实 schema + 迁移脚本）。