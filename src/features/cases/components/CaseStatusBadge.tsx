import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/ui/Badge';
import type { CaseStatus } from '../model/case';
import { getStatusTone } from './casePresentation';

interface CaseStatusBadgeProps {
  status: CaseStatus;
}

export function CaseStatusBadge({ status }: CaseStatusBadgeProps) {
  const { t } = useTranslation('cases');
  return <Badge tone={getStatusTone(status)}>{t(`status.${status}`)}</Badge>;
}
