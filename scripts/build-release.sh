#!/usr/bin/env bash
# 来财记账 打包脚本 —— 根据代码打出 iOS / Android 安装包
#
# 用法:
#   ./scripts/build-release.sh [android|ios|all] [VERSION]
#     默认 all；VERSION 缺省读 react-app/version.json（格式 v0.x.x）
#
# 产物:
#   release/v0.x.x/laicai-v0.x.x.apk
#   release/v0.x.x/laicai-v0.x.x.ipa（或 unsigned ios app zip）
#
# 前置:
#   Android: JDK 17 + ANDROID_HOME(platforms;android-3x / build-tools)
#   iOS    : macOS + 完整 Xcode + CocoaPods + 签名证书
#   （本机仅 CommandLineTools，iOS 打包含签名需在 CI macos runner）
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

VERSION="${2:-$(python3 scripts/version.py)}"
if ! python3 scripts/version.py check "$VERSION"; then
  echo "✗ 版本号非法: $VERSION（应为 v0.x.x）" >&2
  exit 1
fi
SHORT="${VERSION#v}"
OUT_DIR="$ROOT/release/$VERSION"
mkdir -p "$OUT_DIR"

echo "▶ 打包 $VERSION → $OUT_DIR"

## 1. 构建 Web（Capacitor 的 webDir）
echo "▶ 构建 web…"
(cd react-app && npm run build >/dev/null)

## Android
build_android() {
  echo "▶ cap sync android…"
  (cd react-app && npx cap sync android)
  echo "▶ Android assembleRelease…"
  (cd react-app/android && ./gradlew assembleRelease \
     -PAPP_VERSION_NAME="$SHORT" || echo "⚠ gradle 失败（检查 JDK/ANDROID_HOME）" >&2)
  local OUT="react-app/android/app/build/outputs/apk/release/app-release-unsigned.apk"
  if [ -f "$OUT" ]; then
    cp "$OUT" "$OUT_DIR/laicai-$VERSION.apk"
    echo "✓ APK → $OUT_DIR/laicai-$VERSION.apk"
  else
    echo "⚠ 未找到 APK 产物（可能因缺少 SDK/签名，见输出）" >&2
  fi
}

## iOS
build_ios() {
  if ! command -v xcodebuild >/dev/null; then
    echo "⚠ 本机无完整 Xcode，跳过 iOS 打包（请在 CI macos runner 执行）" >&2
    return
  fi
  echo "▶ cap sync ios…"
  (cd react-app && npx cap sync ios)
  echo "▶ pod install…"
  (cd react-app/ios/App && pod install)
  echo "▶ iOS archive + export（需签名证书，未配置则生成 unsigned）…"
  echo "  完整签名流程见 .github/workflows/release.yml" >&2
}

case "${1:-all}" in
  android) build_android ;;
  ios)     build_ios ;;
  all)     build_android; build_ios ;;
  *) echo "用法: $0 [android|ios|all] [VERSION]" >&2; exit 1 ;;
esac

echo "✓ 打包流程结束，产物目录: $OUT_DIR"
ls -la "$OUT_DIR" 2>/dev/null || true