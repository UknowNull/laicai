# 来财记账 验收标准

## 1. 验收分层

| 层 | 范围 | 门禁 |
| --- | --- | --- |
| L1 构建 | React 工程可构建 | `npm run build` 0 errors |
| L2 交互冒烟 | 三版原型 + React 骨架核心交互 | Playwright：切换/弹层/报告/键盘/待确认，pageerror=0 |
| L3 数据一致 | 原型与引擎数据模型 | 统一数据（¥16,567.40 / 3 待确认 / 瑞幸 -32.50 / 分类占比）三处一致 |
| L4 文档一致 | `doc/` 体系与代码同步 | `scripts/doc_audit.py` 通过 |
| L5 开发文档 | 前端实现体与 `DEV-20260818-react-frontend-spec.md` 一致 | 状态机/组件契约/页面交互对照代码复核 |

## 2. 需求级验收（REQ 关闭条件）

1. 验收标准（REQ 中列出）逐条达成，且有验证证据。
2. 代码、测试与文档（domains/requests/decisions）同步完成。
3. 独立缺陷已拆成 BUG-* 或显式排除。
4. 未将「规划」写成「已实现」。

## 3. 产品级验收（阶段里程碑）

| 阶段 | 验收要点 |
| --- | --- |
| 阶段一 | 微信/支付宝/≥3 家银行通知自动入账；误记率可观测；待确认流闭环；SQLite 落地 |
| 阶段二 | 主流账单格式一次导入去重正确；iOS 可独立使用（无自动捕获） |
| 阶段三 | 报告结论全部可下钻；关闭云端后功能不降级 |
| 阶段四 | 多端一致；同步无丢账 |

## 4. 发布前检查清单

- [ ] `react-app` 构建绿 + 冒烟 pageerror=0
- [ ] 三版原型可开且与引擎数据一致
- [ ] 隐私边界（正文不落盘 / 授权可关）实现并验证
- [ ] `doc/` 体系更新到位（REQ/DEV/domains/ADR）
- [ ] AGENTS.md 路由未漂移
- [ ] 版本号唯一来源 `version.json` 为 `v0.x.x`，App 内展示与 Release tag 一致
- [ ] `scripts/version.py check` 通过
- [ ] CI 流水线已触发并产出双端安装包（未配置签名时明示 unsigned）

## 5. 打包验收标准

| 项 | 门禁 |
| --- | --- |
| 版本号 | `^v\d+\.\d+\.\d+$`；version.json / App 内 / Release tag 三者一致 |
| Android | CI ubuntu runner `assembleDebug`（可安装）+ `assembleRelease`（unsigned）成功 |
| iOS | CI macos-14 `xcodebuild archive + export` 成功（签名走 secrets，缺省 unsigned） |
| Release | 手动触发后生成 tag `v0.x.x`，正文含 changelog，附件含 apk/ipa |