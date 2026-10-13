import { CircleAlert, RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title, description, onRetry, className }: ErrorStateProps) {
  const { t } = useTranslation('common');

  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center justify-center gap-2 px-6 py-16 text-center', className)}
    >
      <CircleAlert aria-hidden className="size-8 text-danger" />
      <p className="font-medium text-content">{title ?? t('errors.title')}</p>
      <p className="max-w-sm text-sm text-content-muted">{description ?? t('errors.description')}</p>
      {onRetry && (
        <Button className="mt-2" onClick={onRetry}>
          <RotateCw aria-hidden />
          {t('errors.retry')}
        </Button>
      )}
    </div>
  );
}
