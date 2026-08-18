# REQ-20260818-react-frontend-spec

status: verified
priority: P0
created_at: 2026-08-18
verified_at: 2026-08-18
related_domains:
  - theme-system
  - ledger-engine
  - analysis-llm
  - auto-capture

## 用户意图

对开发者/后续维护者交代「来财记账 React 工程骨架」的完整实现：页面、交互、组件契约、状态机、主题 Token；澄清 AI 分析部分「页面实现（前端模拟），后端暂不实现」的边界。

## 目标行为

- 建立详尽的开发设计文档 `doc/development/DEV-20260818-react-frontend-spec.md`，覆盖工程结构/启动/分层/数据契约/状态机/五页详解/组件契约/三套 Token/交互验收/AI 边界。
- 更新 `domains/theme-system.md`、`ledger-engine.md`、`analysis-llm.md` 反映代码契约。
- 更新 `doc/01-product-requirements.md` 的 ANA 状态澄清（前端模拟已实现，后端不实现）。
- 更新 `doc/08-acceptance-standards.md` 补充 React 工程验收条目。

## 验收标准

- [x] `DEV-20260818-react-frontend-spec.md` 含五页详解 + 组件契约 + AI 页面/后端清单
- [x] 三版状态机字段与 `react-app/src/engine/useLedger.js`一致
- [x] AI 分析后端不实现边界明确（报告/QA 使用固定文案）
- [x] `doc_audit.py` 通过
- [x] 三版原型冒烟 0 pageerror