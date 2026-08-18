/**
 * engine/ledger.js —— 统一数据模型（唯一数据源）
 *
 * 与三版原型 PRD 数据 100% 一致。任何主题的 UI 都消费这份数据，
 * 因此「换 UI = 换皮肤，不换数据」。
 * 金额一律以元为单位的小数（原型展示层），生产可换为最小货币单位整数。
 */

// 账户
export const ACCOUNTS = [
  { id: 'cmb', name: '招商银行 ♥8899', type: 'bank', tail: '8899', balance: 26480.52, note: '借记卡 · 工资卡 · 通知自动匹配账户' },
  { id: 'wechat', name: '微信零钱', type: 'wallet', balance: 1206.35, note: '电子钱包 · 高频支付 · 微信通知捕获' },
  { id: 'alipay', name: '支付宝', type: 'wallet', balance: 843.20, note: '电子钱包 · 支付宝通知捕获' },
  { id: 'cash', name: '现金', type: 'cash', balance: 520.00, note: '现金账户 · 手动/抄账入账 · 低置信优先待确认' },
];

export const TOTAL_BALANCE = ACCOUNTS.reduce((s, a) => s + a.balance, 0); // 28849.87

// 分类（支出/收入/转账）
export const CATEGORIES = {
  支出: ['餐饮', '交通', '购物', '居住', '娱乐', '其他'],
  收入: ['工资', '理财', '红包', '其他'],
  转账: [],
};

// 分类占比（支出结构）
export const CAT_RATIO = [
  { cat: '餐饮', pct: 42, color: '#C7A25B' },
  { cat: '购物', pct: 18, color: '#8FB573' },
  { cat: '交通', pct: 14, color: '#C96A4A' },
  { cat: '居住', pct: 12, color: '#5FA8A0' },
  { cat: '娱乐', pct: 9, color: '#B79A6D' },
  { cat: '其他', pct: 5, color: 'rgba(199,162,91,.35)' },
];

// 本月统计（确定性指标）
export const MONTHLY = {
  expense: 8432.60,
  income: 25000.00,
  balance: 16567.40,
  mom: -12.4,          // 环比 %
  budgetOverrun: 8,    // 餐饮预算超支 %
  topMerchant: { name: '星巴克', count: 6, amount: 186.00 },
  coverage: 96,        // 已确认覆盖度 %
  pendingExcluded: 2,  // 未计入的待确认笔数
};

// 交易流水（统一，与原型一致）
export const INITIAL_TX = [
  { id: 1, day: '8月17日', time: '09:12', merchant: '瑞幸咖啡', amount: -32.50, acctId: 'wechat', cat: '餐饮', status: 'ok', src: '微信通知自动捕获', conf: 0.97 },
  { id: 2, day: '8月17日', time: '08:40', merchant: '地铁', amount: -6.00, acctId: 'alipay', cat: '交通', status: 'ok', src: '支付宝通知自动捕获', conf: 0.98 },
  { id: 3, day: '8月16日', time: '20:23', merchant: '盒马鲜生', amount: -128.60, acctId: 'alipay', cat: '购物', status: 'ok', src: '支付宝通知自动捕获', conf: 0.96 },
  { id: 4, day: '8月16日', time: '12:05', merchant: '美团外卖', amount: -45.80, acctId: 'wechat', cat: '餐饮', status: 'pending', src: '微信通知自动捕获', conf: 0.62, pendReason: '分类不明' },
  { id: 5, day: '8月15日', time: '18:30', merchant: '星巴克', amount: -38.00, acctId: 'cmb', cat: '餐饮', status: 'ok', src: '招商银行通知自动捕获', conf: 0.97 },
  { id: 6, day: '8月14日', time: '10:00', merchant: '工资入账', amount: 25000.00, acctId: 'cmb', cat: '收入', status: 'ok', src: '招商银行通知自动捕获', conf: 0.99 },
  { id: 7, day: '8月12日', time: '22:10', merchant: '滴滴出行', amount: -18.40, acctId: 'wechat', cat: '交通', status: 'ok', src: '微信通知自动捕获', conf: 0.95 },
  { id: 8, day: '8月10日', time: '15:00', merchant: '京东', amount: -299.00, acctId: 'cmb', cat: '购物', status: 'pending', src: '招商银行通知自动捕获', conf: 0.55, pendReason: '账户未知' },
];

// 待确认队列
export const INITIAL_PENDING = [
  { id: 'p1', merchant: '美团外卖', amount: -45.80, day: '8月16日', reason: '分类不明' },
  { id: 'p2', merchant: '京东', amount: -299.00, day: '8月10日', reason: '账户未知' },
  { id: 'p3', merchant: '现金', amount: -120.00, day: '8月13日', reason: '低置信抄账' },
];

// LLM 周期报告文案
export const REPORT_TEXT =
  '本月支出 8,432.60 元，环比下降 12.4%——主要来自餐饮收敛。' +
  '餐饮支出超预算 8%，集中在星巴克（6 笔 186 元）。' +
  '建议下周减少咖啡类外带，预计每月可节省约 120 元。';

export const QA_ANSWERS = {
  q1: '按当前已确认账本：本月外卖类已确认 0 笔。最近一笔「美团外卖 ¥45.80」为待确认（分类不明），未计入支出统计——确认后即并入。',
  q2: '本月餐饮占支出 42%，环比整体下降 12.4%，主因餐饮收敛；Top 商户星巴克 6 笔 ¥186.00，超预算 8%，建议下周减少外带咖啡，约可省 ¥120。',
};

// 工具
export function fmtMoney(n, withSign = true) {
  const abs = Math.abs(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (!withSign) return abs;
  return (n < 0 ? '-¥' : '+¥') + abs;
}
export function fmtYuan(n) {
  return '¥' + Math.abs(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
export function acctName(id) {
  const a = ACCOUNTS.find((x) => x.id === id);
  return a ? a.name : id;
}