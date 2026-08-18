# 领域：账单导入（import-pipeline）

## 1. 职责

跨端账单导入：把微信/支付宝官方账单、通用 CSV/OFX/QIF 接入账本。iOS 的关键替代入口（iOS 无实时捕获）。**设计已定（`DEV-20260818-backend-architecture` §4.6），待实施（M6）。**

## 2. 架构（设计定稿）

```text
来源文件（用户选择 / 分享扩展）
  → format detect（文件扩展名 + 内容嗅探）→ CSV/OFX/QIF
  → 行解析器（per format）
  → 标准行 { day, merchant, amount(分), direction(-1|1|0), account, category? }
  → 映射器（微信/支付宝官方模板预设 + 通用列名推断）
  → 预览（与账本现有数据去重比对，冲突标红）
  → 用户确认 → Repo.insertMany（dedup_id UNIQUE 保证幂等，INV-DEDUP-01）
```

## 3. 契约与边界

- 导入必须经过**预览 + 确认**（`INV-IMPORT-01` 规划）：冲突标红、禁止静默全量入账。
- 导入数据与自动捕获共用同一数据模型（`ledger-engine`）：金额分（整数）、时间 UTC 毫秒、去重 ID 相同规则。
- iOS 端以本域为核心能力（配合手动记账维持可用）。
- 分类：导入行无分类 → 使用 `parse/categories.ts` 商户映射（与通知解析共用），仍未知则「其他」。

## 4. 格式支持与状态

| 编号 | 格式 | 状态 |
| --- | --- | --- |
| IMP-01 | 微信/支付宝 CSV 官方模板解析 + 去重 | **设计完成**，待实施（M6） |
| IMP-02 | 通用 CSV/OFX/QIF 导入映射器（预览+确认） | **设计完成**，待实施（M6） |
| IMP-03 | PDF/OCR 票据识别 | 规划（后续里程碑） |
| IMP-04 | 分享扩展/文件导入（iOS 关键入口） | 规划（M6 后） |
| IMP-05 | 导入去重（金额+时间+来源窗口） | **设计完成**（共用 dedup/ 引擎） |

## 5. 参考

- 竞品（Actual/Firefly III 的导入器思路，见 `references/competitor-report.md`）。
- 需求：`doc/01-product-requirements.md` 3.4 节（IMP-01..05）。