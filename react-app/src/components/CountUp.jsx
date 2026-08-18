/**
 * components/CountUp.jsx —— 数字滚动动画（count-up，主题无关）
 * 挂载后从 0 滚动到 target，ease-out-cubic，与原型一致。
 */
import React, { useEffect, useRef, useState } from 'react';

export default function CountUp({ target, prefix = '', duration = 1100, style }) {
  const [val, setVal] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(target * e);
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  const txt = prefix + Math.abs(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return <span style={style}>{txt}</span>;
}