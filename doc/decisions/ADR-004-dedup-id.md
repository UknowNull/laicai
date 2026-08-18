# ADR-004-dedup-id

status: accepted
date: 2026-08-17
related_domains:
  - ledger-engine
  - auto-capture
  - import-pipeline

## 背景

同一笔消费可能同时来自支付通知与账单导入，且不同渠道（银行短信 vs 微信推送）金额/商户文案不同，需要稳定去重。

## 决策

外部去重 ID = `SHA-256(${source}|${merchant}|${amount}|${timeWindow})`（`INV-DEDUP-01`）：
- `source`：渠道（wechat/alipay/bank/import:file-hash）；
- `merchant`：规范化后的商户名（去空格、统一大小写/繁简）；
- `amount`：规范金额（最小货币单位整数）；
- `timeWindow`：按渠道配置的宽松窗口（如银行短信 ±10 分钟与推送合并）。

跨渠道时间窗合并**不得破坏单渠道 ID**：合并动作创建关联记录，不以合并覆盖任一渠道原 ID。

## 后果

- 导入与自动捕获共用同一去重逻辑；重复入账可被拦截且可解释。
- 校验：去重单测（同款通知重复、通知+导入、跨渠道合并、不同笔不误并）。