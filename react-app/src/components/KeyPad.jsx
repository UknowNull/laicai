/**
 * components/KeyPad.jsx —— 记一笔数字键盘（主题化，独立组件）
 * 按键：1-9 / 退格 / 0 / 保存。由 Pages/RecordPage 组合使用。
 */
import React from 'react';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'save'];

export default function KeyPad({ onKey, onSave }) {
  return (
    <div className="keypad">
      {KEYS.map((k) => (
        <button
          key={k}
          className={`key ${k === 'save' ? 'save' : ''}`}
          onClick={() => (k === 'save' ? onSave() : onKey(k))}
        >
          {k === 'del' ? '⌫' : k === 'save' ? '保存' : k}
        </button>
      ))}
    </div>
  );
}