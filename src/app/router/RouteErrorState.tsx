import { CircleAlert, RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';

function handleReload() {
  window.location.reload();
}

/** The per-route error boundary (React Router `errorElement`): an error takes down the page, not the app. */
export function RouteErrorState() {
  const { t } = useTranslation('common');

  return (
    <div role="alert" className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <CircleAlert aria-hidden className="size-8 text-danger" />
      <p className="font-medium text-content">{t('routeError.title')}</p>
      <p className="max-w-sm text-sm text-content-muted">{t('routeError.description')}</p>
      <Button className="mt-2" onClick={handleReload}>
        <RotateCw aria-hidden />
        {t('routeError.reload')}
      </Button>
    </div>
  );
}
