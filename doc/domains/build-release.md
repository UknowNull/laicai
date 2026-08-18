# 领域：打包与发布（build-release）

## 1. 职责

把 web 代码打包成 Android APK / iOS App（IPA），并发布 GitHub Release。版本号 v0.x.x 唯一来源、App 内展示。任何打包/发布/版本变更都对本域。

## 2. 入口与文件

- `react-app/version.json`：版本唯一来源（`{ version: "v0.x.x", build }`）。
- `scripts/version.py`：读取/校验/递增版本（`check v0.x.x` 拒绝无 v 前缀）。
- `scripts/build-release.sh`：本地双端打包（web build → cap sync → gradle/xcodebuild）。
- `.github/workflows/release.yml`：CI 流水线（手动触发填版本号+更新内容 → 双端产物 → GitHub Release）。
- `react-app/capacitor.config.json`：壳配置（appId `com.laicai.app`、webDir `dist`）。
- `react-app/android`、`react-app/ios`：Capacitor 原生工程（版本由 `-PAPP_VERSION_NAME` / `MARKETING_VERSION` 注入）。

## 3. 契约

- 版本号必须 `^v\d+\.\d+\.\d+$`（`v0.x.x`）；App 内（S5 我的页脚）与 Release tag 一致。
- 流水线触发：`workflow_dispatch` 填 `version` + `changelog`（更新内容），格式非法即失败，不生成 Release。
- Android versionCode 由 CI 递增；iOS `MARKETING_VERSION` 同源。
- 产物：`laicai-v0.x.x.apk`（release-unsigned）+ `-debug.apk`（可安装）；iOS `ip a` 或 unsigned xcarchive zip。
- 签名：Android keystore、iOS 证书/provisioning 走 GitHub Secrets；未配置时输出 unsigned 并明示，Release 仍生成（试用语义）。

## 4. 状态

| 能力 | 状态 |
| --- | --- |
| Capacitor 双端工程生成 | 已实现（android/ios 目录已 `cap add`） |
| 版本唯一来源 + 校验 + App 内展示 | 已实现（v0.1.0 展示于 S5） |
| 本地打包脚本（web+capsyc+gradle/xcode） | 已实现（本机无 SDK/Xcode 时提示不中断） |
| CI 流水线（Android APK + iOS App + Release） | 已实现（workflow 落盘，待仓库首次触发验证） |
| Android/iOS 签名 | 待配置（secrets），未配置输出 unsigned |

## 5. 环境与本机限制（诚实标注）

- 本机：Node24/JDK17 有；**无完整 Xcode、无 Android SDK、`~/.gradle` 权限受限**。
- 因此本机验证到：web build + cap sync + 脚本流程。**真实安装包由 GitHub Actions 产出**（ubuntu 打 APK、macos-14 打 iOS），触发入口：仓库 Actions → Release Pipeline → Run workflow（填版本号+更新内容）。

## 6. 测试

- `python3 scripts/version.py check <v>`（合法/非法分支）
- `cd react-app && npm run build`（注入版本，0 errors）
- `npx cap sync`（双端同步）
- `./scripts/build-release.sh android v0.1.0`（流程不中断）