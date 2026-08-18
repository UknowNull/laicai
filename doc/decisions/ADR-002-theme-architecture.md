# ADR-002-theme-architecture

status: accepted
date: 2026-08-17
related_domains:
  - theme-system

## 背景

三版风格（简约/时尚/奢华）起初是三个独立 HTML 原型。若要「后期直接更换 UI」，需要明确换肤的技术边界。

## 决策

采用「一套引擎 + 三套 Design Token + 三套布局组件」的主题化架构：
- 颜色/字体/圆角/描边/阴影 → `--t-*` CSS 变量（Token 层，约 60% 差异）；
- 骨架差异（Tab text/pill/diamond、Row line/capsule、Home ledger/hero/ring）→ `data-*` 属性 + 条件渲染组件（布局层，约 30% 差异）；
- 数据与交互（engine/useLedger）只有一份，任何主题共用。

运行时切换 = `applyTheme(id)` 注入变量 + 属性；localStorage 记忆 `laicai.theme`。

## 后果

- 新增主题只需加 Token 表；沿用现有骨架类型则无需新布局。
- 不做「删文件换文件」式换 UI；主题切换在运行时完成。
- React 构建产物需 HTTP 访问（file:// CORS 拦截 ES 模块）——`npm run preview`/`dev`。