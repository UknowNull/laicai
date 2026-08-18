/**
 * layouts/HomeLayouts.jsx —— 三套首页布局（骨架差异）
 * home-type token: ledger | hero | ring
 * 来自内容的母题：记账 = 账本的数字 / 实时的余额 / 财富的环→ 决定首页如何陈列「结余」。
 */
import React, { useEffect, useRef } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { ACCOUNTS, TOTAL_BALANCE, MONTHLY, CAT_RATIO, fmtYuan } from '../engine/ledger';
import TxRow from '../components/TxRow';
import CountUp from '../components/CountUp';
import AutoBookDemo from '../components/AutoBookDemo';

function RingAsset({ total = TOTAL_BALANCE }) {
  const segs = [
    { id: 's1', v: ACCOUNTS[0].balance, c: '#C7A25B' },
    { id: 's2', v: ACCOUNTS[1].balance, c: '#8FB573' },
    { id: 's3', v: ACCOUNTS[2].balance, c: '#5FA8A0' },
    { id: 's4', v: ACCOUNTS[3].balance, c: '#B79A6D' },
  ];
  const sum = segs.reduce((s, x) => s + x.v, 0);
  const len = 515.2; // 圆周
  const an = 1.2;
  useEffect(() => {
    segs.forEach((s, i) => {
      const off = len - (len * (s.v / sum));
      const el = document.getElementById(s.id);
      if (el) { el.style.strokeDasharray = len + ' ' + len; el.style.strokeDashoffset = off; }
    });
  }, []);
  return (
    <div className="ringwrap">
      <svg viewBox="0 0 196 196">
        <circle cx="98" cy="98" r="82" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="12" />
        {segs.map((s) => <circle key={s.id} id={s.id} cx="98" cy="98" r="82" fill="none" stroke={s.c} strokeWidth="12" strokeDasharray={len} strokeDashoffset={len} />)}
      </svg>
      <div className="ring-center">
        <span className="rl">总资产</span>
        <span className="rv"><CountUp target={total} prefix="¥" /></span>
        <span className="rt">TAKE STOCK</span>
      </div>
    </div>
  );
}

// 简约：账本数字栏
export function HomeLedger({ data }) {
  return (
    <div className="hero anim-in" style={{ animationDelay: '60ms' }}>
      <div className="hero-month">AUGUST · 2026</div>
      <div className="ledger-nums">
        <div className="ln-row"><span className="ln-label">结余</span>
          <span className="ln-amt inc"><CountUp target={data.balance} prefix="+¥" /></span></div>
        <div className="ln-row"><span className="ln-label">支出</span>
          <span className="ln-amt out"><CountUp target={data.expense} prefix="¥" /></span></div>
        <div className="ln-row"><span className="ln-label">收入</span>
          <span className="ln-amt inc"><CountUp target={data.income} prefix="¥" /></span></div>
      </div>
      <div className="hero-cap">本月支出 ¥{data.expense.toLocaleString('zh-CN')} · 环比 {data.mom}% ↓</div>
    </div>
  );
}

// 时尚：整屏大卡 + Live + 收支双卡
export function HomeHero({ data, onDemo }) {
  return (
    <div className="hero anim-in" style={{ animationDelay: '80ms' }}>
      <div className="live-pill"><span className="live-dot"></span> Live · 实时监听中</div>
      <div className="hero-bal"><span className="hb-s">¥</span><CountUp target={data.balance} /></div>
      <div className="hero-cap">本月结余 · 环比 {data.mom}%</div>
      <div className="bal-trio">
        <div className="bcard out"><div className="bl">支出</div><div className="bv"><CountUp target={data.expense} prefix="¥" /></div><div className="bd">环比 {data.mom}% ↓</div></div>
        <div className="bcard inc"><div className="bl">收入</div><div className="bv"><CountUp target={data.income} prefix="¥" /></div><div className="bd">本月</div></div>
      </div>
    </div>
  );
}

// 奢华：金色资产环
export function HomeRing({ data }) {
  return (
    <div className="hero anim-in" style={{ animationDelay: '80ms' }}>
      <div className="hero-month">AUGUST · 2026</div>
      <RingAsset />
      <div className="hero-cap">本月结余 +¥{data.balance.toLocaleString('zh-CN')} · 环比 {data.mom}% ↓</div>
      <div className="bal-trio">
        <div className="bcard out"><div className="bl">本月支出</div><div className="bv"><CountUp target={data.expense} prefix="¥" /></div></div>
        <div className="bcard inc"><div className="bl">本月收入</div><div className="bv"><CountUp target={data.income} prefix="¥" /></div></div>
      </div>
    </div>
  );
}

export function HomeFactory(type, props) {
  return type === 'hero' ? <HomeHero {...props} /> : type === 'ring' ? <HomeRing {...props} /> : <HomeLedger {...props} />;
}