# 来财记账

Android 优先的自动记账 App：**Android 实时自动记账为尖刀、跨端账单导入为底座、云端 LLM 周期分析为增值的「确定优先」记账应用**。

## 快速导航

| 入口 | 说明 |
| --- | --- |
| **[index.html](index.html)** | 交付物总览（三版原型 / 换肤实验室 / React 工程） |
| **[AGENTS.md](AGENTS.md)** | 开发与智能体规则入口（含任务路由表 + 文档维护承诺） |
| **[doc/](doc/README.md)** | 工程上下文（稳定基线 + 领域 + 需求/问题/决策 + 快照/参考） |
| **[react-app/](react-app/README.md)** | 主题化 React 工程骨架（一套引擎 + 三套 Token + 三套布局） |
| **[prototypes/](prototypes/)** | 三版静态高保真原型（简约 / 时尚 / 奢华） |

## 当前能力（摘要）

- ✅ 主题化 React 骨架：`npm run build` 通过，Playwright 冒烟 pageerror=0
- ✅ 三版原型与换肤实验室
- ✅ Engineering Harness 文档体系（对齐 ReelForge 架构）
- ⏳ Android 自动捕获 / 跨端导入 / 真实 LLM 分析（规划）

## 常用命令

```bash
python3 scripts/doc_audit.py        # 文档一致性审计
python3 scripts/smoke_prototypes.py # 原型冒烟
cd react-app && npm run build       # 构建
cd react-app && npm run preview &   # 预览（冒烟前启动）
python3 scripts/smoke_react.py      # React 冒烟（需 preview dev 在 4173）
```

> React 构建产物需 HTTP 访问（file:// CORS 拦截 ES 模块）。

## 文档契约（重要）

本项目要求**每次需求、Bug、重构、验证完成时同步维护 `doc/` 体系**（见 `AGENTS.md` 第 6 节）：
- 根级 `PRD.md`、`DESIGN_SPEC.md`、`UI_SWAP_PLAN.md` 是历史全文（保留追溯）；
- `doc/00-08` 与 `doc/domains/` 是后续维护的规范入口。