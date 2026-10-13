import { useMemo, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme, type ThemeContextValue } from '@/shared/hooks/useTheme';
import { applyTheme, readInitialTheme } from './theme';

interface ThemeProviderProps {
  children: ReactNode;
}

/** The one owner of the theme. The class on <html> is applied before first render in bootstrap. */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  // Context values are one of the four sanctioned uses of useMemo (performance.md).
  const value = useMemo<ThemeContextValue>(() => {
    function toggleTheme() {
      const next = theme === 'dark' ? 'light' : 'dark';
      applyTheme(next); // side effect stays in the event handler, outside the state updater
      setTheme(next);
    }
    return { theme, toggleTheme };
  }, [theme]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
