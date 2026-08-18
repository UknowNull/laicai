/**
 * components/AutoBookDemo.jsx —— 自动记账演示（S0）
 * 链路动画：通知滑入 → 解析字段高亮 → 自动入账打勺
 */
import React, { useEffect, useRef } from 'react';

export default function AutoBookDemo() {
  const [playing, setPlaying] = React.useState(false);
  const [idx, setIdx] = React.useState(0);
  const timer = useRef(null);

  const frames = [
    { key: 'notif', label: '微信支付 · 刚刚 收到支付通知' },
    { key: 'parse', label: '解析字段 → 商户：瑞幸咖啡 · 金额：-¥27.50 · 类别：餐饮' },
    { key: 'entry', label: '✓ 已自动入账 ⋅ 来财记账 · 微信零钱 · 餐饮 -¥27.50' },
  ];

  const play = () => {
    if (playing) return;
    setPlaying(true); setIdx(0);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setIdx(1), 800);
    timer.current = setTimeout(() => setIdx(2), 1500);
    timer.current = setTimeout(() => setPlaying(false), 2400);
  };

  return (
    <div className="demo-card">
      <div className="demo-head">
        <span className="demo-title">自动记账 · 演示</span>
        <div className="demo-btns">
          <button className="btn" onClick={play}>播放演示</button>
          <button className="btn">重播</button>
        </div>
      </div>
      <div className="demo-stage">
        <div className={`dm-frame ${idx >= 0 ? 'dm-notif on' : ''}`}>
          <div className="parse-line">微信支付 · 刚刚</div>
          <div className="notif"><div className="notif-top"><span>微信支付</span><span>交易提醒</span></div><div className="notif-body">你在<b>瑞幸咖啡</b>消费 <b>¥27.50</b></div></div>
        </div>
        <div className={`dm-frame ${idx >= 1 ? 'dm-parse on' : ''}`}>
          <div className="parse-line">确定性解析 · 规则代码</div>
          <div className="parse-fields">
            <span className="pf hl">金额 ¥27.50</span><span className="pf hl">方向 支出</span>
            <span className="pf hl">商户 瑞幸咖咖</span><span className="pf">分类 餐饮</span><span className="pf">置信 高</span>
          </div>
        </div>
        <div className={`dm-frame ${idx >= 2 ? 'dm-entry on' : ''}`}>
          <div className="dm-entry"><span className="dm-check">✓</span><span>已自动入账 ⋅ 瑞幸咖啡 微信零钱 ⋅ 餐饮</span></div>
        </div>
      </div>
      <div className="dm-caption"> 示例交易仅演示链路，不影响真实账单。</div>
    </div>
  );
}

// 启动页（S0）：演示屏 + 首页聚焦
export function LaunchScreen({ children, onPlayDemo }) {
  const [show, setShow] = React.useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 1200); return () => clearTimeout(t); }, []);
  return (
    <div className="hero">
      <div className="hero-month">LAICAI · BOOKKEEPING</div>
      <div className="hero-bal"><span className="hb-s">¥</span>16,567.40</div>
      <div className="hero-cap">本月结余 · 自动归集可获取的交易</div>
      <AutoBookDemo onPlayDemo={onPlayDemo} />
      {!show && children}
    </div>
  );
}