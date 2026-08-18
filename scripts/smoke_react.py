#!/usr/bin/env python3
"""来财记账 React 工程冒烟（对齐 doc/05-verification.md）。

用法（需先启动 preview/dev server）：
  cd react-app && npm run preview &
  python3 ../scripts/smoke_react.py --url http://127.0.0.1:4173
"""
import argparse
import json
import pathlib
import subprocess
import sys

PW_MAIN = "/Users/tbw/.nvm/versions/node/v24.2.0/lib/node_modules/@playwright/mcp/node_modules/playwright"
CHROME = "/Users/tbw/Library/Caches/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-arm64/chrome-headless-shell"

SCRIPT = r"""
const { chromium } = require(process.env.PW_MAIN);
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: process.env.PW_CHROME });
  const p = await b.newPage({ viewport: { width: 1000, height: 900 } });
  const errors = [];
  p.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  p.on('console', m => m.type() === 'error' && errors.push('CONSOLE: ' + m.text()));
  await p.goto(process.env.PW_URL);
  await p.waitForTimeout(3000);

  const out = {};
  const body = await p.textContent('body');
  out.init = {
    phone: await p.locator('.phone-shell').count(),
    themePicker: await p.locator('.tp-btn').count(),
    tabs: await p.locator('.tab').count(),
    keypad: await p.locator('.keypad .key').count(),
    reportCard: await p.locator('.rep-card').count(),
    hasBalance: body.includes('16,567'),
  };

  /* --- 主题切换：经 S5 我的 → 外观 设置区（主题切换入口迁至此处） --- */
  await p.locator('.tab').nth(4).click(); await p.waitForTimeout(400);
  const pickerCount = await p.locator('.tp-btn').count();
  async function info(i) {
    await p.locator('.tp-btn').nth(i).click(); await p.waitForTimeout(450);
    return p.evaluate(() => ({
      theme: document.documentElement.getAttribute('data-theme'),
      tab: document.documentElement.getAttribute('data-tab-type'),
      home: document.documentElement.getAttribute('data-home-type'),
    }));
  }
  out.mineThemePicker = pickerCount;
  out.fashion = await info(1);
  out.luxury  = await info(2);
  out.minimal = await info(0);
  await p.locator('.tab').nth(0).click(); await p.waitForTimeout(400); // 回首页

  /* --- 详情弹层 --- */
  const row = p.locator('.tx-line, .tx-capsule').first();
  await row.click(); await p.waitForTimeout(400);
  const st = await p.locator('.sheet.on').textContent().catch(() => '');
  out.detailSheet = { count: await p.locator('.sheet.on').count(), hasSource: st.includes('来源'), hasConf: st.includes('置信度') };
  await p.locator('.sheet-close').click().catch(() => {}); await p.waitForTimeout(250);

  /* --- 分析页 ReportCard --- */
  await p.locator('.tab').nth(3).click(); await p.waitForTimeout(500);
  await p.locator('.rep-btn').click(); await p.waitForTimeout(2700);
  const rt = await p.locator('.rep-paper p').textContent().catch(() => '');
  out.report = { len: (rt || '').length, has8432: (rt || '').includes('8,432.60') };

  /* --- 键盘输入 --- */
  await p.locator('.tab').nth(2).click(); await p.waitForTimeout(400);
  await p.locator('.key').nth(0).click(); await p.locator('.key').nth(1).click(); await p.locator('.key').nth(2).click();
  await p.waitForTimeout(200);
  out.keypad = (await p.locator('.rec-amt').textContent() || '').replace(/\\s+/g, '');

  /* --- 待确认：3 → 2 --- */
  await p.locator('.tab').nth(0).click(); await p.waitForTimeout(500);
  out.pendBefore = await p.locator('.badge').textContent().catch(() => '?');
  await p.locator('.pend-row').click(); await p.waitForTimeout(300);
  await p.locator('.pi-btns .ok').first().click(); await p.waitForTimeout(300);
  out.pendAfter = await p.locator('.badge').textContent().catch(() => '?');

  /* --- 持久化 --- */
  out.localStorage = await p.evaluate(() => localStorage.getItem('laicai.theme'));
  out.errors = errors;

  console.log(JSON.stringify(out));
  await p.close(); await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
"""


def run(url: str) -> int:
    env_script = pathlib.Path(__file__).parent / "_smoke_react_script.cjs"
    env_script.write_text(SCRIPT, encoding="utf-8")
    res = subprocess.run(
        ["node", str(env_script)],
        capture_output=True, text=True, timeout=120,
        env={"PATH": "/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin",
             "PW_MAIN": PW_MAIN, "PW_CHROME": CHROME, "PW_URL": url,
             "HOME": "/Users/tbw", "NODE_OPTIONS": "--no-warnings"},
    )
    env_script.unlink(missing_ok=True)
    if res.returncode != 0:
        print("冒烟失败：", res.stderr[-2000:])
        return 1
    data = json.loads(res.stdout.strip().splitlines()[-1])
    print(json.dumps(data, ensure_ascii=False, indent=2))
    fail = False
    # 手机框（浏览器预览模式）
    if data.get("init", {}).get("phone") != 1: fail = True; print("✗ 手机框缺失")
    # 主题设置区块（S5 我的 / 外观）
    if data.get("mineThemePicker") != 3: fail = True; print("✗ 主题设置按钮数量异常（期望3）")
    # 主题切换回落
    if data.get("minimal", {}).get("theme") != "minimal": fail = True; print("✗ 主题回落异常")
    # 详情弹层
    if not data.get("detailSheet", {}).get("hasSource"): fail = True; print("✗ 详情弹层缺 来源")
    # 键盘
    if data.get("keypad") != "¥123.00": fail = True; print("✗ 键盘输入异常")
    # 待确认
    if data.get("pendBefore") != "3" or data.get("pendAfter") != "2": fail = True; print("✗ 待确认 3→2 未达成")
    # 无 pageerror
    if data.get("errors"): fail = True; print("✗ pageerror/console error:", data["errors"])
    print("冒烟", "通过 ✓" if not fail else "未通过 ✗")
    return 0 if not fail else 1


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="http://127.0.0.1:4173")
    args = ap.parse_args()
    return run(args.url)


if __name__ == "__main__":
    sys.exit(main())