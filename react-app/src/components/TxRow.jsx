/**
 * components/TxRow.jsx —— 流水行（主题化：line 细线 / capsule 胶囊，由 data-row-type 决定）
 */
import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { fmtMoney, acctName } from '../engine/ledger';

export default function TxRow({ tx, onOpen }) {
  const { theme } = useTheme();
  const rowType = theme.tokens['--t-row-type']; // line | capsule
  const cls = rowType === 'capsule' ? 'tx-capsule' : 'tx-line';
  const out = tx.amount < 0;
  return (
    <div className={cls} onClick={() => onOpen(tx.id)}>
      <div>
        <div className="tx-merc">{tx.merchant} {tx.status === 'ok' ? <span className="ck">✓</span> : null}</div>
        <div className="tx-meta">{tx.time} · {tx.cat} · {acctName(tx.acctId)}</div>
      </div>
      <div className="tx-right">
        <div className={`tx-amt ${out ? 'out' : 'inc'}`}>{fmtMoney(tx.amount)}</div>
        <span className={`tx-src ${tx.status !== 'ok' ? 'pend' : ''}`}>
          {tx.status === 'ok' ? tx.src : '待确认 · ' + tx.pendReason}
        </span>
      </div>
    </div>
  );
}