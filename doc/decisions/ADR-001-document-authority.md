# ADR-001-document-authority

status: accepted
date: 2026-08-17
related_domains:
  - theme-system
  - ledger-engine
  - auto-capture

## 背景

项目同时存在代码（react-app/prototypes）、根级设计文档（PRD/DESIGN_SPEC/UI_SWAP_PLAN）和竞品调研报告，历史状态存在不一致风险。

## 决策

代码和测试是当前实现事实；编号基线（doc/00-08）和领域文档（doc/domains/）是工程上下文；requests/issues/ADR 记录变更；根级全文与竞品调研进入 references，只解释来源，不覆盖当前代码。每次开发完成必须同步维护 doc 体系（见 AGENTS.md 第 6 节）。

## 后果

- 新模型接手先读 AGENTS.md，再按任务路由渐进加载最小文档集合。
- 根级 PRD 等旧文档保留但不再承担唯一真相。
- 数据模型变更必须三处同步：prototypes、react-app/src/engine、文档。