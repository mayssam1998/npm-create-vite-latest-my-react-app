import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/ui/Badge';
import type { CasePriority } from '../model/case';
import { PRIORITY_ICON, getPriorityTone } from './casePresentation';

interface CasePriorityBadgeProps {
  priority: CasePriority;
}

export function CasePriorityBadge({ priority }: CasePriorityBadgeProps) {
  const { t } = useTranslation('cases');
  const Icon = PRIORITY_ICON[priority];

  return (
    <Badge tone={getPriorityTone(priority)} appearance="plain">
      <Icon aria-hidden />
      {t(`priority.${priority}`)}
    </Badge>
  );
}
