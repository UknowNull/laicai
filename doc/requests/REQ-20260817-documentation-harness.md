# REQ-20260817-documentation-harness

status: verified
priority: P0
created_at: 2026-08-17
verified_at: 2026-08-18
related_domains:
  - theme-system
  - ledger-engine

## 用户意图

参考 `/Users/tbw/work/privateProject/ReelForge/doc` 的 engineering harness 文档架构，为「来财记账」建立同等文档体系，并在后续每次更新时持续维护。

## 当前问题

项目存在根级 PRD/DESIGN_SPEC/UI_SWAP_PLAN 与三版原型、React 骨架，但缺少根级开发契约（AGENTS.md）、领域边界（domains/）、需求记录（requests/）、问题记录（issues/）、ADR（decisions/）与代码快照（generated/）；后续变更没有强制文档同步机制。

## 目标行为

- 根目录 `AGENTS.md` 作为智能体与开发规则入口，内置任务到文档的路由表。
- `doc/00-08` 稳定基线（上下文/需求/架构/不变量/流程/验证/接手/运维/验收）。
- `doc/domains/` 按模块维护契约（theme-system / ledger-engine / auto-capture / import-pipeline / analysis-llm / privacy-security）。
- `doc/decisions/` 记录架构取舍（ADR-001..005 已建）。
- `doc/requests/`、`doc/issues/`、`doc/development/`、`doc/generated/`、`doc/references/` 齐备。
- `scripts/doc_audit.py` 一致性审计脚本。
- 每轮开发按 AGENTS.md 第 6 节维护文档。

## 非目标范围

- 不修改业务代码逻辑。
- 不迁移或删除历史 PRD 等全文（保留追溯，归入 references 语义）。

## 影响模块

- 项目根目录结构、`doc/`、`scripts/`。
- 后续所有需求分析、开发与验收流程。

## 验收标准

- [x] AGENTS.md 存在且含路由表 + 强制流程 + 文档维护承诺
- [x] doc/00-08 齐备
- [x] doc/domains/ 6 领域文档齐备
- [x] doc/decisions/ ADR-001..005
- [x] doc/requests/ 首批 REQ 含本文
- [x] scripts/doc_audit.py 可运行
- [x] 总览文档链接校验通过