import { THEME_FAMILIES, type Theme, type ThemeFamily } from '@/shared/hooks/useTheme';

// Same keys as the source O.P.H.I.S app (design-system tokens.json → themeSwitch.storage).
const THEME_STORAGE_KEY = 'cm:theme';
const THEME_FAMILY_STORAGE_KEY = 'cm:theme-family';

export interface Appearance {
  theme: Theme;
  family: ThemeFamily;
}

/** Stored choices, else the OS preference for light/dark and the default family. Browser only. */
export function readStoredAppearance(): Appearance {
  let storedTheme: string | null = null;
  let storedFamily: string | null = null;
  try {
    storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    storedFamily = window.localStorage.getItem(THEME_FAMILY_STORAGE_KEY);
  } catch {
    // storage can be blocked; fall through to the defaults
  }
  const theme: Theme =
    storedTheme === 'light' || storedTheme === 'dark'
      ? storedTheme
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  const family: ThemeFamily = THEME_FAMILIES.find((name) => name === storedFamily) ?? 'default';
  return { theme, family };
}

/**
 * Dark mode is `.dark` on <html>; any family but the default is `data-theme="<family>"`.
 * Independent of each other. How to add a family: src/shared/design-system/README.md.
 */
export function applyAppearance({ theme, family }: Appearance) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  if (family === 'default') delete root.dataset.theme;
  else root.dataset.theme = family;
}

export function storeAppearance({ theme, family }: Appearance) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.localStorage.setItem(THEME_FAMILY_STORAGE_KEY, family);
  } catch {
    // storage can be blocked; the choice just won't survive a reload
  }
}
