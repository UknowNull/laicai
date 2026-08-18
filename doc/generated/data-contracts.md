# 数据契约快照（generated）

> 生成日期：2026-08-18 · 来源：`react-app/src/engine/ledger.js` 人工核对 · 变更必须同步 prototypes 与引擎

## 账户

| id | name | type | balance |
| --- | --- | --- | --- |
| cmb | 招商银行 ♥8899 | bank | 26,480.52 |
| wechat | 微信零钱 | wallet | 1,206.35 |
| alipay | 支付宝 | wallet | 843.20 |
| cash | 现金 | cash | 520.00 |

合计：28,849.87

## 月度指标

- 支出 ¥8,432.60 · 收入 ¥25,000.00 · 结余 +¥16,567.40 · 环比 -12.4%
- 预算超支：餐饮 +8%（星巴克 6 笔 ¥186.00，超预算）
- 覆盖度：已确认 X%（N 笔待确认未计入）
- 分类占比：餐饮42 / 购物18 / 交通14 / 居住12 / 娱乐9 / 其他5

## 交易

初始 8 笔（1-8，含瑞幸咖啡 -32.50 等）+ 待确认 3 笔：
- 美团外卖 -45.80（分类不明）
- 京东 -299.00（账户未知）
- 现金 -120.00（低置信抄账）

结构：`{ id, day, time, merchant, amount(±元), acctId, cat, status(ok|pending), src, conf(0-1), pendReason? }`

## 去重规则（规划）

`DEDUP_ID = SHA-256(${source}|${merchant}|${amount}|${timeWindow})`，见 `ADR-004`。