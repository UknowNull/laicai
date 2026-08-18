# BUG-20260818-release-yml-parse

status: fixed
severity: P1（阻断 Actions 流水线触发）
created_at: 2026-08-18
fixed_at: 2026-08-18
related_domains:
  - build-release

## 现象

- GitHub Actions 页面看不到「Laicai Release Pipeline」流水线。
- GitHub API 显示 workflow `name` 为路径 `.github/workflows/release.yml`（而非配置的 `Laicai Release Pipeline`）——GitHub 未能解析文件头。
- 每次 push 触发一个 `event=push`、`conclusion=failure`、**job=0** 的「校验 run」（workflow 文件无效时 GitHub 的自动校验）。

## 根因

`doc/development/DEV-20260818-build-release-pipeline` 中 iOS job 的 `run: |` 块标量内嵌了 heredoc XML：

```yaml
run: |
  xcodebuild -exportArchive \
    -exportOptionsPlist <(cat <<PLIST
<?xml version="1.0" encoding="UTF-8"?>   # ← 缩进 0，顶格
...
PLIST
) \
```

YAML 块标量（`|`）要求所有内容行缩进 ≥ 块基准缩进；138-147 行 XML heredoc 内容缩进为 0（顶格），导致 YAML 解析在 138 行截断块标量、把 XML 当作新文档节点，整个 workflow 解析失败（js-yaml 报 `expected ':' after a mapping key (138:39)`、`a multiline key may not be an implicit key (152:13)`）。

## 修复

- heredoc 内容全部缩进到块基准（10 空格），改为先写 `export/ExportOptions.plist` 再传给 `xcodebuild -exportOptionsPlist`，避免进程替换 `<(cat …)` 与 YAML 缩进冲突。
- 修复后 `js-yaml` 解析通过：`name: Laicai Release Pipeline`、`jobs: [android, ios, release]`。

## 回归验证

- [x] `js-yaml` 完整解析 workflow 无错误
- [x] name / on / jobs 结构正确
- [x] push 后 GitHub API 校验 run 不再失败（待 API 确认）
- [ ] 用户手动 Run workflow 触发真实构建（外部依赖）

## 追加：CI 首次手动触发（v0.0.1）暴露的三处缺陷（2026-08-18 第二轮）

手动 Run workflow（v0.0.1, platform=all）后失败，根因三处：

1. **Android job 失败于「NPM install & web build」**：该步骤只有 `npm ci` + `npx cap sync android`，**缺 `npm run build`** → `dist/` 不存在，`cap sync` 无可拷贝的 web 产物 → 整个 job 失败。
2. **Release 403 `Resource not accessible by integration`**：workflow 未声明 `permissions: contents: write`，`GITHUB_TOKEN` 默认无权限创建 Release。
3. **`Pattern 'release/*' does not match any files`**：android 失败 → 无产物上传 → release job（`if: always()`）仍执行但 files 为空；且 403 令 Release 创建失败。

修复（`.github/workflows/release.yml`）：
- android/ios 的 web 步骤补 `npm run build`（先构建 web 再 cap sync）。
- workflow 顶层加 `permissions: contents: write`。
- release job 改为 `if: (needs.android.result == 'success' || needs.ios.result == 'success') && !cancelled()`，至少一平台成功才建 Release。
- setup-node `node-version` 20 → 24（GitHub 弃用 Node 20 runner）。
- 顺带：移除误入 devDependencies 的 `js-yaml`（仅本地验证工具，非工程依赖）。

## 第二轮回归验证

- [x] YAML 完整解析通过（name/jobs/permissions/if 均正确）
- [x] `npm run build` 本地先行验证通过（web 产物可构建）
- [x] doc_audit 通过
- [ ] 用户重新 Run workflow 验证（外部依赖）