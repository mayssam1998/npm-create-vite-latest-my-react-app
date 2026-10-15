import { useTranslation } from 'react-i18next';
import { Link, useMatches } from 'react-router';
import { isRouteHandle } from '../router/routeHandle';

interface Crumb {
  titleKey: string;
  to: string;
}

/**
 * The trail of matched routes that carry a `handle` — e.g. Case Management / Case intake
 * review. Earlier crumbs link back up; the last is the current page.
 */
export function Breadcrumbs() {
  const { t } = useTranslation('common');
  const matches = useMatches();

  const crumbs: Crumb[] = matches.flatMap((match) =>
    isRouteHandle(match.handle) ? [{ titleKey: match.handle.titleKey, to: match.pathname }] : [],
  );
  const lastIndex = crumbs.length - 1;

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label={t('breadcrumb.label')} className="hidden min-w-0 md:block">
      <ol className="flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, index) => (
          <li key={crumb.to} className="flex min-w-0 items-center gap-1.5">
            {index > 0 && (
              <span aria-hidden className="text-content-subtle">
                /
              </span>
            )}
            {index === lastIndex ? (
              <span aria-current="page" className="truncate font-medium text-content">
                {t(crumb.titleKey)}
              </span>
            ) : (
              <Link to={crumb.to} className="truncate rounded text-content-muted hover:text-content hover:underline">
                {t(crumb.titleKey)}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
