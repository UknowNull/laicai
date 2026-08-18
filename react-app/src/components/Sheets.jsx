/**
 * components/Sheets.jsx —— 弹层（交易详情 / 待确认 / 账户详情）
 */
import React from 'react';
import { fmtMoney, acctName, ACCOUNTS } from '../engine/ledger';

export function Sheets({ data }) {
  const m = data.modal;
  const close = () => data.setModal(null);

  return (
    <>
      <div className={`veil ${m ? 'on' : ''}`} onClick={close} />
      {m?.type === 'tx' && (
        <div className={`sheet ${m ? 'on' : ''}`}>
          <button className="sheet-close" onClick={close}>×</button>
          <div style={{ fontSize: 30, fontWeight: 600, textAlign: 'center', margin: '4px 0 14px', color: m.payload.amount < 0 ? 'var(--t-out)' : 'var(--t-inc)', fontFamily: 'var(--t-num-font)' }}>{fmtMoney(m.payload.amount)}</div>
          <div className="ds-row"><span className="k">商户</span><span>{m.payload.merchant}</span></div>
          <div className="ds-row"><span className="k">分类</span><span>{m.payload.cat}</span></div>
          <div className="ds-row"><span className="k">账户</span><span>{acctName(m.payload.acctId)}</span></div>
          <div className="ds-row"><span className="k">时间</span><span>{m.payload.day} {m.payload.time}</span></div>
          <div className="ds-row"><span className="k">来源</span><span className={m.payload.status === 'ok' ? 'ds-tag ok' : 'ds-tag'}>{m.payload.src}</span></div>
          <div className="ds-row"><span className="k">置信度</span><span>{Math.round(m.payload.conf * 100)}%{m.payload.status !== 'ok' ? ' · 低于阈值' : ''}</span></div>
          <div className="ds-row"><span className="k">备注</span><span>{m.payload.pendReason || '—'}</span></div>
          <div className="ds-actions">
            <button onClick={() => data.editTx()}>编辑</button>
            <button className="danger" onClick={() => data.deleteTx(m.payload.id)}>删除</button>
          </div>
        </div>
      )}
      {m?.type === 'pend' && (
        <div className={`sheet ${m ? 'on' : ''}`}>
          <button className="sheet-close" onClick={close}>×</button>
          <h3>待确认</h3>
          {data.pending.map((p) => (
            <div className="pend-item" key={p.id}>
              <div className="pi-l">{p.merchant} {fmtMoney(p.amount)}<small>{p.day} · {p.reason}</small></div>
              <div className="pi-btns">
                <button className="ok" onClick={() => data.confirmPend(p.id)}>确认</button>
                <button onClick={() => data.ignorePend(p.id)}>忽略</button>
              </div>
            </div>
          ))}
          <div className="sheet-hint">确认前不计入收支与统计 · 每条可单独处理</div>
        </div>
      )}
      {m?.type === 'acct' && (
        <div className={`sheet ${m ? 'on' : ''}`}>
          <button className="sheet-close" onClick={close}>×</button>
          <h3>{m.payload}</h3>
          {ACCOUNTS.filter((a) => a.name === m.payload).map((a) => (
            <React.Fragment key={a.id}>
              <div style={{ fontSize: 28, textAlign: 'center', margin: '6px 0 14px', color: 'var(--t-inc)', fontFamily: 'var(--t-num-font)' }}>{fmtMoney(a.balance)}</div>
              <div className="ds-row"><span className="k">类型</span><span>{a.type === 'bank' ? '借记卡 · 尾号 ' + a.tail : a.type + ' 账户'}</span></div>
              <div className="ds-row"><span className="k">说明</span><span>{a.note}</span></div>
              <div className="ds-row"><span className="k">记账方式</span><span>{a.type === 'cash' ? '手动 · 抄账' : '通知自动捕获'}</span></div>
            </React.Fragment>
          ))}
          <div className="ds-actions"><button style={{ background: 'var(--t-accent)', color: 'var(--t-bg-app)' }} onClick={close}>调整余额（演示）</button></div>
        </div>
      )}
    </>
  );
}