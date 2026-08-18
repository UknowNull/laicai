# 来财记账 操作与运行手册

## 1. 环境要求

- Node.js v24+（已验证）
- npm 10+（全局 cache 权限受限时用 `npm install --cache ./.npm-cache`）
- Chromium 浏览器用于 Playwright：缓存目录 `/Users/tbw/Library/Caches/ms-playwright/`（已安装 chrome-headless-shell-1217）

## 2. React 工程

```bash
cd react-app
npm install --cache ./.npm-cache      # 首次/依赖变更
npm run dev                          # 开发服务器 http://127.0.0.1:5173
npm run build                        # 生产构建 → dist/
npm run preview                      # 预览生产构建 http://127.0.0.1:4173
```

Playwright 用已安装的 chromium 验证：
```bash
node -e "const{w}=require('<globally-resolve playwright>'); ..."   # 详见 scripts/smoke_react.py 原理
python3 ../scripts/smoke_react.py
```

> ⚠️ `react-app/dist/index.html` 不能直接 `file://` 打开——浏览器 CORS 会阻止加载 ES 模块；必须经 HTTP 服务。

## 3. 原型

```bash
open index.html                      # 总览页
open prototypes/minimal.html         # 简约版
open prototypes/fashion.html         # 时尚版
open prototypes/luxury.html          # 奢华版
open theme-switcher.html             # 换肤实验室
```

Playwright 冒烟：`python3 scripts/smoke_prototypes.py`（输出 `_artifact_work/shot-*.png`）。

## 4. 文档审计

```bash
python3 scripts/doc_audit.py              # 检查 Git 变更与命中 REQ/BUG 的一致性
python3 scripts/doc_audit.py --report     # 历史盘点
```

## 5. 打包与发布

```bash
# 版本工具（唯一来源 react-app/version.json，格式 v0.x.x）
python3 scripts/version.py            # 当前版本
python3 scripts/version.py check v0.2.0   # 校验格式（非法退出非 0）
python3 scripts/version.py bump       # 递增 build
python3 scripts/version.py bump minor # 递增 minor

# 本地打包（web build → cap sync → 原生构建）
./scripts/build-release.sh android [VERSION]   # 打 APK
./scripts/build-release.sh ios [VERSION]       # 打 IPA（需完整 Xcode）
./scripts/build-release.sh all [VERSION]       # 双端

# CI 发布（推荐，产出真实双端安装包）
#   GitHub 仓库 → Actions → Laicai Release Pipeline → Run workflow
#   填：version（v0.x.x）+ changelog（更新内容）
#   结果：android job 出 apk / ios job(macos-14) 出 ipa → release job 生成 GitHub Release
```

## 6. 常见故障

| 症状 | 原因 | 解 |
| --- | --- | --- |
| `npm install` EPERM / cache error | `~/.npm` 目录归属非当前用户 | `npm install --cache ./.npm-cache` |
| Playwright 冒烟 file:// 报错 | React ES 模型跨源限制 | 用 `npm run preview` 或 `npm run dev` 提供 HTTP |
| 原型 iframe 加载空白 | 路径大小写 / 网络拦截 | 直接双击本地文件 |
| 主题切换不生效 | localStorage 残留旧 key | 清除 `laicai.theme` 或在设置页重选 |