# 来财记账 验证与质量门禁

## 1. 基础检查

```bash
# 文档一致性审计（仅检查 Git 变更与命中的 REQ/BUG）
python3 scripts/doc_audit.py

# React 工程构建
cd react-app && npm run build

# 三版原型快速冒烟（Playwright 截图 + 点击）
python3 scripts/smoke_prototypes.py  # 输出 _artifact_work/shot-*.png
```

## 2. React 工程验收门禁

```bash
cd react-app
npm run build                      # 必须 0 errors
npm run preview                    # 生产预览服务器

# Playwright 冒烨（需 HTTP 服务，file:// 被 CORS 拦截）
python3 ../scripts/smoke_react.py  # 检查：主题切换 Token 正确 / 详情弹层 / 报告生成 / 键盘 / 待确认 3→2 / pageerror=0
```

验收标准：
- ✅ `npm run build` 0 errors
- ✅ 三套主题 Token（`data-theme`/`data-tab-type`/`data-home-type`）正确切换
- ✅ 详情弹层显示 来源 + 置信度
- ✅ ReportCard 打字机生成，含 ¥8,432.60
- ✅ KeyPad 输入 1+2+3 → 金额 ¥123.00
- ✅ 待确认确认流 badge 3 → 2
- ✅ localStorage `laicai.theme` 持久化
- ✅ pageerror = 0

## 3. 原型验收门禁

- ✅ 三版 `prototypes/*.html` 单文件 `file://` 双击可开，0 pageerror
- ✅ iPhone 框模板正确（岛 109×31、状态栏 47、homeind 118×4）
- ✅ 六屏齐（S0 演示 / S1 首页 / S2 流水 / S3 记一笔 / S4 分析 / S5 我的）
- ✅ 统一数据一致（¥16,567.40 结余、3 待确认、瑞幸 -32.50）
- ✅ 动画齐（加载 / 自动记账链路 / count-up）

## 4. 文档验收门禁

- ✅ `scripts/doc_audit.py` 本地一致性通过
- ✅ 新改动同步 `requests/`、`domains/`、`decisions/`
- ✅ 规划项标 `status: planned`，不得写成已实现

## 5. 验证记录复盘

每次验证完成，将命令、结果与已知失败写回命中的 `REQ-*`，并于对应 `DEV-*` 下留存 `RETRO-*` 复盘（如质量趋势回归）。

---

> 完整命令清单（运行前 `cd /Users/tbw/work/privateProject/laicai`）：
> ```bash
> python3 scripts/doc_audit.py
> cd react-app && npm run build && npm run preview &
> python3 ../scripts/smoke_react.py
> python3 scripts/smoke_prototypes.py
> ```