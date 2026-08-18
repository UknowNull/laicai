/**
 * components/Pages.jsx —— 五个主屏（主题无关，消费 useLedger 与通用组件）
 * S1 首页 / S2 流水 / S3 记一笔 / S4 分析 / S5 我的
 */
import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { CATEGORIES, ACCOUNTS, MONTHLY, CAT_RATIO, fmtYuan, fmtMoney, acctName } from '../engine/ledger';
import TxRow from './TxRow';
import CountUp from './CountUp';
import AutoBookDemo from './AutoBookDemo';
import KeyPad from './KeyPad';
import ReportCard from './ReportCard';
import { HomeFactory } from '../layouts/HomeLayouts';

/* ---------------- S1 首页 ---------------- */
export function HomePage({ data }) {
  const { theme } = useTheme();
  const recent = data.txList.slice(0, 4);
  return (
    <>
      <AutoBookDemo />
      {HomeFactory(theme.tokens['--t-home-type'], { data: MONTHLY })}
      <div className="sec-t"><h3>待确认</h3><a onClick={data.openPend}>{data.pending.length} 条待处理 ›</a></div>
      <div className="pend-row" onClick={data.openPend}>
        <div className="pend-l">{data.pending[0]?.merchant} {data.pending[0] ? fmtMoney(data.pending[0].amount) : ''}<small>{data.pending[0]?.reason}</small></div>
        <span className="badge">{data.pending.length}</span>
      </div>
      <div className="ratio-wrap">
        <div className="sec-t" style={{ marginBottom: 4 }}><h3>分类占比</h3><span style={{ fontSize: 11, color: 'var(--t-ink-3)' }}>支出结构 · 本月</span></div>
        <div className="ratio-bar">{CAT_RATIO.map((r) => <span key={r.cat} className="rb" style={{ width: r.pct + '%', background: r.color }} />)}</div>
        <div className="ratio-legend">{CAT_RATIO.map((r) => <span key={r.cat} className="rl"><i style={{ background: r.color }} />{r.cat} {r.pct}%</span>)}</div>
        <div style={{ fontSize: 11, color: 'var(--t-ink-3)', marginTop: 6 }}>覆盖度：已确认 {MONTHLY.coverage}% · {MONTHLY.pendingExcluded} 笔待确认未计入 · 以通知捕获为主</div>
      </div>
      <div className="sec-t"><h3>最近流水</h3><a onClick={() => data.goTab('ledger')}>查看全部 ›</a></div>
      {recent.map((t) => <TxRow key={t.id} tx={t} onOpen={data.openTx} />)}
      <div style={{ textAlign: 'center', color: 'var(--t-ink-3)', fontSize: 11, marginTop: 12, letterSpacing: '.06em' }}>来财记账 · 确定优先 · 自动归集可获取的交易</div>
    </>
  );
}

/* ---------------- S2 流水 ---------------- */
export function LedgerPage({ data }) {
  const list = data.txList.filter((t) => {
    if (data.filter === '支出') return t.amount < 0;
    if (data.filter === '收入') return t.amount > 0;
    if (data.filter === '待确认') return t.status !== 'ok';
    return true;
  }).filter((t) => !data.q || t.merchant.includes(data.q));
  let lastDay = '';
  return (
    <>
      <div className="ph"><h2>流水</h2><span className="act">导入账单 ›</span></div>
      <div className="searchbar"><input placeholder="搜索商户 / 备注…" value={data.q} onChange={(e) => data.setQ(e.target.value)} /></div>
      <div className="chips">{['全部', '支出', '收入', '待确认'].map((f) => <button key={f} className={`chip ${data.filter === f ? 'on' : ''}`} onClick={() => data.setFilter(f)}>{f}</button>)}</div>
      <div id="ledgerList">
        {list.length === 0 ? <div className="empty">无匹配记录</div> : list.map((t) => {
          const dayHeader = t.day !== lastDay ? t.day : null;
          lastDay = t.day;
          return (
            <React.Fragment key={t.id}>
              {dayHeader ? <div className="day-h">{dayHeader}</div> : null}
              <TxRow tx={t} onOpen={data.openTx} />
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}

/* ---------------- S3 记一笔 ---------------- */
export function RecordPage({ data }) {
  return (
    <>
      <div className="ph"><h2>记一笔</h2><span style={{ fontSize: 12, color: 'var(--t-ink-3)' }}>手动记账 · 兜底</span></div>
      <div className="rec-amt"><span className="u">¥</span>{data.recAmt ? Number(data.recAmt).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</div>
      <div className="seg">
        {['支出', '收入', '转账'].map((m) => <button key={m} className={data.recMode === m ? 'on' : ''} onClick={() => { data.setRecMode(m); data.setRecCat(CATEGORIES[m]?.[0] || ''); }}>{m}</button>)}
      </div>
      {CATEGORIES[data.recMode]?.length ? (
        <>
          <div className="rec-grid">{CATEGORIES[data.recMode].map((c) => <button key={c} className={`cell ${data.recCat === c ? 'on' : ''}`} onClick={() => data.setRecCat(c)}>{c}</button>)}</div>
          <div className="acct-label">账户</div>
          <div className="acct-chips">{ACCOUNTS.map((a) => <button key={a.id} className={`acct-chip ${data.recAcct === a.id ? 'on' : ''}`} onClick={() => data.setRecAcct(a.id)}>{a.name}</button>)}</div>
        </>
      ) : <div className="xfer-note">转账不设分类，仅记账户划转</div>}
      <div className="keypad">
        <KeyPad onKey={data.keyPress} onSave={data.saveRec} />
      </div>
    </>
  );
}

/* ---------------- S4 分析 ---------------- */
export function AnalysisPage({ data }) {
  const [qa, setQa] = React.useState(null);
  return (
    <>
      <div className="ph"><h2>分析</h2><span style={{ fontSize: 12, color: 'var(--t-ink-3)' }}>2026年8月 · 确定性优先</span></div>
      <div className="metric-grid">
        <div className="mcell"><div className="mlabel">本月支出</div><div style={{ color: 'var(--t-out)' }}><CountUp target={MONTHLY.expense} prefix="¥" /></div><span className="delta">环比 {MONTHLY.mom}% ↓</span></div>
        <div className="mcell"><div className="mlabel">本月收入</div><div style={{ color: 'var(--t-inc)' }}><CountUp target={MONTHLY.income} prefix="¥" /></div></div>
        <div className="mcell"><div className="mlabel">本月结余</div><div style={{ color: 'var(--t-inc)' }}><CountUp target={MONTHLY.balance} prefix="+¥" /></div></div>
        <div className="mcell"><div className="mlabel">餐饮预算</div><div className="m-txt">超支 <span style={{ color: 'var(--t-out)' }}>+{MONTHLY.budgetOverrun}%</span></div></div>
        <div className="mcell wide"><div className="mlabel">Top 商户（本月）</div><div className="m-txt">星巴克 · {MONTHLY.topMerchant.count} 笔 <span style={{ color: 'var(--t-accent)' }}>{fmtYuan(MONTHLY.topMerchant.amount)}</span></div></div>
      </div>
      <div className="ratio-wrap" style={{ borderTop: 'none', marginTop: 10, paddingTop: 4 }}>
        <div className="ratio-bar">{CAT_RATIO.map((r) => <span key={r.cat} className="rb" style={{ width: r.pct + '%', background: r.color }} />)}</div>
        <div className="ratio-legend">{CAT_RATIO.map((r) => <span key={r.cat} className="rl"><i style={{ background: r.color }} />{r.cat} {r.pct}%</span>)}</div>
      </div>
      <ReportCard
        reportText={data.reportText}
        reportLoading={data.reportLoading}
        reportDone={data.reportDone}
        onGenerate={data.genReport}
      />
      <details className="scope"><summary>数据范围</summary><p>统计区间：8月1日—8月17日 · 仅计入已确认交易 · 待确认记录未计入 · 账户含银行卡与电子钱包。</p></details>
      <div className="qa">
        <h3>问一问</h3>
        <div className="qa-chips">
          {['q1', 'q2'].map((q) => <button key={q} className="qa-chip" onClick={() => setQa(q)}>{q === 'q1' ? '这个月外卖花了多少？' : '餐饮环比怎么变？'}</button>)}
        </div>
        {qa ? <div className="qa-ans show" style={{ whiteSpace: 'pre-wrap' }}>{qa === 'q1'
          ? '按当前已确认账本：本月外卖类已确认 0 笔。最近一笔「美团外卖 ¥45.80」为待确认（分类不明），未计入支出统计——确认后即并入。'
          : '本月餐饮占支出 42%，环比整体下降 12.4%，主因餐饮收敛；Top 商户星巴克 6 笔 ¥186.00，超预算 8%，建议下周减少外带咖啡。'}</div> : null}
      </div>
    </>
  );
}

/* ---------------- S5 我的 ---------------- */
export function MinePage({ data }) {
  return (
    <>
      <div className="ph"><h2>我的</h2><span style={{ fontSize: 12, color: 'var(--t-ink-3)' }}>账户与设置</span></div>
      <div className="sec-t"><h3>账户</h3><span style={{ fontSize: 12, color: 'var(--t-ink-3)' }}>合计 {fmtYuan(ACCOUNTS.reduce((s, a) => s + a.balance, 0))}</span></div>
      {ACCOUNTS.map((a) => (
        <div className="acct-row" key={a.id} onClick={() => data.openAcct(a.name)}>
          <span className="acct-name">{a.name}<small>{a.type === 'bank' ? '借记卡 · 工资卡 · 自动匹配' : a.type === 'cash' ? '现金账户 · 抄账低置信' : '电子钱包 · 高频支付'}</small></span>
          <span className="acct-bal">{fmtYuan(a.balance)}</span>
        </div>
      ))}
      <div className="sec-t"><h3>自动记账</h3></div>
      <div className="sw-row"><div><div className="sw-t">通知监听</div><div className="sw-s">{data.notifOn ? '已开启 · 实时捕获支付通知' : '已中断 · 仅手动记账与导入'}</div></div><button className={`sw ${data.notifOn ? 'on' : ''}`} onClick={data.toggleNotif}><span className="knob" /></button></div>
      <div className="sw-row"><div><div className="sw-t">云端分析授权</div><div className="sw-s">{data.cloudOn ? '已授权 · 仅上传所需指标' : '未授权 · 数据不出站'}</div></div><button className={`sw ${data.cloudOn ? 'on' : ''}`} onClick={data.toggleCloud}><span className="knob" /></button></div>
      <div className={`cloud-warn ${data.cloudOn ? '' : 'show'}`}>关闭后仅保留本地确定性指标：报告与问答不可用，记账与统计不受影响。</div>
      <div className="sec-t"><h3>数据</h3></div>
      <div className="menu-row"><span>加密备份</span><span className="arr">›</span></div>
      <div className="menu-row"><span>恢复备份</span><span className="arr">›</span></div>
      <div className="menu-row" onClick={data.resetData} style={{ cursor: 'pointer' }}><span>重置演示数据</span><span className="arr">↺</span></div>
      <div className="privacy">隐私声明：通知正文仅内存解析、不落盘；数据本地优先，可导出；云端分析显式授权、可一键关闭。</div>
      <div className="app-version">来财记账 <b>{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'v0.0.0'}</b> · build {typeof __APP_BUILD__ !== 'undefined' ? __APP_BUILD__ : '-'}</div>
    </>
  );
}