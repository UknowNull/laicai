# React 工程骨架快照（generated）

> 生成日期：2026-08-18 · 来源：`react-app/src/` 人工核对 · 代码变更后必须重新核对

## 模块结构

```
react-app/
├── vite.config.js            base:'./', outDir:'dist'
├── index.html                #root + /src/main.jsx
└── src/
    ├── main.jsx              React.StrictMode 渲染 <App/>
    ├── App.jsx               主题化壳 + 顶部切换条 + PhoneShell + 五屏 + Sheets + Toast
    ├── theme/
    │   ├── themes.js         THEMES{minimal,fashion,luxury}：--t-* Token + applyTheme
    │   └── ThemeProvider.jsx useTheme()；applyTheme 注入变量+data-*；localStorage 'laicai.theme'
    ├── engine/
    │   ├── ledger.js         数据模型 + 格式化 + REPORT_TEXT/QA_ANSWERS
    │   └── useLedger.js      状态机 Hook（tab/流水/pending/rec/report/开关/toast）
    ├── components/
    │   ├── PhoneShell.jsx    iPhone 框（island/statusbar/homeind）
    │   ├── TabBar.jsx        TABS 5；text/pill/diamond 由 CSS data-tab-type 驱动
    │   ├── TxRow.jsx         line/capsule 由 useTheme tokens['--t-row-type'] 驱动
    │   ├── KeyPad.jsx        1-9/del/0/save 12 键
    │   ├── ReportCard.jsx    idle/loading/done 三态 + 打字机
    │   ├── CountUp.jsx       rAF count-up
    │   ├── AutoBookDemo.jsx  S0 自动记账链路动画
    │   ├── Pages.jsx         五主屏
    │   └── Sheets.jsx        交易详情/待确认/账户弹层
    ├── layouts/HomeLayouts.jsx  HomeLedger/HomeHero/HomeRing + HomeFactory
    └── styles/global.css     --t-* 变量 + html[data-*] 选择器 + 各组件样式
```

## 主题 Token 骨架类型

| 主题 | data-theme | --t-tab-type | --t-row-type | --t-home-type |
| --- | --- | --- | --- | --- |
| 简约 | minimal | text | line | ledger |
| 时尚 | fashion | pill | capsule | hero |
| 奢华 | luxury | diamond | capsule | ring |

## 状态机（useLedger）关键字段

```
tab: string          // 'home'|'ledger'|'record'|'analysis'|'mine'
txList: Tx[]         // INITIAL_TX
pending: Pending[]   // INITIAL_PENDING
filter: string       // '全部'|'支出'|'收入'|'待确认'
q: string            // 搜索关键词
modal: null|{type:'tx'|'pend'|'acct', payload?}
recMode: string      // '支出'|'收入'|'转账'
recCat: string       // 分类
recAcct: string      // 账户 id
recAmt: string       // 键盘输入数字
notifOn: boolean     // 通知监听开关
cloudOn: boolean     // 云端授权开关
reportLoading: boolean
reportDone: boolean
reportText: string   // 打字机逐步输出
toast: null|string   // 1800ms 后消失
resetData()          // S5 我的：恢复演示初始数据（清 laicai.ledger.v1）
```

## 持久化（试用能力）

- key：`laicai.ledger.v1`（版本化 JSON）；范围：txList/pending/filter/q/notifOn/cloudOn。
- 刷新保留账本与开关；存储不可用时静默降级内存态。

## 组件 Props

| 组件 | Props | 依赖 |
| --- | --- | --- |
| TabBar | tab, onGo | data-tab-type CSS |
| TxRow | tx, onOpen | useTheme tokens['--t-row-type'] |
| KeyPad | onKey(k), onSave | — |
| ReportCard | reportText, reportLoading, reportDone, onGenerate | MONTHLY coverage |
| CountUp | target, prefix | rAF |
| Sheets | data (useLedger 返回体) | modal 类型驱动 |

## 常见陷阱

- `npm install` 用 `--cache ./.npm-cache`（~/.npm 权限问题）。
- 构建产物不能 file:// 打开（ES 模块 CORS），用 preview/dev。
- AI 报告/问答为固定文案（`REPORT_TEXT`/`QA_ANSWERS`），后端 LLM 本迭代不接入。