/**
 * components/TabBar.jsx —— 底部 Tab（主题化：text/pill/diamond 三形态，由 data-tab-type 决定）
 */
import React from 'react';
import { TABS } from '../engine/useLedger';

const LABELS = { home: '首页', ledger: '流水', record: '记一笔', analysis: '分析', mine: '我的' };

export default function TabBar({ tab, onGo }) {
  return (
    <nav className="tabbar">
      {TABS.map((id) => (
        <button
          key={id}
          className={`tab ${tab === id ? 'on' : ''} ${id === 'record' ? 'tab-center' : ''}`}
          onClick={() => onGo(id)}
        >
          <span className="tdot" />
          <span>{id === 'record' ? <span className="plus">＋</span> : null}{LABELS[id]}</span>
        </button>
      ))}
    </nav>
  );
}