# DEV-20260818-build-release-pipeline

status: implementing
date: 2026-08-18
related_requests:
  - REQ-20260818-build-release-pipeline
affected_domains:
  - ledger-engine
  - theme-system

## 目标

增加 git 打包流水线：代码 → Capacitor 双端工程 → 本地脚本/CI 流水线 → iOS/Android 安装包 → GitHub Release；版本号 v0.x.x 唯一来源 + App 内展示。

## 版本契约

- **唯一来源**：`react-app/version.json` → `{ version: "v0.1.0", build: 1, updated, note }`。
- **校验**：`scripts/version.py check <ver>`，正则 `^v\d+\.\d+\.\d+$`（`v0.x.x` 强制，拒绝 `1.0.0`）。
- **注入链路**：
  - Web：Vite `define` → `__APP_VERSION__`/`__APP_BUILD__` → S5 我的页脚展示；
  - Android：`app/build.gradle` 读取 `project.properties['APP_VERSION_NAME']`（CI 用 `-PAPP_VERSION_NAME`）；versionCode 由 CI 以 build 数传入；
  - iOS：CI `xcodebuild -archive` 传 `MARKETING_VERSION`；
  - Capacitor 壳：`capacitor.config.json` 读 version.json（`version` 去 `v` 前缀）。

## 工程生成

```bash
cd react-app
npm i @capacitor/core@6 @capacitor/cli@6 @capacitor/android@6 @capacitor/ios@6
# capacitor.config.json: appId com.laicai.app / appName 来财记账 / webDir dist / androidScheme https
npx cap add android && npx cap add ios
npx cap sync
```

## CI 流水线（.github/workflows/release.yml）

```text
workflow_dispatch:
  version (v0.x.x，校验) | changelog（更新内容）| platform all|android|ios
  ├─ android job (ubuntu) : setup-node20 + setup-java17 → 写版本 → npm ci → cap sync
  │     → assembleDebug（可安装）→ assembleRelease（unsigned）→ upload apk
  ├─ ios job (macos-14)   : npm ci → cap sync → pod install → xcodebuild archive
  │     → export IPA（默认 unsigned，签名走 secrets）→ upload
  └─ release job          : merge artifacts → softprops/action-gh-release
      tag v0.x.x → name 来财记账 v0.x.x → body=changelog → files=apk/ipa
```

- 版本校验在 job 内重复（`grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$'`），输入非法直接失败，不生成 Release。
- `prerelease: true`（试用阶段语义）；签名 secrets 未配置时输出 unsigned，Release 说明明确标注。

## 本地脚本（scripts/build-release.sh）

```bash
./scripts/build-release.sh [android|ios|all] [VERSION]   # 默认读 version.json
```
- 缺 VERSION / 格式非法 → 拒绝。
- 流程：web build → `cap sync <platform>` → gradle assembleRelease（Android）/ xcodebuild+pod（iOS）。
- 无 SDK/Xcode 时明确提示并继续（不中断其余平台）。

## 环境事实（本机）

- ✅ Node 24 / npm / JDK 17（Temurin）
- ❌ 无完整 Xcode（仅 CommandLineTools）→ 本地无法 archive/export ipa → **iOS 包由 CI macos runner 产出**
- ❌ 无 Android SDK / sdkmanager → 本地 `assembleRelease` 在 SDK 检查失败 → **APK 由 CI ubuntu runner 产出**（`react-native` 式 gradle wrapper 在 CI 有官方缓存）
- `~/.gradle` 权限受限：本地 gradle wrapper 下载被阻；脚本已捕获并提示

## 测试

- `python3 scripts/version.py` / `check v0.9.9` / `check 1.0.0`（后者必须报非法）→ 通过
- `npm run build` → 0 errors，含版本注入
- `npx cap sync` → android/ios 同步成功
- `./scripts/build-release.sh android v0.1.0` → 流程完整走通（gradle 因无 SDK 提示失败但不中断）→ 通过

## 回滚

- 删除 `.github/workflows/release.yml` + `scripts/build-release.sh` + `scripts/version.py` + cap 工程目录，恢复 release 流程前的仓库结构（git revert）。