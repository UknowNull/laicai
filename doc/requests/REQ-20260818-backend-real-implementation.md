# REQ-20260818-backend-real-implementation

status: approved
priority: P0
created_at: 2026-08-18
related_domains:
  - auto-capture
  - ledger-engine
  - import-pipeline
  - analysis-llm
  - privacy-security

## 用户意图

当前工程只有前端页面（React + Capacitor 壳）与前端模拟（固定文案 ReportCard / QA、占位开关、无真实通知监听）；用户要求「生成开发文档实现真正的后台功能，而不是空壳」。

## 本需求范围（设计阶段）

本 REQ 与配套 `DEV-20260818-backend-architecture` 交付**可直接施工的后端设计文档**，覆盖四块「真后台」：
1. **Android 通知捕获（原生）**：Kotlin `NotificationListenerService` + 确定解析管线（AUTO-01..06）。
2. **本地持久化（SQLite）**：金额分整数、UTC 毫秒；localStorage → SQLite 迁移（LED-05）。
3. **云端分析服务（可选授权）**：Node/TS API 服务 + LLM 网关抽象（ANA-01..05），`POST /api/report`、`POST /api/qa`、用量/超时/错误处理（INV-EXT-01）。
4. **导入管线（双端）**：CSV/OFX/QIF 解析 + 映射 + 预览 + 去重（IMP-01/02/05）。

## 遵循的不变量（继承现有铁律）

- 金额/方向/去重/余额 = 确定性代码，LLM 只做解释（`ADR-003`、`INV-MONEY-01/02`）。
- 通知正文仅内存解析、不落盘；云分析显式授权、最小化上传、可一键关闭（`INV-PRIVACY-01/02`、`ADR-005`）。
- 诚实边界：只归集可获取的交易（`INV-HONEST-01`）。
- 外部 LLM 调用带超时/阶段名/错误处理/用量（`INV-EXT-01`）。
- 数据模型三处同步：原型 / react-app 引擎 / 文档（`INV-SYNC-01`）。

## 交付物（本 REQ 的验收标准）

- [x] `doc/development/DEV-20260818-backend-architecture.md`：后端总架构、模块边界、数据模型、API 契约、错误处理、安全边界、里程碑拆解、测试策略、迁移/回滚。
- [x] `doc/domains/auto-capture.md`：规划 → 可施工设计（服务生命周期、管线状态机、解析规则、去重、置信度、原生桥接）。
- [x] `doc/domains/ledger-engine.md`：SQLite schema、localStorage 迁移、repo 层契约。
- [x] `doc/domains/analysis-llm.md`：前端模拟 → 真实 API 接入契约（请求/响应/错误码/隐私最小化）。
- [x] `doc/domains/import-pipeline.md`：解析/映射/去重设计。
- [x] `doc/domains/privacy-security.md`：真后台下的隐私实现清单（权限、最小化、审计）。
- [x] `doc/decisions/ADR-006-backend-stack.md`：技术选型与部署形态决策。
- [x] `doc/02-system-architecture.md` / `doc/01-product-requirements.md` 状态同步。
- [x] AGENTS.md 路由表新增「后端 API / LLM / 采集」入口。
- [x] `python3 scripts/doc_audit.py` 通过。

## 非目标范围（实现阶段另行 REQ）

- 不在本 REQ 落地代码（后续 REQ-20260818-backend-implementation 实施）。
- 不引入 App 账号体系/多端同步（阶段四）。
- 不做银行 Open Banking 直连（阶段四评估）。
- 云端服务默认**可选部署**：本地优先，无账号不放行外联。