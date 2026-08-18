#!/usr/bin/env python3
"""来财记账 版本工具 —— 唯一来源 `react-app/version.json`。

用法：
  python3 scripts/version.py            # 打印当前版本 v0.x.x
  python3 scripts/version.py bump       # 校验 version.json 合法
  python3 scripts/version.py bump minor # 递增 build（或 minor 位），写入并打印
  python3 scripts/version.py check v0.1.2  # 校验格式（exit 0/1）
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VERSION_FILE = ROOT / "react-app" / "version.json"

VERSION_RE = re.compile(r"^v\d+\.\d+\.\d+$")


def load() -> dict:
    with open(VERSION_FILE, encoding="utf-8") as f:
        return json.load(f)


def check(ver: str) -> bool:
    return bool(VERSION_RE.match(ver))


def bump(mode: str) -> str:
    d = load()
    d["build"] = int(d.get("build", 1)) + 1
    if mode == "minor":
        parts = d["version"][1:].split(".")
        parts[1] = str(int(parts[1]) + 1)
        d["version"] = "v" + ".".join(parts)
    d["updated"] = "2026-08-18"
    with open(VERSION_FILE, "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
        f.write("\n")
    return d["version"]


def main() -> int:
    args = sys.argv[1:]
    if not args:
        print(load()["version"])
        return 0
    cmd = args[0]
    if cmd == "bump":
        mode = args[1] if len(args) > 1 else "build"
        print(bump(mode))
        return 0
    if cmd == "check":
        ver = args[1] if len(args) > 1 else load()["version"]
        if not check(ver):
            print(f"版本号格式非法: {ver}（应为 v0.x.x）", file=sys.stderr)
            return 1
        print(f"OK {ver}")
        return 0
    print(f"未知命令: {cmd}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())