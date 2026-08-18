/**
 * components/PhoneShell.jsx —— 设备框（双模式）
 *
 * - 浏览器预览（原型/演示）：渲染 iPhone 设备框（灵动岛+状态栏+Home 条），
 *   固定 340×748，居中展示。
 * - 原生 App（Capacitor Android/iOS）：不渲染设备框，直接全屏铺满
 *   （edge-to-edge，由系统 UI 管理状态栏/导航栏）。
 *
 * 通过 window.Capacitor?.isNativePlatform() 运行时判定。
 */
import React, { useEffect } from 'react';

const isNative =
  typeof window !== 'undefined' && typeof window.Capacitor !== 'undefined'
    ? window.Capacitor.isNativePlatform()
    : false;

export default function PhoneShell({ children }) {
  useEffect(() => {
    if (isNative) {
      document.body.classList.add('native');
      // 适配凸出区域（异形屏/灵动岛/安全区）
      document.body.style.padding = 'env(safe-area-inset-top) 0 env(safe-area-inset-bottom) 0';
    }
    return () => {
      if (isNative) {
        document.body.classList.remove('native');
        document.body.style.padding = '';
      }
    };
  }, []);

  if (isNative) {
    // 原生 App 全屏：不渲染设备框，直接铺满 WebView
    return <div className="app-native">{children}</div>;
  }
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