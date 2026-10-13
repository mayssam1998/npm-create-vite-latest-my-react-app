import type { Theme } from '@/shared/hooks/useTheme';

const THEME_STORAGE_KEY = 'insightx.theme';

/** Stored choice, else the OS preference. */
export function readInitialTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // storage can be blocked; fall through to the OS preference
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Dark mode is one `.dark` class on <html>; the tokens in index.css do the rest. */
export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // storage can be blocked; the choice just won't survive a reload
  }
}
