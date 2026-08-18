#!/usr/bin/env python3
"""来财记账 文档一致性审计（对齐 ReelForge doc_audit 思路的精简版）。

职责：
  1. 检查本次 Git 变更文件中是否命中了 REQ/BUG 编号（若变更代码/领域文档却无相关记录则提示）。
  2. 校验根级 AGENTS.md 路由表提到的文件都存在。
  3. 校验 doc/requests 与 doc/development 中的 status 词汇合法。
  4. 校验 references/README 引用的文件存在。
  5. --report 模式：全量列出 requests/issues 的状态分布。

不扫描全部领域文档内容，也不替代人工维护需求与代码之间的语义映射。

用法：
  python3 scripts/doc_audit.py            # 常态检查（Git 变更 + 结构）
  python3 scripts/doc_audit.py --report   # 历史盘点（状态分布）
"""
import argparse
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOC = ROOT / "doc"

REQ_STATES = {"proposed", "approved", "implementing", "verified", "closed", "blocked"}
BUG_STATES = {"open", "investigating", "fixed", "verified", "wont-fix"}

# AGENTS.md 路由表中应存在的关键文件
REQUIRED_FILES = [
    "AGENTS.md",
    "doc/README.md",
    "doc/00-project-context.md",
    "doc/01-product-requirements.md",
    "doc/02-system-architecture.md",
    "doc/03-engineering-invariants.md",
    "doc/04-development-workflow.md",
    "doc/05-verification.md",
    "doc/06-model-onboarding.md",
    "doc/07-operations-runbook.md",
    "doc/08-acceptance-standards.md",
    "doc/domains/theme-system.md",
    "doc/domains/ledger-engine.md",
    "doc/domains/auto-capture.md",
    "doc/domains/import-pipeline.md",
    "doc/domains/analysis-llm.md",
    "doc/domains/privacy-security.md",
    "doc/decisions/ADR-001-document-authority.md",
    "doc/decisions/ADR-002-theme-architecture.md",
    "doc/decisions/ADR-003-deterministic-first.md",
    "doc/decisions/ADR-004-dedup-id.md",
    "doc/decisions/ADR-005-privacy-boundary.md",
    "doc/generated/README.md",
    "doc/references/README.md",
    "scripts/doc_audit.py",
]


def git_changed_files() -> list[str]:
    try:
        out = subprocess.run(
            ["git", "-C", str(ROOT), "status", "--porcelain"],
            capture_output=True, text=True, timeout=10,
        )
        return [line[3:] for line in out.stdout.splitlines() if line.strip()]
    except Exception:
        return []


def check_required_files() -> list[str]:
    missing = [f for f in REQUIRED_FILES if not (ROOT / f).exists()]
    return [f"缺失必需文件: {f}" for f in missing]


def check_req_bug_sync(changed: list[str]) -> list[str]:
    """代码/领域文档变更若命中 REQ/BUG 状态，提示确认已同步。"""
    problems = []
    for f in changed:
        if f.startswith("doc/"):
            continue
        text = (ROOT / f).read_text(encoding="utf-8", errors="ignore") if (ROOT / f).is_file() else ""
        ids = sorted(set(re.findall(r"\b(REQ-\d{8}-[\w-]+)", text)))
        if ids:
            for rid in ids:
                if not (DOC / "requests" / f"{rid}.md").exists():
                    problems.append(f"{f} 引用 {rid} 但 doc/requests/{rid}.md 不存在")
    return problems


def check_status_vocab() -> list[str]:
    problems = []
    for kind, states in (("requests", REQ_STATES), ("issues", BUG_STATES)):
        d = DOC / kind
        if not d.exists():
            continue
        for md in sorted(d.glob("*.md")):
            if md.name == "README.md":
                continue
            text = md.read_text(encoding="utf-8", errors="ignore")
            m = re.search(r"^status:\s*(\S+)", text, re.M)
            if m and m.group(1) not in states:
                problems.append(f"{md.relative_to(ROOT)} status 非法: {m.group(1)}")
    return problems


def check_references() -> list[str]:
    problems = []
    readme = DOC / "references" / "README.md"
    if not readme.exists():
        return ["doc/references/README.md 缺失"]
    text = readme.read_text(encoding="utf-8", errors="ignore")
    for m in re.finditer(r"`([^`]+\.md)`", text):
        name = m.group(1)
        # 优先以 references/ 内文件为准；根目录同名文件（PRD.md 等）合法引用
        if (DOC / "references" / name).exists():
            continue
        if (ROOT / name).exists():
            continue
        problems.append(f"references README 引用缺失: {name}")
    return problems


def report() -> list[str]:
    lines = ["--- 历史盘点 ---"]
    for kind, states in (("requests", REQ_STATES), ("issues", BUG_STATES)):
        d = DOC / kind
        if not d.exists():
            continue
        counts: dict[str, int] = {}
        for md in sorted(d.glob("*.md")):
            if md.name == "README.md":
                continue
            text = md.read_text(encoding="utf-8", errors="ignore")
            m = re.search(r"^status:\s*(\S+)", text, re.M)
            s = m.group(1) if m else "?" 
            counts[s] = counts.get(s, 0) + 1
        lines.append(f"{kind}: {dict(sorted(counts.items()))}")
    lines.append(f"requests 文件数: {max(len(list((DOC/'requests').glob('*.md')))-1, 0)}")
    issues_dir = DOC / 'issues'
    issues_count = max(len(list(issues_dir.glob('*.md')))-1, 0) if issues_dir.exists() else 0
    lines.append(f"issues 文件数: {issues_count}")
    return lines


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--report", action="store_true", help="历史盘点模式")
    args = ap.parse_args()

    if args.report:
        for line in report():
            print(line)
        return 0

    problems: list[str] = []
    problems += check_required_files()
    problems += check_references()
    problems += check_status_vocab()

    changed = git_changed_files()
    if changed:
        problems += check_req_bug_sync(changed)
        print(f"Git 变更文件: {len(changed)}")
        for f in changed:
            print(f"  {f}")
    else:
        print("Git 无变更或非 git 仓库（跳过变更同步检查）")

    if problems:
        print("文档审计未通过：")
        for p in problems:
            print(f"  ✗ {p}")
        return 1
    print("文档审计通过 ✓")
    return 0


if __name__ == "__main__":
    sys.exit(main())