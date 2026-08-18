/**
 * components/ReportCard.jsx —— LLM 周期报告卡（主题化，独立组件）
 * 状态：idle（未生成）→ loading（转圈+等待）→ done（打字机展示）
 */
import React from 'react';
import { MONTHLY } from '../engine/ledger';

export default function ReportCard({ reportText, reportLoading, reportDone, onGenerate }) {
  return (
    <div className={`rep-card ${reportLoading ? 'loading' : ''}`}>
      <div className="rep-head">
        <h3>周期报告</h3>
        <span className="rep-tag">云端 LLM</span>
      </div>
      <div className="rep-sub">基于已确认账本与确定性指标生成 · 每个结论可下钻到原始交易</div>
      <div className="rep-load">
        <span className="spinner" />
        <span>正在汇总确定性指标并生成报告…</span>
      </div>
      <div className="rep-paper">
        <span className="hint">点击「生成报告」，LLM 将基于本月确定性指标撰写周期总结。</span>
        <p>{reportText}</p>
      </div>
      <div className="rep-meta">
        覆盖度 已确认 {MONTHLY.coverage}%（{MONTHLY.pendingExcluded} 笔待确认未计入）｜云端分析已授权 · 可关闭
      </div>
      <button className="rep-btn" disabled={reportLoading} onClick={onGenerate}>
        {reportDone ? '重新生成' : '生 成 报 告'}
      </button>
    </div>
  );
}