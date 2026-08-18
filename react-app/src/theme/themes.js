/**
 * theme/themes.js —— 三套 Design Token（来财记账）
 *
 * 这是「可换 UI」的第一层：所有颜色/字体/圆角/描边/阴影/动效差异收敛为
 * CSS 变量（--t-*），运行时切换 theme = 切换这份 Token 表 → 注入 <html>。
 *
 * 母题溯源：
 *  - minimal : 墨与账本（宣纸白 + 朱砂）——数字是账本墨迹，分隔线是账本行格
 *  - fashion : 流动的金币（石墨黑 + 青柠）——交易的瞬时冲击
 *  - luxury  : 鎏金钱庄（墨绿 + 金线）——财富管理的郑重感
 */

export const THEME_IDS = ['minimal', 'fashion', 'luxury'];

export const THEMES = {
  minimal: {
    id: 'minimal',
    name: '简约版',
    en: 'Minimal',
    motto: '墨与账本',
    desc: '宣纸白底 · 墨色文字 · 朱砂点缀',
    tokens: {
      '--t-bg': '#F7F4EE',
      '--t-bg-hi': '#FFFFFF',
      '--t-bg-app': '#F7F4EE',
      '--t-ink': '#1E1C19',
      '--t-ink-2': '#6E685E',
      '--t-ink-3': '#8A857B',
      '--t-accent': '#B4552D',
      '--t-accent-deep': '#A34A1F',
      '--t-inc': '#3E6B4F',
      '--t-out': '#B4552D',
      '--t-line': '#E5E0D4',
      '--t-line-2': '#EDE7DB',
      '--t-card': '#FFFFFF',
      '--t-veil': 'rgba(60,55,45,.45)',
      '--t-radius-s': '4px',
      '--t-radius-m': '8px',
      '--t-radius-l': '14px',
      '--t-tab-bg': 'rgba(247,244,238,.96)',
      '--t-border-w': '1px',
      '--t-shadow': 'none',
      '--t-display-font': '"Songti SC","Noto Serif SC",serif',
      '--t-body-font': '-apple-system,"PingFang SC",sans-serif',
      '--t-num-font': '"Songti SC","Noto Serif SC",serif',
      '--t-display-w': '600',
      '--t-display-ls': '0.02em',
      '--t-body-size': '14px',
      '--t-label-size': '12px',
      '--t-mini-size': '11px',
      '--t-tab-type': 'text',        // text | pill | diamond
      '--t-row-type': 'line',        // line | capsule | line
      '--t-home-type': 'ledger',     // ledger | hero | ring
      '--t-icon-style': 'stroke',
      '--t-accent-soft': 'rgba(180,85,45,.08)',
      '--t-inc-soft': 'rgba(62,107,79,.10)',
      '--t-out-soft': 'rgba(180,85,45,.10)',
      '--t-chip-radius': '20px',
    },
  },

  fashion: {
    id: 'fashion',
    name: '时尚版',
    en: 'Fashion',
    motto: '流动的金币',
    desc: '石墨黑底 · 青柠撞色 · 年轻金融科技',
    tokens: {
      '--t-bg': '#0E0F0D',
      '--t-bg-hi': '#1A1C19',
      '--t-bg-app': '#0E0F0D',
      '--t-ink': '#F5F5F0',
      '--t-ink-2': '#9AA0A0',
      '--t-ink-3': '#6E7474',
      '--t-accent': '#C8F135',
      '--t-accent-deep': '#A8D02A',
      '--t-inc': '#C8F135',
      '--t-out': '#FF6B4A',
      '--t-line': '#2A2D29',
      '--t-line-2': '#232521',
      '--t-card': '#1A1C19',
      '--t-veil': 'rgba(5,8,7,.6)',
      '--t-radius-s': '16px',
      '--t-radius-m': '20px',
      '--t-radius-l': '24px',
      '--t-tab-bg': 'rgba(14,15,13,.92)',
      '--t-border-w': '1px',
      '--t-shadow': '0 12px 30px rgba(0,0,0,.35)',
      '--t-display-font': '-apple-system,"PingFang SC",sans-serif',
      '--t-body-font': '-apple-system,"PingFang SC",sans-serif',
      '--t-num-font': '"SF Mono",ui-monospace,monospace',
      '--t-display-w': '900',
      '--t-display-ls': '-0.02em',
      '--t-body-size': '14px',
      '--t-label-size': '12px',
      '--t-mini-size': '11px',
      '--t-tab-type': 'pill',
      '--t-row-type': 'capsule',
      '--t-home-type': 'hero',
      '--t-icon-style': 'solid',
      '--t-accent-soft': 'rgba(200,241,53,.12)',
      '--t-inc-soft': 'rgba(200,241,53,.12)',
      '--t-out-soft': 'rgba(255,107,74,.12)',
      '--t-chip-radius': '20px',
    },
  },

  luxury: {
    id: 'luxury',
    name: '奢华版',
    en: 'Luxury',
    motto: '鎏金钱庄',
    desc: '深墨绿底 · 金线 · 衬线宽字距',
    tokens: {
      '--t-bg': '#101A17',
      '--t-bg-hi': '#16211D',
      '--t-bg-app': '#101A17',
      '--t-ink': '#EDE7D8',
      '--t-ink-2': '#9AA79E',
      '--t-ink-3': '#6E7A72',
      '--t-accent': '#C7A25B',
      '--t-accent-deep': '#A8853F',
      '--t-inc': '#8FB573',
      '--t-out': '#C96A4A',
      '--t-line': 'rgba(199,162,91,.40)',
      '--t-line-2': 'rgba(199,162,91,.20)',
      '--t-card': '#1A2722',
      '--t-veil': 'rgba(5,8,7,.6)',
      '--t-radius-s': '2px',
      '--t-radius-m': '6px',
      '--t-radius-l': '10px',
      '--t-tab-bg': 'rgba(12,19,16,.96)',
      '--t-border-w': '1px',
      '--t-shadow': '0 14px 36px rgba(0,0,0,.45)',
      '--t-display-font': '"Songti SC","Noto Serif SC","Playfair Display",serif',
      '--t-body-font': '-apple-system,"PingFang SC",sans-serif',
      '--t-num-font': '"Songti SC","Noto Serif SC",serif',
      '--t-display-w': '600',
      '--t-display-ls': '0.10em',
      '--t-body-size': '14px',
      '--t-label-size': '12px',
      '--t-mini-size': '11px',
      '--t-tab-type': 'diamond',
      '--t-row-type': 'line',
      '--t-home-type': 'ring',
      '--t-icon-style': 'stroke',
      '--t-accent-soft': 'rgba(199,162,91,.10)',
      '--t-inc-soft': 'rgba(143,181,115,.12)',
      '--t-out-soft': 'rgba(201,106,74,.12)',
      '--t-chip-radius': '4px',
    },
  },
};

export function applyTheme(themeId) {
  const t = THEMES[themeId];
  if (!t) return;
  const root = document.documentElement;
  Object.entries(t.tokens).forEach(([k, v]) => root.style.setProperty(k, v));
  // 同步数据属性，供布局做结构性差异判断（token 无法覆盖的骨架差异）
  root.setAttribute('data-theme', themeId);
  root.setAttribute('data-tab-type', t.tokens['--t-tab-type']);
  root.setAttribute('data-row-type', t.tokens['--t-row-type']);
  root.setAttribute('data-home-type', t.tokens['--t-home-type']);
}