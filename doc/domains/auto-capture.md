# 领域：Android 自动捕获（auto-capture）

## 1. 职责

Android 实时自动记账的唯一采集通道：监听支付通知 → 预过滤 → 提取 → 确定性解析 → 去重 → 置信度 → 入账/待确认。**设计已定（`DEV-20260818-backend-architecture` §4.2-4.4），待实施（M2/M3）。**

## 2. 架构（设计定稿）

```text
原生 NotificationListenerService（Kotlin 插件 @laicai/capture）
  -> 来源预过滤（包名/应用名/标题，非目标直接丢弃）
  -> 正文提取（extras / MessagingStyle / tickerText，限长 512）
  -> WebView bridge 回调 TS 引擎
  -> parse/   确定性解析（金额/方向/商户/时间 正则规则）
  -> dedup/   SHA-256 去重 + 银行×钱包时间窗合并
  -> confid/  置信度评分 → 高置信入账 / 低置信待确认
```

## 3. 契约与边界（不可破坏）

- 通知正文**仅内存解析、不落盘**：DB 只存 `sourceId` + 结构化字段，无 `text` 列（`INV-PRIVACY-01`）。
- 系统限制：Android 可读通知正文；**iOS 禁止**——本域仅覆盖 Android。
- 对外诚实边界：只自动归集可获取的交易（`INV-HONEST-01`）。
- 后台可靠性（`AUTO-07`）：重绑定、退避重试、进程回收恢复、开机恢复监听、Android 15 敏感通知处理。仅存通知 id 用于联动，不存正文。

## 4. 数据契约（引擎侧）

```ts
parseNotif(raw: RawNotif): Parsed | null   // parse/ 入口，纯函数
RawNotif = { sourceId, appPkg, title, text(内存), ts }
Parsed = { ok:true; tx:{merchant, category, amount(分), direction, accountId, confidence, reason?} }
       | { ok:false; reason:'unparseable'|'not-payment' }
confidence >= 0.85 → 入账；< 0.85 → 待确认
```

## 5. 质量观测（实施后纳入）

- 自动入账率、待确认率、去重正确率、误记率（可观测指标）。
- 解析规则样本库 + 自动化回归（对抗支付 App 文案变化），规则可热更新（规则版本入 `kv` 表）。

## 6. 参考

- 竞品调研结论（`doc/references/competitor-report.md`）：Android 通知捕获是市场断层；Mymo 思路可借鉴但 GPL 不引用（开源 MIT）。
- 需求：`MAN-01`/`AUTO-01..08`（`doc/01-product-requirements.md`）。
- 设计：`DEV-20260818-backend-architecture` §4.2-4.4。

## 7. 状态

- 解析引擎（parse/dedup/confid）：**设计完成**（DEV §4.2-4.3），待实施（里程碑 M2）。
- 原生插件（Kotlin）：**设计完成**（DEV §4.4），待实施（里程碑 M3）。
- 后台可靠性：**规划**（AUTO-07，M3 后）。