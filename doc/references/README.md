# 来财记账 参考索引

本目录收录历史设计、竞品调研与原型，用于解释设计来源，**不**覆盖当前代码。

## 文件

| 路径 | 来源 | 说明 |
| --- | --- | --- |
| `competitor-report.md` | `自动记账App_GitHub竞品调研报告.docx` 精要（已完成竞品调研） | GitHub 自动记账竞品对比，iOS 实时捕获不可行结论 |
| `design-spec-original.md` | 三版原型子代理共享的 `DESIGN_SPEC.md`（精炼） | 原型制作约束（iPhone 模板/六屏/统一数据/抗浮躁） |
| `ui-style-guide.md` | `prototypes/*.html` 三版视觉系统归纳（精炼） | 简约/时尚/奢华的色/字体/骨架 |

## 根级历史文档（保留追溯）

| 根目录文件 | 用途 |
| --- | --- |
| `PRD.md` | 需求阶段完整文档（v1.0, 2026-08-17）；产品基线精要已并入 `doc/01-product-requirements.md` |
| `DESIGN_SPEC.md` | 三版原型共享的设计约束；约束细节见下 `design-spec-original.md` |
| `UI_SWAP_PLAN.md` | 换肤方案分析（方案一 Token 主题化推荐）；架构决策见 `ADR-002` |

## 竞品结论（摘录）

- Android 通知捕获是市场断层优势；
- iOS 实时通知读取不可行 —— 采用分享扩展/文件导入；
- 隐私优先是差异化卖点；
- Mymo 思路可参考，但不引用 GPL 依赖（本项目开源 MIT）。