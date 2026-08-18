/**
 * theme/ThemeProvider.jsx —— 运行时主题切换（localStorage 记忆）
 *
 * 换肤入口：任何组件调 useTheme().setTheme(id)，全局立即重绘。
 * 持久化 key：laicai.theme（与原型 theme-switcher.html 一致）
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { THEMES, applyTheme } from './themes';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'laicai.theme';

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return THEMES[saved] ? saved : 'minimal';
    } catch {
      return 'minimal';
    }
  });

  useEffect(() => {
    applyTheme(themeId);
    try {
      localStorage.setItem(STORAGE_KEY, themeId);
    } catch { /* file:// 或隐私模式下忽略 */ }
  }, [themeId]);

  const value = useMemo(() => ({
    themeId,
    theme: THEMES[themeId],
    themes: THEMES,
    setTheme: setThemeId,
  }), [themeId]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme 必须在 <ThemeProvider> 内使用');
  return ctx;
}

export default ThemeProvider;