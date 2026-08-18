# RETRO-20260818-engineering-harness-bootstrap

date: 2026-08-18
related_requests:
  - REQ-20260817-documentation-harness

## 复盘对象

首次在项目建立 engineering harness 文档体系。

## 结论

- **成功**：一次性补齐 AGENTS.md + 00-08 基线 + 6 领域 + 5 ADR + REQ/DEV + 审计脚本，路由表单一（只在 AGENTS.md），避免多路由漂移。
- **沿用 ReelForge 的关键机制**：渐进式阅读（默认只读 AGENTS.md）、状态词汇、generated 快照、RETRO。
- **差异**：ReelForge 有 140+ issues、41 份 DEV；本项目起步阶段记录少，先以「每轮开发必更新」为纪律，记录随需求增长。

## 待改进

- 审计脚本目前按 Git 变更 + REQ/BUG 命中检查；后续可加「三处同步」（原型/引擎/文档）的自动比对。
- `doc/generated/` 快照待补数据契约与主题 Token 结构（人工版本）。
- 首个真实 Android 采集迭代完成后，补齐 AUTO 解析样本库与回归。

## 影响

- 后续每轮开发/验证必须同时更新 `doc/`（AGENTS.md 第 6 节），本复盘为承诺的起点。