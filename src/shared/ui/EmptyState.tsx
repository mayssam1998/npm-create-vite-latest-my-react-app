import type { ReactNode } from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon: Icon = Inbox, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 px-6 py-16 text-center', className)}>
      <Icon aria-hidden className="size-8 text-content-subtle" />
      <p className="font-medium text-content">{title}</p>
      {description && <p className="max-w-sm text-sm text-content-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
