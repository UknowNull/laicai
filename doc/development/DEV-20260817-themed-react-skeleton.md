# DEV-20260817-themed-react-skeleton

status: implemented
date: 2026-08-17
related_requests:
  - REQ-20260817-themed-react-skeleton
affected_domains:
  - theme-system
  - ledger-engine

## 目标

在 /Users/tbw/work/privateProject/laicai 下搭建主题化 React 工程骨架，支持运行时一键切换三套主题。

## 数据契约

- 主题 Token：`--t-*` 变量（背景/墨色/强调/字体/圆角/描边/圆角/阴影/动效）+ `data-theme`/`data-tab-type`/`data-row-type`/`data-home-type`。
- 引擎数据（与原型一致）：`MONTHLY`（¥8,432.60 支出 / ¥25,000 收入 / +¥16,567.40 结余 / 环比 -12.4%）、账户 4 个（26,480.52 等合计 28,849.87）、待确认 3 条、`REPORT_TEXT` 与 `QA_ANSWERS` 固定文案。
- localStorage key：`laicai.theme`。

## 模块边界

| 层 | 职责 | 位置 |
| --- | --- | --- |
| Theme | 三套 Token + 运行时切换 + 记忆 | `src/theme/` |
| Engine | 数据模型 + 状态机（唯一一份） | `src/engine/` |
| Components | 通用组件（按 data-* 渲染形态） | `src/components/` |
| Layouts | 三套首页骨架 + Factory | `src/layouts/HomeLayouts.jsx` |

## 实施阶段

1. 工程初始化（package.json / vite.config / index.html）✅
2. theme 层（themes.js + ThemeProvider）✅
3. engine 层（ledger.js + useLedger.js）✅
4. components + layouts ✅
5. App.jsx 组装 + 切换条 ✅
6. build + 冒烟 ✅（见下）

## 验证

- `npm run build`：302ms 成功，dist/ 产出。
- Playwright（preview server）：初始页/主题切换三连/详情弹层/报告/键盘/待确认 3→2/localStorage 全通过，pageerror=0 且 CONSOLE error=0。

## 已知限制

- 引擎为前端内存态，未接 SQLite/后端。
- 构建产物需 HTTP 访问（file:// CORS 拦截 ES 模块）。

## 回滚

- 删除 `react-app/`（或按 git 还原）；原型与总览不受影响。