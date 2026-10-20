import { PanelLeft, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button } from '@/shared/ui/Button';
import { Breadcrumbs } from './Breadcrumbs';
import { SIDEBAR_ID } from './navigation';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
}

/** Global search (⌘K) is its own feature and route; until it exists the trigger links to it. */
const GLOBAL_SEARCH_PATH = '/search';

export function Header({ isSidebarOpen, onSidebarToggle }: HeaderProps) {
  const { t } = useTranslation('common');

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-3">
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
        className="mx-auto flex h-8 w-full max-w-md items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-muted-foreground hover:border-input"
      >
        <Search aria-hidden className="size-4" />
        <span className="flex-1 truncate">{t('header.search')}</span>
        <kbd className="rounded border border-border px-1.5 font-mono text-xs">{t('header.searchShortcut')}</kbd>
      </Link>
      <UserMenu />
    </header>
  );
}
