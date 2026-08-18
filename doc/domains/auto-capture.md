# 领域：Android 自动捕获（auto-capture）

## 1. 职责

Android 实时自动记账的唯一采集通道：监听支付通知 → 预过滤 → 提取 → 确定性解析 → 去重 → 置信度 → 入账/待确认。规划域，当前无代码。

## 2. 入口（规划）

```text
原生 NotificationListenerService（Android 8.0+）
  -> 来源预过滤（包名/应用名/标题）
  -> 正文提取（extras / MessagingStyle / tickerText，限长）
  -> 确定性解析（金额/方向/商户/时间 正则规则）
  -> SHA-256 去重 + 银行×钱包时间窗合并
  -> 置信度评分 → 高置信入账 / 低置信待确认
```

## 3. 契约与边界

- 通知正文**仅内存解析、不落盘**（`INV-PRIVACY-01`）。
- 系统限制：Android 可读通知正文；**iOS 禁止**——本域仅覆盖 Android。
- 对外诚实边界：只自动归集可获取的交易（`INV-HONEST-01`）。
- 后台可靠性（`INV-BG-01` 规划）：重绑定、退避重试、进程回收恢复、开机恢复监听、Android 15 敏感通知处理。

## 4. 质量观测（规划）

- 自动入账率、待确认率、去重正确率、误记率（可观测指标）。
- 解析规则样本库 + 自动化回归（对抗支付 App 文案变化），规则可热更新。

## 5. 参考

- 竞品调研结论（`doc/references/competitor-report.md`）：Android 通知捕获是市场断层；Mymo 思路可借鉴但 GPL 不引用（开源 MIT）。
- 需求：`MAN-01`/`AUTO-01..08`（`doc/01-product-requirements.md`）。

## 6. 状态

全部规划。首个里程碑（阶段一）需实现 AUTO-01..06 + 手动记账 + SQLite。