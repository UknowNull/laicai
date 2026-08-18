# 来财记账 模型接手指南

本文件供新模型首次接手项目时阅读。读完本文后，按任务类型回到根 `AGENTS.md` 的第 2 节路由表选择最小文档集合。

## 1. 一分钟理解项目

- **做什么**：Android 优先的自动记账 App——通知实时自动记账 + 跨端账单导入 + 云端 LLM 周期分析，确定优先。
- **当前有什么**：`react-app/` 主题化 React 工程骨架（一套引擎 + 三套 Design Token + 三套布局，运行时换肤）；`prototypes/` 三版静态高保真原型；`doc/` 工程上下文。
- **还没什么**：Android 原生采集、账单导入、真实 LLM 集成、SQLite 存储、iOS 端——均为规划能力。

## 2. 文档优先级

1. 根 `AGENTS.md`：开发/智能体规则入口，含路由表与核心约束。
2. `doc/00-project-context.md`：项目定位、流水线、能力地图、判断基线。
3. `doc/01-product-requirements.md`：功能基线（编号 + 状态）。
4. 按任务路由到 `doc/domains/*`、`doc/requests/REQ-*`、`doc/decisions/ADR-*`。

**不要**默认读取全部 `doc/`；**不要**把 `doc/references/` 的历史计划当作当前实现。

## 3. 当前代码如何读

```text
react-app/src/
├── theme/    themes.js（三套 Token）+ ThemeProvider.jsx（切换+记忆）
├── engine/   ledger.js（数据）+ useLedger.js（状态机）★ 唯一数据/逻辑
├── components/ PhoneShell/TabBar/TxRow/KeyPad/ReportCard/CountUp/AutoBookDemo/Pages/Sheets
├── layouts/  HomeLayouts.jsx（ledger/hero/ring 三套首页）
└── styles/   global.css（--t-* 变量 + data-* 骨架选择器）
```

演示数据与原型一致（瑞幸 -32.50、结余 16,567.40、3 待确认）。

## 4. 常见坑

- React 构建产物不能用 `file://` 打开（CORS 拦截 ES 模块），用 `npm run preview` / `npm run dev`。
- 数据模型变更必须三处同步：`prototypes/`、`react-app/src/engine/`、文档。
- 主题新增只加 Token 与布局变体，不复制引擎逻辑。
- 「规划」能力不得写成「已实现」。

## 5. 接手第一步（建议）

1. `ls` 项目根与 `doc/`、`react-app/src/`。
2. 跑 `cd react-app && npm run build` 确认构建绿。
3. 读 `doc/domains/ledger-engine.md` 与 `theme-system.md` 建立模块认知。
4. 若要改界面/功能：按 `AGENTS.md` 第 3 节强制流程建 REQ/DEV 并维护文档。