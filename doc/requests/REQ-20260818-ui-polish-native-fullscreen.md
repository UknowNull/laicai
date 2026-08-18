# REQ-20260818-ui-polish-native-fullscreen

status: verified
priority: P0
created_at: 2026-08-18
verified_at: 2026-08-18
related_domains:
  - theme-system
  - build-release
  - ledger-engine

## 用户意图

1. 主题切换不应占用主页面顶部，应放到设置里切换
2. UI 是否完全按苹果设计？（PhoneShell 是 iPhone 框，原生 App 不应显示）
3. Android 安装未占据全屏（内容被包在 iPhone 框里居中显示）

## 目标行为（已实现）

- **主题切换迁至 S5 我的 → 外观设置**：三个主题按钮（简约/时尚/奢华），当前选中高亮（accent border+shadow），点击即时生效，localStorage 持久化。`App.jsx` 移除原 `ThemeStrip` 顶部悬浮条。
- **原生/预览双模式**：`PhoneShell.jsx` 检测 `Capacitor.isNativePlatform()`，原生环境不渲染 iPhone 设备框（灵动岛/状态栏/Home 条），改为 `.app-native` 全屏铺满 WebView；浏览器预览保留 iPhone 框（340×748）供原型演示。
- **Android/iOS 全屏**：`body.native` class 去除 flex 居中，`padding: env(safe-area-inset-*)` 适配异形屏/安全区，`.app`/`.viewport` absolute inset 0 铺满。
- 隐私开关、重置数据、版本号展示仍保留在 S5 我的页。

## 非目标范围

- 不改变主题 Token 内容（仅改变切换入口位置）
- 不改变数据/交互逻辑
- 浏览器原型预览仍保留 iPhone 框（原型用途）

## 影响模块

- `react-app/src/App.jsx`（移除 ThemeStrip）
- `react-app/src/components/PhoneShell.jsx`（双模式）
- `react-app/src/components/Pages.jsx`（MinePage 主题设置区块）
- `react-app/src/styles/global.css`（主题设置行样式 + 原生全屏样式）
- `scripts/smoke_react.py`（theme-strip 断言 → tp-btn 断言）
- `doc/domains/theme-system.md`

## 验收标准（已验证）

- [x] S5 我的页出现「外观」区块，含 3 个主题按钮
- [x] 主题切换后 `data-theme` / `data-tab-type` / `data-home-type` 正确变化
- [x] 主题回落至 minimal 后 data-theme=minimal（localStorage 持久化）
- [x] 浏览器预览：`.phone-shell` 显示（1），原生模拟：`.phone-shell` 隐藏（0）、`.app-native` 显示（1）
- [x] 原生模拟：`body.native` class 存在、viewport 全屏（appRect top=0）
- [x] 冒烟通过：pageerror=0、detail sheet/report/keypad/pendBefore→pendAfter 均正常
- [x] `npm run build` 0 errors
- [x] `python3 scripts/doc_audit.py` 通过