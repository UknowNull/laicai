# 领域：记账引擎（ledger-engine）

## 1. 职责

唯一的记账数据模型与状态机。任何页面/组件/主题都消费这里的引擎；本域是「确定优先」的核心载体。

## 2. 入口与代码

- `react-app/src/engine/ledger.js`：数据模型（账户/分类/交易/待确认/月度指标/报告文案）+ 格式化工具。
- `react-app/src/engine/useLedger.js`：状态机 Hook（Tab、流水 CRUD、待确认、记一笔、报告、开关、toast）。
- `react-app/src/components/Pages.jsx`：五个主屏消费引擎。
- `react-app/src/components/Sheets.jsx`：交易详情/待确认/账户弹层。
- **状态机全字段与页面交互实现**：`doc/development/DEV-20260818-react-frontend-spec.md`（§3 数据契约、§4 状态机表、§5 页面详解）。

## 3. 试用能力（localStorage 持久化）

- key `laicai.ledger.v1`（版本化）；持久化 txList/pending/filter/q/notifOn/cloudOn；刷新不丢。
- `resetData()`（S5 我的 → 重置演示数据）：清存储并恢复演示初始数据（8 笔 + badge 3）。
- 存储不可用时静默降级内存态；详见 `DEV-20260818-react-frontend-spec.md` §12 与 `REQ-20260818-trial-runnable`。

## 3. 数据契约

```text
Account   { id, name, type(bank/wallet/cash), tail?, balance, note }
Category  { 支出/收入/转账 -> ['餐饮','交通',...] }
Transaction { id, day, time, merchant, amount(±元), acctId, cat,
              status(ok|pending), src, conf(0-1), pendReason? }
Pending   { id, merchant, amount, day, reason }
Monthly   { expense, income, balance, mom, budgetOverrun, topMerchant, coverage, pendingExcluded }
```

- 金额展示用元小数（原型阶段）；生产按 `INV-MONEY-01` 转最小货币单位整数。
- 去重 ID 规则：`SHA-256(${source}|${merchant}|${amount}|${timeWindow})`（`INV-DEDUP-01`）。

## 4. 行为约定

- 待确认记录不计入收支/统计（`INV-CONF-01`）。
- 确认/忽略实时更新角标与列表。
- 手动记账插入流水与首页，新增行日期「今天」。
- 报告/问答当前为前端模拟（未接真实 LLM），数据与原型一致。

## 5. 已实现能力（状态）

| 能力 | 状态 |
| --- | --- |
| 流水列表/分组/筛选/搜索 | 已实现（React 骨架） |
| 交易详情/编辑/删除 | 已实现（删除为演示，撤销占位） |
| 记一笔（键盘/分类/账户/toast） | 已实现 |
| 待确认确认/忽略流 | 已实现 |
| 报告打字机生成 | 已实现（模拟，未接 LLM） |
| SQLite 持久化 | 规划（`LED-05`） |

## 6. 测试与验证

- `python3 scripts/smoke_react.py`：详情弹层（来源+置信度）、报告生成（¥8,432.60）、键盘输入、待确认 3→2、pageerror=0。