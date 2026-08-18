> 本文已合并至统一的开发文档入口：`doc/development/DEV-20260818-react-frontend-spec.md`（页面/组件/交互/AI 边界）。

# DEV-20260818-react-frontend-spec

status: implemented
date: 2026-08-18
related_requests:
  - REQ-20260817-themed-react-skeleton
affected_domains:
  - theme-system
  - ledger-engine
  - analysis-llm
  - auto-capture

## 目标

将 `react-app/` 所体现的页面、交互与数据契约，沉到面向工程实现的开发文档；澄清「AI 分析部分：页面实现（前端模拟）、后端不实现」的边界。

> 权威来源是 `react-app/src/` 代码；变更代码必须同步本文与 `domains/`。

## 1. 工程结构与启动

```
react-app/
├── vite.config.js            base:'./', outDir:'dist'
├── index.html                #root -> /src/main.jsx
├── package.json              react ^18.3.1, vite ^5.4.19
└── src/
    ├── main.jsx              StrictMode 渲染 <App/>
    ├── App.jsx               主题化壳 + 切换条 + PhoneShell + 五屏 + Sheets + Toast
    ├── theme/themes.js       THEMES{minimal,fashion,luxury} + applyTheme
    ├── theme/ThemeProvider.jsx  useTheme()，切换+localStorage('laicai.theme')
    ├── engine/ledger.js      数据模型 + 格式化 + 文案
    ├── engine/useLedger.js   状态机（唯一交互逻辑）
    ├── components/           PhoneShell/TabBar/TxRow/KeyPad/ReportCard/CountUp/AutoBookDemo/Pages/Sheets
    ├── layouts/HomeLayouts.jsx 三套首页骨架
    └── styles/global.css     --t-* + data-* 选择器
```

```bash
cd react-app
npm install --cache ./.npm-cache   # ~/.npm 权限受限
npm run dev                        # 开发 :5173
npm run build                      # 产物 dist/
npm run preview                    # 生产预览 :4173
```

> 构建产物不能 file:// 直开（CORS 拦截 ES 模块），需 HTTP；冒烟见 `scripts/smoke_react.py`。

## 2. 架构分层

| 层 | 角色 | 文件 |
| --- | --- | --- |
| Theme | 三套 Token + 运行时切换 + 记忆 | `theme/themes.js`, `ThemeProvider.jsx` |
| Engine | 唯一数据模型 + 唯一状态机 | `engine/ledger.js`, `useLedger.js` |
| Components | 通用 UI（消费 useTheme/useLedger） | `components/*` |
| Layouts | 三套首页骨架 + Factory | `layouts/HomeLayouts.jsx` |
| Styles | Token 变量 + data-* 骨架选择器 | `styles/global.css` |

**换 UI 原理**：~60% 差异（色/字体/圆角/描边/阴影/动效）→ CSS 变量 Token；~30% 差异（Tab 三形态 / Row 两形态 / Home 三布局）→ `data-*` 属性 + 条件渲染。引擎不感知主题。

## 3. 数据契约（唯一真相）

- 账户 4：cmb/微信/支付宝/现金，合计 28,849.87。
- MONTHLY：支出 8,432.60 / 收入 25,000.00 / 结余 +16,567.40 / 环比 -12.4% / 覆盖度 96% / 待确认未计入 2。
- 交易 8 笔（INITIAL_TX），含瑞幸 -32.50、京东 -299.00(待确认)。
- 待确认 3 笔（INITIAL_PENDING）。
- 分类占比：餐饮42/购物18/交通14/居住12/娱乐9/其他5。
- 规则文本：`REPORT_TEXT`、`QA_ANSWERS{q1,q2}`。

> 结构化字段清单见 `generated/data-contracts.md`。

## 4. 状态机 —— `useLedger()`

| 类别 | state / action | 说明 |
| --- | --- | --- |
| Tab | `tab` / `goTab(name)` | home\|ledger\|record\|analysis\|mine |
| 流水 | `txList`, `filter`, `q`, `setFilter`, `setQ` | 支出=负；收入=正；待确认=非 ok；搜索=商户子串 |
| 详情 | `openTx(id)`/`editTx()`/`deleteTx(id)` | Sheet(tx)；删除同步清 pending 关联 |
| 待确认 | `pending`, `confirmPend(pid)`, `ignorePend(id)`, `openPend()` | 确认→同商户同金额 tx 置 ok；badge 3→2 |
| 弹层 | `modal`/`setModal(null)` | null \| {type:'tx',payload} \| {type:'pend'} \| {type:'acct',payload} |
| 记一笔 | `recMode`/`recCat`/`recAcct`/`recAmt`/`keyPress(k)`/`saveRec()` | 键盘 7 位+2 小数；转账不记分类 |
| 开关 | `notifOn`,`cloudOn`,`toggleNotif`,`toggleCloud` | cloudOff 显示 cloud-warn |
| 报告 | `reportLoading`,`reportDone`,`reportText`,`genReport()` | 1200ms 延迟→打字机 28ms/char 输出固定文案；AI 后端不连 |
| 吐司 | `toast`/`showToast(msg)` | 1800ms 自动消失 |

命名与原型一致（goTab/openTx/confirmPend/ignorePend/deleteTx/saveRec/genReport/toggleNotif/toggleCloud），便于复核。

## 5. 五个页面详解

### S1 首页（HomePage）
结构：AutoBookDemo → Hero（HomeFactory）→ 待确认行 → 分类占比 → 最近 4 条 → 页脚。
交互：待确认→openPend；最近流水›→goTab('ledger')；TxRow→openTx。

### S2 流水（LedgerPage）
结构：页头 → 搜索 → 芯片（全部/支出/收入/待确认）→ 按日分组列表。
交互：filter/q 客户端过滤；dayHeader 仅日更渲染。

### S3 记一笔（RecordPage）
结构：金额 → 收支/转账 seg → 分类网格 → 账户 chips → KeyPad。
交互：keyPress 规则（1-9追加、del 回删、. 限一次、7 位+2 小数）；saveRec 校验>0、插入『今天』；切模式重置分类。

### S4 分析（AnalysisPage）——AI 边界
> **页面已实现；后端 LLM 不实现（本迭代）。**

结构：metric-grid（支出/收入/结余/预算/Top商户）→ 分类占比 → ReportCard → 数据范围 details → QA。
交互：genReport → loading→1200ms→打字机；QA chips → 本地写死解答。
**接入缝**：换 `useLedger.genReport` 实现即可接真实 API；ReportCard onGenerate 已解耦；cloudOff 降级为指标面板。

### S5 我的（MinePage）
结构：账户列表（点击→Sheet(acct)）→ 自动记账（监听/云端开关）→ 备份/恢复 → 隐私声明。
交互：toggleNotif/toggleCloud 切换；点账户→openAcct。

## 6. 弹层（Sheets.jsx）

| type | 触发 | 内容 |
| --- | --- | --- |
| tx | openTx(id) | 金额/商户/分类/账户/时间/来源(tag)/置信度/备注/编辑+删除 |
| pend | openPend() | 待确认列表逐条确认/忽略 |
| acct | openAcct(name) | 余额/类型/说明/记账方式/调整按钮 |

veil 遮罩 + `.sheet.on`；close 或点 veil 关闭。

## 7. 组件契约

| 组件 | props | 依赖 |
| --- | --- | --- |
| PhoneShell | children | 设备框样式 |
| TabBar | tab, onGo | data-tab-type CSS |
| TxRow | tx, onOpen | useTheme tokens['--t-row-type']；fmtMoney/acctName |
| KeyPad | onKey, onSave | — |
| ReportCard | reportText, reportLoading, reportDone, onGenerate | MONTHLY coverage |
| CountUp | target, prefix | rAF ease-out |
| AutoBookDemo | — | 三帧链路动画 |
| HomeFactory | type, {data} | ledger/hero/ring |
| Sheets | data | modal 类型驱动 |

## 8. 三套 Design Token

| 属性 | minimal | fashion | luxury |
| --- | --- | --- | --- |
| data-tab-type | text | pill | diamond |
| data-row-type | line | capsule | line |
| data-home-type | ledger | hero | ring |
| bg | #F7F4EE | #0E0F0D | #101A17 |
| accent | #B4552D | #C8F135 | #C7A25B |
| display-font | 宋体 serif | PingFang | 宋体/Playfair |
| num-font | 宋体 | SF Mono | 宋体 |
| radius-m | 8px | 20px | 6px |

完整 30+ 变量见 `theme/themes.js`。

## 9. 交互验收（Playwright 已通过）

| 行为 | 预期 | 验证 |
| --- | --- | --- |
| 主题三连切 | data-theme/tab/home 同步 | ✓ |
| TxRow 点击 | Sheet 显示来源/置信度 | ✓ |
| 生成报告 | 打字机 53 字含 ¥8,432.60 | ✓ |
| 键盘 1+2+3 | rec-amt ¥123.00 | ✓ |
| 待确认确认 | badge 3→2 | ✓ |
| localStorage | laicai.theme 持久化 | ✓ |
| pageerror | 0 | ✓ |

## 10. AI 分析 —— 页面 vs 后端清单

| 能力 | 页面 | 后端 | 状态 | 原因 |
| --- | --- | --- | --- | --- |
| 确定性指标 | ✅ metric-grid | 规则代码 | 已实现 | 纯确定性 |
| 分类占比 | ✅ ratio | 规则 | 已实现 | — |
| 周期报告 | ✅ ReportCard+打字机 | ❌ 不实现 | 页面已实现 | 用户约定暂不做后端 |
| QA | ✅ chips+固定答案 | ❌ 不实现 | 页面已实现 | 同上 |
| 数据导出/备份 | 占位菜单 | ❌ | 规划 | MVP 后补 |

> 约定：AI 文本固定（`REPORT_TEXT`/`QA_ANSWERS`），不接真实 LLM API；页面与换肤/冒烟用固定文本。后续 LLM 集成只替换 `genReport` 实现，UI 无变更。

## 11. 后续开发指引

- 接后端：useLedger → React Query + API；金额分存储；SQLite/Capacitor。
- LLM 接入：genReport → POST /api/report（timeout/stage/usage 记录）。
- Android 采集：`domains/auto-capture.md` + ADR-003/004。
- 新增主题：themes.js 加 Token 表；沿用现有骨架无需新布局。

## 12. 试用阶段（进入试用的依据）

> 关联：`REQ-20260818-trial-runnable`。目标：把 `react-app/` 从「演示骨架」升级为**可试用的前端应用**——数据不因刷新丢失，试用者能体验完整记账闭环。

### 12.1 持久化设计

- key：`laicai.ledger.v1`（版本化，防 schema 变更后解析旧数据出错）。
- 持久化范围：`txList`、`pending`、`filter`、`q`、`notifOn`、`cloudOn`。
- 不做持久化：`tab`（每次回首页）、`modal/toast`（会话态）、`reportText/reportLoading`（会话生成）、`recAmt`（未提交输入）。
- 加载：`useLedger` 初始化时经 `loadPersisted()` 读取，`JSON.parse` 失败或字段缺失 → 回退演示初始数据。
- 保存：`useEffect` 监听以上 state 变更写入；本地存储不可用（隐私模式/配额）→ 静默降级为内存态（try/catch）。
- 注意：React 18 StrictMode 下开发模式 effect 双跑，写入为幂等快照，无副作用。

### 12.2 重置演示数据

- 位置：S5 我的 → 数据 → 「重置演示数据」（`.menu-row`，onClick=`data.resetData`）。
- 行为：清除 `laicai.ledger.v1` → 重置 txList/pending/filter/q/开关/报告/金额 → toast「已恢复演示数据」。
- 用途：给试用者一个「回到初始演示数据」的入口，配合备份/恢复占位。

### 12.3 试用验证（Playwright，全部通过，pageerror=0）

| 步骤 | 断言 |
| --- | --- |
| 记一笔 25.50 → 保存 | 首页流水第一位出现「手动记账 ✓」 |
| `page.reload()` | 手动记账交易仍存在（localStorage 持久化） |
| 我的 → 重置演示数据 → reload | 恢复 8 笔初始交易 + badge 回 3 |
| 主题三连切 | data-theme/tab/home 同步，刷新后主题记忆 |
| 详情弹层 / ReportCard / KeyPad | 来源+置信度 / ¥8,432.60 / ¥123.00 |

### 12.4 试用入口

```bash
cd react-app
npm install --cache ./.npm-cache   # 首次
npm run dev                        # 浏览器 http://127.0.0.1:5173
npm run build && npm run preview   # 生产构建 http://127.0.0.1:4173
```

> 试用者会在 index.html（总览）点击「主题化 React 工程骨架」进入。AI 报告/问答为固定文案（后端本迭代不实现），不因刷新丢失主题与账本。