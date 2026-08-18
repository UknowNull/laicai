#!/usr/bin/env python3
"""来财记账 三版原型 + 总览页冒烟（file:// 双击可开，0 pageerror）。

用法：
  python3 scripts/smoke_prototypes.py            # 全部
  python3 scripts/smoke_prototypes.py --url /path/to/index.html
"""
import argparse
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PW_MAIN = "/Users/tbw/.nvm/versions/node/v24.2.0/lib/node_modules/@playwright/mcp/node_modules/playwright"
CHROME = "/Users/tbw/Library/Caches/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-arm64/chrome-headless-shell"

TARGETS = ["index.html", "prototypes/minimal.html", "prototypes/fashion.html",
           "prototypes/luxury.html", "theme-switcher.html"]

SCRIPT = r"""
const { chromium } = require(process.env.PW_MAIN);
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: process.env.PW_CHROME });
  const out = {};
  for (const target of process.env.PW_TGT.split('|')) {
    const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
    const errors = [];
    p.on('pageerror', e => errors.push(e.message));
    p.on('console', m => m.type() === 'error' && errors.push(m.text()));
    await p.goto('file://' + target);
    await p.waitForTimeout(2000);
    out[target.split('/').pop()] = {
      title: await p.title().catch(() => ''),
      textLen: (await p.textContent('body').catch(() => '')).length,
      errors,
    };
    await p.close();
  }
  console.log(JSON.stringify(out));
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
"""


def run_single(url: str) -> dict:
    env_script = pathlib.Path(__file__).parent / "_smoke_proto_script.cjs"
    env_script.write_text(SCRIPT, encoding="utf-8")
    res = subprocess.run(
        ["node", str(env_script)],
        capture_output=True, text=True, timeout=120,
        env={"PATH": "/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin",
             "PW_MAIN": PW_MAIN, "PW_CHROME": CHROME,
             "PW_TGT": "|".join([str(ROOT / t) for t in TARGETS]),
             "HOME": "/Users/tbw", "NODE_OPTIONS": "--no-warnings"},
    )
    env_script.unlink(missing_ok=True)
    if res.returncode != 0:
        print("失败：", res.stderr[-2000:])
        return {}
    return json.loads(res.stdout.strip().splitlines()[-1])


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", help="只冒烟单个文件")
    args = ap.parse_args()

    if args.url:
        # 简易单目标模式：把 TARGETS 临时换为传入文件
        global TARGETS
        TARGETS = [args.url]

    data = run_single("")
    if not data:
        return 1
    fail = False
    for name, r in data.items():
        ok = r["textLen"] > 0 and not r["errors"]
        status = "✓" if ok else "✗"
        print(f"{status} {name}: 内容 {r['textLen']} 字符, errors={r['errors']}")
        if not ok:
            fail = True
    print("原型冒烟", "通过 ✓" if not fail else "未通过 ✗")
    return 0 if not fail else 1


if __name__ == "__main__":
    sys.exit(main())