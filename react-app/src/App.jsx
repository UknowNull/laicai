/**
 * App.jsx —— 主题化壳：一台设备内渲染全部页面，运行时切换主题
 * 主题切换入口在 S5 我的（设置区），不再占用主页面顶部。
 * 原生（Capacitor）下无设备框全屏渲染；浏览器预览保留 iPhone 框。
 */
import React from 'react';
import { ThemeProvider } from './theme/ThemeProvider';
import useLedger from './engine/useLedger';
import PhoneShell from './components/PhoneShell';
import TabBar from './components/TabBar';
import { HomePage, LedgerPage, RecordPage, AnalysisPage, MinePage } from './components/Pages';
import { Sheets } from './components/Sheets';

function AppInner() {
  const d = useLedger();
  return (
    <PhoneShell>
      <div className="app">
        <div className="viewport">
          <div className={`page ${d.tab === 'home' ? 'active' : ''}`}><HomePage data={d} /></div>
          <div className={`page ${d.tab === 'ledger' ? 'active' : ''}`}><LedgerPage data={d} /></div>
          <div className={`page ${d.tab === 'record' ? 'active' : ''}`}><RecordPage data={d} /></div>
          <div className={`page ${d.tab === 'analysis' ? 'active' : ''}`}><AnalysisPage data={d} /></div>
          <div className={`page ${d.tab === 'mine' ? 'active' : ''}`}><MinePage data={d} /></div>
          <Sheets data={d} />
        </div>
        <TabBar tab={d.tab} onGo={d.goTab} />
        <div className={`toast ${d.toast ? 'on' : ''}`}>{d.toast}</div>
      </div>
    </PhoneShell>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}