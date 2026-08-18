# 领域：主题体系（theme-system）

## 1. 职责

把三版设计语言（简约/时尚/奢华）收敛为可运行时切换的主题系统。任何 UI 换肤/新增主题的改动落在本域。

## 2. 入口与代码

- `react-app/src/theme/themes.js`：三套 Design Token（`--t-*` CSS 变量 + 骨架类型属性）。
- `react-app/src/theme/ThemeProvider.jsx`：`useTheme()` Hook，切换 + localStorage 记忆（key `laicai.theme`）。
- `react-app/src/styles/global.css`：消费 Token；用 `[data-tab-type]`/`[data-row-type]`/`[data-home-type]` 做骨架差异。
- `react-app/src/layouts/HomeLayouts.jsx`：三套首页骨架（ledger/hero/ring）+ `HomeFactory`。
- `react-app/src/components/TabBar.jsx` / `TxRow.jsx`：按 `data-*` 属性渲染不同形态。
- `react-app/src/components/Pages.jsx`（MinePage）：**主题切换入口**（「外观」设置区块，三主题按钮 `.tp-btn`）。

## 3. 契约

- 主题 = Token 表（颜色/字体/圆角/描边/阴影/动效）+ 骨架类型（`--t-home-type`、`--t-tab-type`、`--t-row-type`）。
- 切换主题 = `applyTheme(id)` 注入 CSS 变量 + `data-*` 属性；引擎层（数据/交互）不感知主题。
- **主题切换入口**：S5 我的 → 外观（`.theme-picker .tp-btn`），点击调 `setTheme(id)`；不再使用顶部悬浮条。
- 新增主题：`themes.js` 加一条 Token 表（含 `name`/`desc` 字段供 S5 外观区块展示）；若骨架沿用已有类型无需写布局；全新骨架在 `HomeLayouts.jsx` 增加并注册到 `HomeFactory`。
- 三版原型（`prototypes/`）与 React 骨架**共享同一套演示数据**；换肤只换皮肤，不换数据。
- **原生 App 与浏览器预览双模式**：`PhoneShell.jsx` 检测 `Capacitor.isNativePlatform()`，原生渲染 `.app-native`（全屏），浏览器渲染 `.phone-shell`（iPhone 框）。

## 4. 已验证行为（Playwright 记录，见 `doc/05-verification.md`）

- minimal → fashion → luxury Tokens 正确应用（`data-theme` + `data-tab-type` + `data-home-type`）。
- localStorage `laicai.theme` 持久化，刷新后保持。

## 5. 已知限制

- 结构性差异（布局骨架）无法由 CSS 变量全数表达，需 `data-*` 条件渲染——这是「Token 只覆盖约 60% 差异」的原因（见 `ADR-002`）。
- `react-app` 用 HTTP 访问（file:// 拦截 ES 模块）。

## 6. 测试

- 构建：`cd react-app && npm run build`
- 冒烟：`python3 scripts/smoke_react.py`（切换 Token / 布局断言 / pageerror=0）