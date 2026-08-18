# REQ-20260818-trial-runnable

status: verified
priority: P0
created_at: 2026-08-18
verified_at: 2026-08-18
related_domains:
  - ledger-engine
  - theme-system
  - analysis-llm

## 用户意图

把 `react-app/` 从「演示骨架」升级为可交付试用的前端应用：数据不因刷新丢失，试用者能体验完整记账闭环（记一笔 → 刷新保留 → 结余/流水/待确认联动），并能在需要时一键恢复演示数据。AI 分析后端仍不实现（页面固文案模拟）。

## 当前问题

- 引擎为纯内存态：刷新页面丢全部数据，无法真实试用。
- 试用者无「回到初始演示数据」的入口（误操作或测试污染后只能清浏览器存储）。

## 目标行为

- `laicai.ledger.v1` localStorage 持久化：txList / pending / filter / q / notifOn / cloudOn。
- 刷新后账本、待确认角标、开关、筛选状态保留；主题（`laicai.theme`）同样保留。
- S5 我的新增「重置演示数据」菜单：清存储 → 恢复初始 8 笔 + badge 3 + 开关默认。
- 存储不可用（隐私模式）时静默降级为内存态，不阻塞使用。
- 数据模型、三版主题、AI 边界不改变。

## 非目标范围

- 不接后端 / SQLite / 网络同步。
- 不实现 AI LLM 后端（报告/QA 保持 `REPORT_TEXT`/`QA_ANSWERS` 固定文案）。
- 不做账户/备份恢复的真实实现（仍为占位菜单）。

## 影响模块

- `react-app/src/engine/useLedger.js`（持久化 + resetData）
- `react-app/src/components/Pages.jsx`（MinePage 重置菜单）
- 文档：DEV §12、domains/ledger-engine、generated/react-skeleton

## 验收标准（已验证）

- [x] `npm run build` 0 errors
- [x] 记一笔 25.50 → 保存 → 首页出现「手动记账」
- [x] `page.reload()` 后该交易仍存在（持久化）
- [x] 「重置演示数据」→ reload 后恢复 8 笔初始 + badge 3
- [x] 主题切换 + localStorage 记忆不回归（minimal/fashion/luxury）
- [x] 详情弹层 / ReportCard / KeyPad 交互不回归
- [x] pageerror = 0