# 来财记账 · React 工程骨架（主题化）

> 对应《UI_SWAP_PLAN.md》方案一：**一套引擎 + 三套 Design Token 主题 + 三套布局组件**，
> 运行时一键切换 UI，数据与交互逻辑完全共用。

## 快速开始

```bash
cd react-app
npm install          # 首次
npm run dev          # 开发（http://127.0.0.1:5173）
npm run build        # 生产构建（dist/）
npm run preview      # 预览构建产物
```

> 若全局 npm 缓存目录权限报错，使用项目内缓存：`npm install --cache ./.npm-cache`

## 目录结构

```
react-app/
├── index.html               # 入口 HTML
├── vite.config.js
├── src/
│   ├── main.jsx             # 入口
│   ├── App.jsx              # 主题化壳 + 顶部主题切换条
│   ├── theme/
│   │   ├── themes.js        # ★ 三套 Design Token（色/字体/圆角/骨架类型）
│   │   └── ThemeProvider.jsx# ★ 运行时切换 + localStorage 记忆
│   ├── engine/
│   │   ├── ledger.js        # ★ 统一数据模型（唯一数据源）
│   │   └── useLedger.js     # ★ 统一状态机（唯一交互逻辑）
│   ├── components/
│   │   ├── PhoneShell.jsx   # iPhone 设备框（模板）
│   │   ├── TabBar.jsx       # 主题化底部 Tab（text/pill/diamond）
│   │   ├── TxRow.jsx        # 主题化流水行（line/capsule）
│   │   ├── CountUp.jsx      # 数字滚动动画
│   │   ├── AutoBookDemo.jsx # 自动记账演示链路（S0）
│   │   ├── Pages.jsx        # 五主屏：首页/流水/记一笔/分析/我的
│   │   └── Sheets.jsx       # 弹层：交易详情/待确认/账户
│   ├── layouts/
│   │   └── HomeLayouts.jsx  # ★ 三套首页骨架（ledger/hero/ring）
│   └── styles/
│       └── global.css       # 主题化全局样式（--t-* 变量 + data-* 选择器）
```

## 换 UI 的原理（三句话）

1. **颜色/字体/圆角/描边/阴影** → 全部收敛为 CSS 变量 `--t-*`，切换主题 = 换一份 Token 表（`themes.js`）并注入 `<html>`。
2. **结构性骨架差异**（Tab 三形态 / 流水行两形态 / 首页三布局）→ 用 `data-tab-type`、`data-row-type`、`data-home-type` 数据属性 + 少量条件渲染组件（`HomeFactory`）实现。
3. **数据与交互** → 引擎层（`ledger.js` + `useLedger.js`）只有一份，任何主题的 UI 都消费它。

**切换入口**：页面顶部「来财记账 · 主题」切换条（简约 / 时尚 / 奢华），选择记入 `localStorage['laicai.theme']`，刷新后保持。

## 新增主题（示例：加一个「科技版」）

1. 在 `themes.js` 的 `THEMES` 中加 `tech: { name, tokens: {...} }`，复用一套 token 再调整色板；
2. 若骨架沿用三版之一（如 home: ring），无需写布局；若有全新骨架，在 `layouts/HomeLayouts.jsx` 加一个组件并在 `HomeFactory` 注册；
3. 顶栏切换条自动出现（遍历 `THEMES`），无需改 App.jsx。

## 与三版原型的关系

- 本工程是 `prototypes/{minimal,fashion,luxury}.html` 的收敛版：**同一份 PRD 数据、同一套交互行为**；
- 三版原型是「静态高保真」参照；本工程是「可运行的开发骨架」，后续功能开发在此继续。

## 已验证（Playwright 冒烟，0 pageerror）

- 主题切换 minimal → fashion → luxury，Token 正确应用（data-theme / data-tab-type / data-home-type）
- 流水详情弹层（来源 + 置信度字段）
- LLM 报告生成（打字机加载态）
- 待确认「确认」流：角标 3 → 2
- localStorage 主题记忆

## 下一步建议

- 接入真实引擎：`useLedger.js` 目前是前端内存状态，可替换为 React Query + 后端 API 或 Electron/Capacitor 本地数据库；
- 金额存储升级为最小货币单位整数（分），展示层再格式化；
- 解析规则样本库与自动化回归测试（支付 App 文案变化对抗）；
- 权限/隐私：Android 通知监听权限引导、iOS 分享扩展。