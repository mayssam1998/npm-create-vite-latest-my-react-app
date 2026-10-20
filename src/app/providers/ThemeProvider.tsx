import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeContext, type ThemeContextValue } from '@/shared/hooks/useTheme';
import { applyAppearance, readStoredAppearance, storeAppearance, type Appearance } from './theme';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * The one owner of light/dark and the theme family. bootstrap applies the stored choice to
 * <html> before the first render (no flash); here storage is read only in an effect, and
 * <html> is only touched once that read has happened, so the defaults never overwrite it.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [appearance, setAppearance] = useState<Appearance | null>(null);

  useEffect(() => {
    // Storage is read only in an effect, never during render (DESIGN-RULES.md). The one
    // extra render on mount changes nothing visible: bootstrap already applied the same values.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of an external store on mount
    setAppearance(readStoredAppearance());
  }, []);

  useEffect(() => {
    if (appearance) applyAppearance(appearance);
  }, [appearance]);

  // Context values are one of the four sanctioned uses of useMemo (performance.md).
  const value = useMemo<ThemeContextValue>(() => {
    const current: Appearance = appearance ?? { theme: 'light', family: 'default' };

    function update(next: Appearance) {
      storeAppearance(next); // side effect stays in the event handler, outside the state updater
      setAppearance(next);
    }

    return {
      theme: current.theme,
      family: current.family,
      toggleTheme: () => update({ ...current, theme: current.theme === 'dark' ? 'light' : 'dark' }),
      setFamily: (family) => update({ ...current, family }),
    };
  }, [appearance]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
