# REQ-20260818-build-release-pipeline

status: implementing
priority: P0
created_at: 2026-08-18
related_domains:
  - ledger-engine
  - theme-system

## 用户意图

增加 git 打包脚本流水线：根据代码打出 iOS 与 Android 安装包；流水线先执行、后生成 GitHub Release；触发时需填写版本号与更新内容；版本号格式 v0.x.x；App 内部也要记录版本号。

## 目标行为

- **Capacitor 双端工程**：`react-app/android`、`react-app/ios` 由 `npx cap add` 生成，web 产物同步到原生壳。
- **版本号唯一来源** `react-app/version.json`：`{ version: "v0.x.x", build }`；`scripts/version.py` 校验格式（`^v\d+\.\d+\.\d+$`）与读取/递增。
- **App 内部展示版本号**：S5 我的页脚「来财记账 v0.1.0 · build 1」，由 Vite `define` 注入（`__APP_VERSION__`/`__APP_BUILD__`）。
- **原生版本注入**：Android `app/build.gradle` 由 `-PAPP_VERSION_NAME/-PAPP_VERSION_CODE` 读取；iOS `MARKETING_VERSION` 由 CI 传入。
- **本地打包脚本** `scripts/build-release.sh [android|ios|all]`：web build → cap sync → gradle assembleRelease（Android）→ xcodebuild archive/export（iOS，需完整 Xcode）。
- **GitHub Actions 流水线** `.github/workflows/release.yml`：`workflow_dispatch` 手动触发，必须填 `version`（v0.x.x）与 `changelog`（更新内容）→ android job（ubuntu，出 APK）→ ios job（macos-14，出 IPA/unsigned）→ release job（softprops/action-gh-release 建 tag + Release + 附件）。

## 非目标范围

- 不在本机解决 iOS 签名证书（需用户 Apple 开发者账号，CI secrets）。
- 不实现真实后端/LLM（沿既有边界）。
- 不接应用商店自动上架。

## 影响模块

- `react-app/`（cap 工程 + version.json + 版本注入）
- `scripts/`（version.py、build-release.sh）
- `.github/workflows/release.yml`
- 文档：`doc/02`、`doc/07`、`doc/08`、REQ/DEV

## 验收标准

- [x] `scripts/version.py` 校验/读取/递增通过（v0.x.x 合法，非 v 前缀拒绝）
- [x] `npm run build` 0 errors，App 内展示版本号
- [x] `npx cap sync` 成功同步双端
- [x] 本地 `build-release.sh` 端到端不中断（无 SDK/Xcode 时明确提示）
- [x] workflow 语法终检通过
- [x] doc 同步 + doc_audit 通过
- [x] 推送 origin main（fd40845）
- [ ] CI 首次真实触发（需用户在仓库 Actions → Run workflow 填版本号+更新内容；本机无 Xcode/Android SDK，真实安装包由 runner 产出）——**外部依赖，待用户操作**