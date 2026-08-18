# ADR-005-privacy-boundary

status: accepted
date: 2026-08-17
related_domains:
  - auto-capture
  - privacy-security
  - analysis-llm

## 背景

自动记账必须读取通知正文——这是敏感数据。同时云端 LLM 分析涉及账本外传，两者都要求明确隐私边界，否则产品失去信任。

## 决策

- 通知正文仅内存解析、不落盘（`INV-PRIVACY-01`）；App 无后台外联权限（Android），无账号体系默认不上传。
- 云端 LLM 分析必须：首次显式授权弹窗、最小化上传（仅问题所需指标/子集）、设置一键关闭（`INV-PRIVACY-02`）；关闭后回到纯确定性指标面板，功能不降级。
- 诚实边界（`INV-HONEST-01`）：自动归集可获取的交易；iOS 不做实时通知读取（系统限制）。

## 后果

- 权限与隐私文案是产品卖点而非合规负担；竞品对比中隐私优先是差异化。
- 安全实现（备份加密等）按 `INV-BACKUP-01`（PBKDF2-SHA256 + AES-256-GCM）推进。