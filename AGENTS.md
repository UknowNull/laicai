# 来财记账 Agent Instructions

本文件是「来财记账」的项目级开发与智能体执行契约。系统、开发者和用户的最新明确要求优先于本文件；本文件优先于 `doc/` 中的普通说明文档。

## 1. 项目基线

- 来财记账是 Android 优先的自动记账 App：Android 通知实时自动记账为尖刀、跨端账单导入为底座、云端 LLM 周期分析为增值的「确定优先」记账应用。
- 产品决策（已确认）：Android 先行、iOS 后补；开源（MIT/双许可），不引入 GPL 依赖；云端 LLM 需显式授权、可一键关闭；MVP 直达阶段三。
- 架构铁律：金额、借贷方向、去重、余额必须由确定性代码控制；LLM 只做分类建议、趋势解释、异常提示、自然语言分析，且结论必须可下钻到原始交易。
- 当前工程形态：`react-app/` 为主题化 React 工程骨架（一套引擎 + 三套 Design Token + 三套布局组件）；`prototypes/` 三版独立 HTML 高保真原型；`doc/` 为工程上下文。
- 代码优先于历史设计文档；需求基线优先于竞品、Prompt 和原型参考。

## 2. 渐进式文档路由

默认只读取本文件。禁止在任务开始时递归扫描整个 `doc/`；先判断任务类型，再读取下表中的最小文档集合。只有发现跨领域影响、契约冲突或信息不足时才继续展开。

| 任务类型 | 首选文档 | 需要时再读取 |
| --- | --- | --- |
| 项目定位、产品范围、新的跨领域需求 | `doc/00-project-context.md`、`doc/01-product-requirements.md` | `doc/02-system-architecture.md` |
| 架构、模块边界、跨模块重构 | `doc/02-system-architecture.md`、`doc/03-engineering-invariants.md` | 相关 `doc/decisions/ADR-*.md` |
| 主题体系、UI 换肤、三版风格 | `doc/domains/theme-system.md` | `ADR-002-*`、`doc/generated/react-skeleton.md` |
| 记账引擎、数据模型、状态机 | `doc/domains/ledger-engine.md` | `doc/generated/react-skeleton.md`、`ADR-003-*` |
| Android 自动捕获、通知解析、去重、置信度 | `doc/domains/auto-capture.md` | `ADR-003-*`、`ADR-004-*` |
| 账单导入、CSV/OFX/PDF/OCR、映射器 | `doc/domains/import-pipeline.md` | `doc/domains/ledger-engine.md` |
| LLM 周期分析、确定性指标、问答 | `doc/domains/analysis-llm.md` | `ADR-005-*`、`doc/03-engineering-invariants.md` |
| 隐私、安全、备份、授权 | `doc/domains/privacy-security.md` | `ADR-005-*` |
| 打包、发布、版本号、GitHub Release | `doc/domains/build-release.md` | `doc/07-operations-runbook.md`、`REQ/DEV-20260818-build-release-pipeline` |
| 后端服务、云端 API、LLM 网关、SQLite 存储、通知采集 | `DEV-20260818-backend-architecture`、`doc/domains/analysis-llm.md` | `doc/domains/ledger-engine.md`、`doc/domains/auto-capture.md`、`ADR-006-*` |
| 按需求开发设计、实施拆解、迁移回滚 | 命中的 `doc/requests/REQ-*.md`、对应 `doc/development/DEV-*.md` | 受影响领域文档、相关 ADR |
| 测试失败、回归、验收 | `doc/05-verification.md` | 只读取相关 `doc/issues/BUG-*.md` 和测试文件 |
| 历史迭代、质量趋势、复盘 | 命中的 `doc/development/RETRO-*.md` | 对应 REQ/DEV |
| 启动、运行、构建 | `doc/07-operations-runbook.md` | 对应领域文档 |
| 文档体系本身 | `doc/README.md`、`doc/04-development-workflow.md` | `ADR-001-*` |
| 新模型首次接手 | `doc/06-model-onboarding.md` | 再按本表选择任务相关文档 |
| 历史设计、竞品、原型索引 | `doc/references/README.md` | 仅打开用户任务明确需要的参考文件 |

处理已有需求或问题时，先用 `rg` 搜索 `requests/`、`issues/` 中的标题和 `related_domains`/`affected_domains`，只打开命中的记录。不要全量读取这些目录。

代码和测试是当前实现事实；不要把 `doc/references/` 中的历史计划直接当作当前实现。

## 3. 每次需求的强制流程

1. 先按第 2 节路由并读取最小上下文，再在 `doc/requests/` 创建或更新 `REQ-YYYYMMDD-name.md`，写明目标、范围、影响模块、不变量和验收标准。
2. 明确需求状态：`proposed` -> `approved` -> `implementing` -> `verified` -> `closed`。
3. 跨模块需求必须同时创建 `doc/development/DEV-YYYYMMDD-name.md`，记录数据契约、模块边界、实施阶段、测试、迁移和回滚；未进入开发的设计必须标注 `status: planned`。
4. 修改代码时遵守本文件第 4 节的核心约束；只有触及跨模块契约或需要完整验证映射时才读取 `doc/03-engineering-invariants.md`。
5. 发现独立缺陷时，在 `doc/issues/` 创建 `BUG-YYYYMMDD-name.md`；不要把临时 Bug 堆进产品需求文档。
6. 修改接口、数据模型、工作流或架构时，更新对应领域文档；重大取舍新增 `doc/decisions/ADR-*.md`。
7. 完成实现后运行 `doc/05-verification.md` 中的检查，并把命令、结果和已知失败写回需求文档。
8. 只有验收标准、测试证据和文档影响均完成，需求才可标记为 `verified` 或 `closed`。

## 4. 不可破坏的核心约束

- 金额、借贷方向、去重、余额由确定性代码控制；LLM 不得决定交易数值。
- 内部金额以最小货币单位整数存储（分）；时间统一 UTC 毫秒；外部去重 ID 用 SHA-256(`${source}|${merchant}|${amount}|${timeWindow}`)。
- 通知正文仅在内存解析、不落盘；云端分析必须显式授权且可一键关闭；不授权时产品功能不降级。
- 对外表述保持诚实边界：自动归集可获取的交易，不承诺读取所有支付行为；iOS 不做实时通知读取。
- 主题系统遵循「一套引擎 + 三套 Design Token + 三套布局组件」；新增主题不得复制引擎逻辑。
- 三版原型（`prototypes/`）内容与 `react-app/` 保持一致；数据模型变更必须三处同步（原型、引擎、文档）。
- 外部 LLM 调用必须有超时、阶段名、错误处理与用量记录。

完整约束和验证方式见 `doc/03-engineering-invariants.md`。

## 5. 常用验证命令

```bash
# 文档一致性审计
python3 scripts/doc_audit.py

# React 工程构建与冒烟（需 HTTP，file:// 会被 CORS 拦截 ES 模块）
cd react-app && npm install --cache ./.npm-cache
npm run build
npm run preview            # 生产构建预览（127.0.0.1:4173）
npm run dev                # 开发服务器（127.0.0.1:5173）

# 三版原型快速冒烟：打开 index.html（原型/总览），Playwright 截图与点击冒烟见 doc/05-verification.md
```

## 6. 文档维护承诺（本项目的持久要求）

**每次需求、Bug、重构、验证完成时，必须同时更新 `doc/` 体系**，具体：
- 需求相关 → 更新或新建 `doc/requests/REQ-*`；跨模块加 `doc/development/DEV-*`。
- 代码或契约变化 → 更新对应 `doc/domains/*`；重大取舍加 ADR。
- 独立缺陷 → `doc/issues/BUG-*`，修复后补回归并更新状态。
- 界面/原型/主题变化 → 同步 `prototypes/`、`react-app/` 与 `doc/domains/theme-system.md`。
- 每次合入前运行 `doc/05-verification.md` 的检查，并把结果写回对应记录。
- 本项目根 README 是交付物索引；`doc/` 才是工程上下文权威。