# 领域：账单导入（import-pipeline）

## 1. 职责

跨端账单导入：把微信/支付宝官方账单、通用 CSV/OFX/QIF、PDF 票据接入账本。iOS 的关键替代入口（iOS 无实时捕获）。规划域，当前无代码。

## 2. 入口（规划）

```text
来源（微信CSV / 支付宝CSV / 通用CSV/OFX/QIF / PDF/OCR / 分享扩展）
  -> 解析/映射器（列 → 标准字段）
  -> 预览（冲突标红）
  -> 导入去重对比（金额+时间+来源窗口）
  -> 入账 或 并入待确认
```

## 3. 契约与边界

- 导入必须经过预览 + 去重（`INV-IMPORT-01` 规划）：冲突标红、禁止静默入账。
- 导入数据与自动捕获共用同一数据模型（`ledger-engine`）。
- iOS 端以本域为核心能力（配合手动记账维持可用）。

## 4. 能力清单与状态

| 编号 | 能力 | 状态 |
| --- | --- | --- |
| IMP-01 | 微信/支付宝 CSV 官方模板解析 + 去重 | 规划 |
| IMP-02 | 通用 CSV/OFX/QIF 导入映射器（预览+确认） | 规划 |
| IMP-03 | PDF/OCR 票据识别 | 规划 |
| IMP-04 | 分享扩展/文件导入 | 规划（iOS P1） |
| IMP-05 | 导入去重 | 规划 |

## 5. 参考

- 竞品（Actual/Firefly III 的导入器思路，见 `references/competitor-report.md`）。
- 需求：`doc/01-product-requirements.md` 3.4 节。