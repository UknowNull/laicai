/**
 * engine/useLedger.js —— 统一状态机（唯一交互逻辑）
 *
 * 任何主题的 UI 都消费这个 hook → 因此「换 UI = 换皮肤，不换逻辑」。
 * 命名与三版原型函数一致（goTab/openTx/confirmPend…），方便复核。
 *
 * 试用能力：账本/待确认/开关/筛选 持久化到 localStorage（laicai.ledger.v1），
 * 刷新不丢；resetData() 一键恢复演示初始数据。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ACCOUNTS, INITIAL_TX, INITIAL_PENDING } from './ledger';

export const TABS = ['home', 'ledger', 'record', 'analysis', 'mine'];

const STORE_KEY = 'laicai.ledger.v1';

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || !Array.isArray(d.txList) || !Array.isArray(d.pending)) return null;
    return d;
  } catch {
    return null;
  }
}

function savePersisted(d) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(d));
  } catch {
    /* 存储不可用（隐私模式等）时静默降级为内存态 */
  }
}

export default function useLedger() {
  // ── 初始状态（优先取持久化，否则用演示初始数据）──
  const persisted = useRef(loadPersisted()).current;
  const [tab, setTab] = useState('home');
  const [txList, setTxList] = useState(persisted?.txList || INITIAL_TX);
  const [pending, setPending] = useState(persisted?.pending || INITIAL_PENDING);
  const [filter, setFilter] = useState(persisted?.filter || '全部');
  const [q, setQ] = useState(persisted?.q || '');
  const [modal, setModal] = useState(null);  // { type: 'tx'|'pend'|'acct', payload }
  const [toast, setToast] = useState(null);
  const [notifOn, setNotifOn] = useState(persisted?.notifOn ?? true);
  const [cloudOn, setCloudOn] = useState(persisted?.cloudOn ?? true);
  const [reportDone, setReportDone] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportText, setReportText] = useState('');

  // 记一笔 state
  const [recMode, setRecMode] = useState('支出');  // 支出|收入|转账
  const [recCat, setRecCat] = useState('餐饮');
  const [recAcct, setRecAcct] = useState('wechat');
  const [recAmt, setRecAmt] = useState('');
  const toastTimer = useRef(null);

   // ── 持久化：账本 / 待确认 / 筛选 / 开关（不含临时会话态）──
  useEffect(() => {
    savePersisted({ txList, pending, filter, q, notifOn, cloudOn });
  }, [txList, pending, filter, q, notifOn, cloudOn]);

  // ── toast ──
  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  // ── 重置演示数据 ──
  const resetData = useCallback(() => {
    try { localStorage.removeItem(STORE_KEY); } catch { /* ignore */ }
    setTxList(INITIAL_TX);
    setPending(INITIAL_PENDING);
    setFilter('全部');
    setQ('');
    setModal(null);
    setNotifOn(true);
    setCloudOn(true);
    setReportDone(false);
    setReportLoading(false);
    setReportText('');
    setRecAmt('');
    showToast('已恢复演示数据');
  }, [showToast]);

  // ── tab ──
  const goTab = useCallback((name) => setTab(name), []);

  // ── tx 列表操作 ──
  const openTx = useCallback((id) => {
    const tx = txList.find((t) => t.id === id);
    if (tx) setModal({ type: 'tx', payload: tx });
  }, [txList]);

  const deleteTx = useCallback((id) => {
    setTxList((prev) => {
      const tx = prev.find((t) => t.id === id);
      if (!tx) return prev;
      setPending((pp) => pp.filter((p) => p.merchant !== tx.merchant || Math.abs(p.amount) !== Math.abs(tx.amount)));
      return prev.filter((t) => t.id !== id);
    });
    setModal(null);
    showToast('已删除 · 可在「恢复备份」中找回（演示）');
  }, [showToast]);

  const editTx = useCallback(() => { setModal(null); showToast('编辑功能演示：可修改金额、分类与备注'); }, [showToast]);

  // ── pending ──
  const confirmPend = useCallback((pid) => {
    setPending((prev) => {
      const p = prev.find((x) => x.id === pid);
      if (p) {
        setTxList((txs) => txs.map((t) => t.merchant === p.merchant && Math.abs(t.amount) === Math.abs(p.amount) ? { ...t, status: 'ok', pendReason: null } : t));
        return prev.filter((x) => x.id !== pid);
      }
      return prev;
    });
    showToast('已确认入账，计入统计');
  }, [showToast]);

  const ignorePend = useCallback((pid) => {
    setPending((prev) => prev.filter((x) => x.id !== pid));
    showToast('已忽略 · 不会入账');
  }, [showToast]);

  const openPend = useCallback(() => setModal({ type: 'pend' }), []);

  // ── account ──
  const openAcct = useCallback((name) => setModal({ type: 'acct', payload: name }), []);

  // ── 记一笔 ──
  const keyPress = useCallback((k) => {
    setRecAmt((prev) => {
      if (k === 'del') return prev.slice(0, -1);
      if (k === '.') return prev.includes('.') ? prev : (prev || '0') + '.';
      const parts = (prev || '').split('.');
      if (parts[1] && parts[1].length >= 2) return prev;
      if (parts[0].length >= 7) return prev;
      return prev === '0' ? k : (prev || '') + k;
    });
  }, []);

  const saveRec = useCallback(() => {
    const v = parseFloat(recAmt || '0');
    if (v <= 0) { showToast('请输入金额'); return; }
    if (recMode === '转账') { showToast('已记一笔转账'); setRecAmt(''); return; }
    if (!recCat) { showToast('请选择分类'); return; }
    const now = new Date();
    const pad = (n) => n < 10 ? '0' + n : '' + n;
    setTxList((prev) => [{ id: Date.now(), day: '今天', time: pad(now.getHours()) + ':' + pad(now.getMinutes()), merchant: '手动记账', amount: recMode === '支出' ? -v : v, acctId: recAcct, cat: recCat, status: 'ok', src: '手动', conf: 1 }, ...prev]);
    setRecAmt('');
    showToast('已记一笔');
  }, [recAmt, recMode, recCat, recAcct, showToast]);

  // ── report / qa ──
  const genReport = useCallback(() => {
    if (reportLoading) return;
    setReportLoading(true);
    setTimeout(() => {
      const txt = '本月支出 8,432.60 元，环比下降 12.4%——主要来自餐饮收敛。餐饮支出超预算 8%，集中在星巴克（6 笔 186 元）。建议下周减少咖啡类外带，预计每月可节省约 120 元。';
      let i = 0;
      const iv = setInterval(() => { i++; setReportText(txt.slice(0, i)); if (i >= txt.length) { clearInterval(iv); setReportLoading(false); setReportDone(true); } }, 28);
    }, 1200);
  }, [reportLoading]);

  // ── toggle ──
  const toggleNotif = useCallback(() => { setNotifOn((p) => !p); }, []);
  const toggleCloud = useCallback(() => { setCloudOn((p) => !p); }, []);

  return {
    tab, goTab,
    txList, filter, setFilter, q, setQ, openTx, deleteTx, editTx,
    pending, confirmPend, ignorePend, openPend,
    modal, setModal, openAcct,
    recMode, setRecMode, recCat, setRecCat, recAcct, setRecAcct, recAmt, keyPress, saveRec,
    notifOn, cloudOn, toggleNotif, toggleCloud,
    reportLoading, reportDone, reportText, genReport,
    toast, showToast, resetData,
  };
}