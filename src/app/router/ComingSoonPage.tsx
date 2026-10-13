import { Construction } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';

// Default export ONLY because this is a lazy-loaded route page.
export default function ComingSoonPage() {
  const { t } = useTranslation('common');

  return (
    <EmptyState
      className="h-full"
      icon={Construction}
      title={t('comingSoon.title')}
      description={t('comingSoon.description')}
      action={
        <Button asChild>
          <Link to="/cases">{t('comingSoon.back')}</Link>
        </Button>
      }
    />
  );
}
