# 来财记账 开发与文档维护流程

## 1. 需求生命周期

```text
proposed -> approved -> implementing -> verified -> closed
                         \-> blocked
```

- `proposed`：已理解用户意图，但范围或方案尚未确认。
- `approved`：范围、验收标准和影响模块明确。
- `implementing`：正在修改代码或配置。
- `verified`：代码、测试和文档均通过检查。
- `closed`：用户目标已交付，后续事项已拆成独立记录。
- `blocked`：外部依赖或明确权限不足，不能继续推进。

## 2. 开发前

1. 读取根级 `AGENTS.md`，按其中路由表选择最小文档集合，不全量扫描 `doc/`。
2. 判断是需求、Bug、重构、文档还是诊断任务。
3. 创建或更新 `REQ-*`、`BUG-*` 记录。
4. 跨模块需求同时创建 `doc/development/DEV-*`，写出数据契约、模块边界、实施阶段、测试、迁移和回滚。
5. 只读取相关领域文档、代码入口和测试；触及跨模块契约时再读取完整工程不变量。
6. 写出非目标范围、验收标准和文档影响。

## 3. 开发中

- 先修改最靠近职责边界的模块，不在顶层入口堆积分支。
- 改动数据模型时同步 `prototypes/`、`react-app/src/engine/` 与文档。
- 改动外部调用（LLM）保留超时、阶段名、错误处理与用量。
- 改动主题时只新增 Token 与布局变体，不复制引擎逻辑。
- 发现独立问题时立即建立 `BUG-*`，不要混淆原需求状态。

## 4. 开发后（文档维护承诺，本项目持久要求）

1. 更新命中的 `REQ-*` 状态与结果。
2. 更新对应 `domains/*` 文档（代码或契约变化时）。
3. 重大取舍新增 `doc/decisions/ADR-*`。
4. 独立缺陷写 `doc/issues/BUG-*`，修复后补回归并更新状态。
5. 界面/原型/主题变化同步 `prototypes/`、`react-app/` 与 `domains/theme-system.md`。
6. 运行 `doc/05-verification.md` 中的检查，结果写回对应记录。
7. 只有验收标准、测试证据和文档影响均完成，才可标记 `verified`/`closed`。

## 5. 常见任务到文档的映射

| 任务 | 动作 |
| --- | --- |
| 新需求 | `requests/REQ-*` +（跨模块）`development/DEV-*` |
| 主题/UI 变化 | `domains/theme-system.md` + 原型/React 同步 |
| 数据模型变化 | `domains/ledger-engine.md` + `06-generating` 快照 + 三处同步 |
| 架构取舍 | `decisions/ADR-*` + `02-system-architecture.md` |
| 独立 Bug | `issues/BUG-*` |
| 迭代复盘 | `development/RETRO-*` |
| 文档体系本身 | 本文件 + `README.md` + `ADR-001` |