# ADR-006-backend-stack

status: accepted
date: 2026-08-18
related_domains:
  - auto-capture
  - ledger-engine
  - analysis-llm
  - import-pipeline

## 背景

用户要求前端之外有「真正的后台」：Android 通知捕获、本地持久化、云端分析、导入。此前这些全部为前端模拟/占位，需要定技术栈与部署形态。

## 决策

1. **原生通知捕获**：Capacitor 自定义插件（Kotlin `NotificationListenerService`），事件经 WebView bridge 交给 TS 解析引擎；正文不落库（`ADR-005` 延续）。
2. **本地存储**：SQLite（`@capacitor-community/sqlite` / 原生）。金额最小货币单位整数（分）、UTC 毫秒（`INV-MONEY-01`）；localStorage 遗留数据经幂等迁移脚本搬迁。
3. **解析引擎**：TS 纯函数库（`src/engine/parse|dedup|confid`），Web 与原生桥共用同一份规则 → 单一事实源、可单测。
4. **云端分析服务**：Node/TS + Fastify，独立 `server/` 目录，Docker 化**可选部署**；与前端同语言栈、共享类型。
5. **LLM 网关**：Provider 抽象（OpenAI / Anthropic / Ollama），服务端不落库原始交易，只用聚合指标（最小化上传）。
6. **本地优先**：无账号体系、默认不联网；云端仅在用户显式授权后开启，关闭则功能完全不降级（纯确定性指标）。

## 后果

- 收益：确定性规则与 LLM 解释严格分离（`ADR-003`）；同栈降低心智负担；隐私边界可测试（正文不落盘、请求无原始交易）。
- 成本：需要原生插件与 TS 引擎的桥接层；SQLite 迁移要保底回退。
- 不改变：UI/主题（`ADR-002`）、去重 ID（`ADR-004`）、隐私边界（`ADR-005`）。