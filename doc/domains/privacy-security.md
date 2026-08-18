# 领域：隐私与安全（privacy-security）

## 1. 职责

隐私与安全是产品竞争力：通知正文不落盘、本地优先、云端分析显式授权可关闭、加密备份。跨：采集、存储、分析、设置。**后端设计就绪后本域为隐私实现清单。**

## 2. 入口与代码

- `react-app/src/components/Pages.jsx`（MinePage）：通知监听开关、云端授权开关、备份/恢复入口（占位）。
- `react-app/src/engine/useLedger.js`：`notifOn` / `cloudOn` 状态与联动文案。
- `server/`（规划）：云端分析服务（`DEV-20260818-backend-architecture` §4.5）。

## 3. 契约（不变量，不可破坏）

- **通知正文仅内存解析、不落盘**：DB schema 无 `text` 列，只存 `sourceId` + 结构化字段；App 无后台外联权限（`INV-PRIVACY-01`）。
- **云端 LLM 显式授权、最小化上传、可一键关闭**；关闭后功能不降级（`INV-PRIVACY-02`）。
- **对外诚实边界**（`INV-HONEST-01`）：只归集可获取的交易；iOS 不做实时通知读取。
- 云端服务端**不落库原始交易**：请求仅含聚合指标与聚合级 claim；审计日志只记用量与时期（`ADR-005` 延续 + `DEV-20260818-backend-architecture` §4.5）。

## 4. 隐私实现清单（后端就绪后逐项落地）

| 能力 | 状态 |
| --- | --- |
| 通知正文不落盘（schema 无 text；解析后 GC） | 设计定稿（`auto-capture`）→ M3 落实 |
| 云端请求最小化（无原始交易，仅指标） | 设计定稿（`analysis-llm` §5）→ M4 落实 |
| 开关 UI（监听/云端授权） | React 骨架已实现占位 → M5 联动 API |
| PBKDF2-SHA256 + AES-256-GCM 加密备份/恢复 | 规划（`SEC-01`，`INV-BACKUP-01`） |
| 通知权限引导 + 监听状态页 | 规划（`SEC-03`，M3 落实） |
| 数据导出 | 规划（`SEC-02`） |

## 5. 安全边界测试（纳入冒烟）

- 隐私审计断言：`pending/tx` 表不含 `text` 字段；`/api/report` 请求体无原始交易。
- 授权链路：`cloudOn=false` 不发请求；API 不可用回退纯指标。

## 6. 参考

- `ADR-005`（隐私边界决策）、`ADR-006`（后端选型，隐私延续）。
- `references/competitor-report.md`（隐私优先结论）。