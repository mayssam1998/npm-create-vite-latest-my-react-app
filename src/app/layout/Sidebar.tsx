import { Hexagon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { NAV_SECTIONS, SIDEBAR_ID, type NavItem } from './navigation';

function getNavLinkClassName({ isActive }: { isActive: boolean }) {
  return cn(
    'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-content-muted hover:bg-surface-hover hover:text-content',
    isActive && 'bg-primary-soft font-medium text-primary hover:bg-primary-soft hover:text-primary',
  );
}

export function Sidebar() {
  const { t } = useTranslation('common');

  return (
    <aside id={SIDEBAR_ID} className="flex w-64 shrink-0 flex-col border-e border-border bg-surface-raised">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Hexagon aria-hidden className="size-6 text-primary" />
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-widest text-content">{t('app.name')}</p>
          <p className="text-xs text-primary">{t('app.tagline')}</p>
        </div>
      </div>
      <nav aria-label={t('nav.label')} className="flex-1 overflow-y-auto px-2 py-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.labelKey} className="mb-4">
            <p className="px-2.5 pb-1 text-xs font-medium tracking-wider text-content-subtle uppercase">
              {t(section.labelKey)}
            </p>
            <ul>
              {section.items.map((item) => (
                <li key={item.to}>
                  <SidebarItem item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function SidebarItem({ item }: { item: NavItem }) {
  const { t } = useTranslation('common');
  const Icon = item.icon;

  if (item.isComingSoon) {
    return (
      <span aria-disabled className="flex items-center gap-2.5 px-2.5 py-1.5 text-sm text-content-subtle">
        <Icon aria-hidden className="size-4" />
        {t(item.labelKey)}
        <span className="ms-auto text-xs uppercase">{t('nav.soon')}</span>
      </span>
    );
  }

  return (
    <NavLink to={item.to} className={getNavLinkClassName} onMouseEnter={item.prefetch} onFocus={item.prefetch}>
      <Icon aria-hidden className="size-4" />
      {t(item.labelKey)}
    </NavLink>
  );
}
