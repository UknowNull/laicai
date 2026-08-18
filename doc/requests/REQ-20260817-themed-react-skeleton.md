# REQ-20260817-themed-react-skeleton

status: verified
priority: P0
created_at: 2026-08-17
verified_at: 2026-08-18
related_domains:
  - theme-system
  - ledger-engine

## 用户意图

搭建主题化 React 工程骨架：一套 App 引擎 + 三套 Design Token 主题 + 三套布局组件，运行时一键切换 UI 主题（localStorage 记忆），生产可 build，Playwright 冒烟验证无 pageerror，并更新总览 index.html 增加工程入口。

## 目标行为

- `react-app/` Vite + React 18 工程。
- `src/theme/`（themes.js + ThemeProvider.jsx）；`src/engine/`（ledger.js + useLedger.js）；`src/components/`（PhoneShell/TabBar/TxRow/KeyPad/ReportCard/CountUp/AutoBookDemo/Pages/Sheets）；`src/layouts/HomeLayouts.jsx`。
- 顶部主题切换条（简约/时尚/奢华），localStorage key `laicai.theme`。
- `npm run build` 通过；Playwright 冒烟通过。

## 验收标准（已验证）

- [x] `npm run build` 0 errors（43 modules）
- [x] 主题切换 Token 正确（minimal/fashion/luxury → data-theme/tab-type/home-type）
- [x] 详情弹层（来源+置信度）、报告生成（¥8,432.60）、KeyPad 输入（1+2+3→¥123.00）、待确认 3→2
- [x] localStorage 记忆
- [x] pageerror = 0
- [x] index.html 工程入口

## 状态

`implementing` 完成，冒烟已验证；需求级验收（文档同步）随本文与 ENGINEERING-HARNESS 基建完成闭环。