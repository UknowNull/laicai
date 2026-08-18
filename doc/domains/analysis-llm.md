# 领域：周期分析 LLM（analysis-llm）

## 1. 职责

阶段三能力：确定性指标 + 云端 LLM 周期报告/自然语言问答。区分「确定性」与「解释性」是核心边界。

## 2. 入口与代码

- `react-app/src/engine/ledger.js`：`MONTHLY` 确定性指标 + 报告文案（模拟）。
- `react-app/src/components/ReportCard.jsx`：报告卡 UI（idle/loading/done 三态，打字机）。
- `react-app/src/components/Pages.jsx`（AnalysisPage）：指标面板 + 问答 chips（模拟）。
- 实现细节与接入缝：`doc/development/DEV-20260818-react-frontend-spec.md`（§4 状态机、§5 S4、§10 AI 边界）。

## 3. 架构边界（铁律，见 `ADR-003` 与 `INV-MONEY-02`）

```text
账本 -> 确定性指标计算（规则代码，无 LLM）——金额/方向/去重/余额永不经过 LLM
  -> 组装「指标 + 覆盖度 + 未确认数」最小上下文
  -> 用户显式授权 + 最小化上传 -> LLM 生成报告/回答
  -> 输出可下钻卡片（每个结论可回到原始交易）
  -> 用户可关闭 -> 回到纯确定性指标面板（功能不降级）
```

## 4. 契约

- 报告必须包含：分析周期、数据覆盖度、未确认账单数声明（避免误导）。
- 可追溯：结论可下钻到类别/商户/时间范围/原始交易。
- 授权：首次明确授权弹窗；设置一键关闭（`ANA-04`，React 骨架已实现占位）。
- 数据最小化：仅上传问题所需指标/交易子集（`ANA-05` 规划）。
- 外部调用需超时/阶段名/错误处理/用量（`INV-EXT-01`）。

## 5. 已知限制

- **当前迭代的明确边界：AI 分析的后端 LLM 不实现；页面已实现（前端模拟）**。报告/问答文本为写死在 `ledger.js` 的 `REPORT_TEXT` / `QA_ANSWERS`，不接真实 LLM API；页面切换、换肤、冒烟验证均使用固定文本。
- 后续 LLM 集成只替换 `useLedger.genReport` 的实现（接入点见 `DEV-20260818-react-frontend-spec.md` §10），UI 无变更。
- 云端集成后需隐私授权弹窗与用量预算（参照 `INV-GOV-*` 思路可后续扩展）。

## 6. 验证

- `python3 scripts/smoke_react.py`：报告生成打字机含 `¥8,432.60`；问答 chips 展示模拟答案。