# 领域：隐私与安全（privacy-security）

## 1. 职责

隐私与安全是产品竞争力：通知正文不落盘、本地优先、云端分析显式授权可关闭、加密备份。跨：采集、存储、分析、设置。

## 2. 入口与代码

- `react-app/src/components/Pages.jsx`（MinePage）：通知监听开关、云端授权开关、备份/恢复入口（占位）。
- `react-app/src/engine/useLedger.js`：`notifOn` / `cloudOn` 状态与联动文案。

## 3. 契约（不变量）

- 通知正文仅内存解析、不落盘；App 无后台外联权限（Android）（`INV-PRIVACY-01`）。
- 云端 LLM 显式授权、最小化上传、可一键关闭；关闭后功能不降级（`INV-PRIVACY-02`）。
- 对外诚实边界（`INV-HONEST-01`）。

## 4. 规划能力与状态

| 能力 | 状态 |
| --- | --- |
| 开关 UI（监听/云端授权） | React 骨架已实现占位 |
| PBKDF2-SHA256 + AES-256-GCM 加密备份/恢复 | 规划（`SEC-01`，`INV-BACKUP-01`） |
| 通知权限引导 + 监听状态页 | 规划（`SEC-03`） |
| 数据导出 | 规划（`SEC-02`） |

## 5. 参考

- `ADR-005`（隐私边界决策）。
- `references/competitor-report.md`（隐私优先结论）。