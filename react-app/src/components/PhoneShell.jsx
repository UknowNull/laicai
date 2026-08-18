/**
 * components/PhoneShell.jsx —— iPhone 设备框（统一模板，任何页面复用）
 */
import React from 'react';

export default function PhoneShell({ children }) {
  return (
    <div className="phone-shell">
      <div className="phone-island" />
      <div className="phone-statusbar">
        <span>9:41</span>
        <span className="phone-sbIcons">▂▄▆<span style={{ fontSize: 11 }}>100%</span></span>
      </div>
      <div className="screen">{children}</div>
      <div className="phone-homeind" />
    </div>
  );
}