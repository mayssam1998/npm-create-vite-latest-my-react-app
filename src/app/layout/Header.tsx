import { Languages, Moon, PanelLeft, Search, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { Button } from '@/shared/ui/Button';
import { Breadcrumbs } from './Breadcrumbs';
import { SIDEBAR_ID } from './navigation';

interface HeaderProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
}

/** Global search (⌘K) is its own feature and route; until it exists the trigger links to it. */
const GLOBAL_SEARCH_PATH = '/search';

export function Header({ isSidebarOpen, onSidebarToggle }: HeaderProps) {
  const { t, i18n } = useTranslation('common');
  const { theme, toggleTheme } = useTheme();
  const ThemeIcon = theme === 'dark' ? Sun : Moon;
  const themeLabel = theme === 'dark' ? t('theme.toLight') : t('theme.toDark');

  function handleLanguageToggle() {
    void i18n.changeLanguage(i18n.resolvedLanguage === 'ar' ? 'en' : 'ar');
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface-raised px-3">
      <Button
        variant="ghost"
        size="icon"
        aria-label={isSidebarOpen ? t('header.hideSidebar') : t('header.showSidebar')}
        aria-expanded={isSidebarOpen}
        aria-controls={SIDEBAR_ID}
        onClick={onSidebarToggle}
      >
        <PanelLeft aria-hidden className="rtl:-scale-x-100" />
      </Button>
      <Breadcrumbs />
      <Link
        to={GLOBAL_SEARCH_PATH}
        className="mx-auto flex h-8 w-full max-w-md items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-content-subtle hover:border-border-strong"
      >
        <Search aria-hidden className="size-4" />
        <span className="flex-1 truncate">{t('header.search')}</span>
        <kbd className="rounded border border-border px-1.5 font-mono text-xs">{t('header.searchShortcut')}</kbd>
      </Link>
      <Button variant="ghost" onClick={handleLanguageToggle} title={t('language.switchLabel')}>
        <Languages aria-hidden />
        <span lang={i18n.resolvedLanguage === 'ar' ? 'en' : 'ar'}>{t('language.switchTo')}</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={themeLabel}>
        <ThemeIcon aria-hidden />
      </Button>
    </header>
  );
}
