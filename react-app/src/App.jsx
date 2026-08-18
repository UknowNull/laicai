/**
 * App.jsx —— 主题化壳：一台 iPhone 内渲染全部主题，运行时切换
 * 顶部粘式切换条：简约 / 时尚 / 奢华（localStorage 记忆）
 */
import React from 'react';
import { ThemeProvider, useTheme } from './theme/ThemeProvider';
import useLedger from './engine/useLedger';
import PhoneShell from './components/PhoneShell';
import TabBar from './components/TabBar';
import { HomePage, LedgerPage, RecordPage, AnalysisPage, MinePage } from './components/Pages';
import { Sheets } from './components/Sheets';
import { fmtYuan, fmtMoney, acctName, ACCOUNTS } from './engine/ledger';

function ThemeStrip() {
  const { themeId, setTheme, themes } = useTheme();
  return (
    <div className="theme-strip">
      <span className="ts-name">来财记账 · 主题</span>
      {Object.values(themes).map((t) => (
        <button key={t.id} className={`ts-btn ${themeId === t.id ? 'on' : ''}`} onClick={() => setTheme(t.id)}>
          {t.name}
        </button>
      ))}
    </div>
  );
}

function AppInner() {
  const d = useLedger();
  return (
    <>
      <ThemeStrip />
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
      <div style={{ marginTop: 18, fontSize: 12, color: 'rgba(237,231,216,.6)', letterSpacing: '.1em', textAlign: 'center', maxWidth: 460 }} className="theme-note">
        同一引擎 · 三种皮肤 —— 切换主题即时重绘（颜色/字体/骨架由 Design Token 控制，数据与交互完全一致）
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}