import type { ComponentPropsWithRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap rounded-md text-xs font-medium [&_svg]:size-3.5 [&_svg]:shrink-0',
  {
    variants: {
      tone: {
        neutral: 'text-content-muted',
        statusNew: 'text-status-new',
        statusOpen: 'text-status-open',
        statusProgress: 'text-status-progress',
        statusPending: 'text-status-pending',
        statusClosed: 'text-status-closed',
        priorityUrgent: 'text-priority-urgent',
        priorityHigh: 'text-priority-high',
        priorityNormal: 'text-priority-normal',
        priorityLow: 'text-priority-low',
        amber: 'text-accent-amber',
        red: 'text-accent-red',
        blue: 'text-accent-blue',
        violet: 'text-accent-violet',
        teal: 'text-accent-teal',
      },
      appearance: {
        soft: 'bg-current/10 px-1.5 py-0.5',
        outline: 'border border-current/40 px-1.5 py-0.5',
        plain: '',
      },
    },
    defaultVariants: { tone: 'neutral', appearance: 'soft' },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;

interface BadgeProps extends ComponentPropsWithRef<'span'>, VariantProps<typeof badgeVariants> {}

export function Badge({ tone, appearance, className, ...props }: BadgeProps) {
  // spreading props onto a DOM element is allowed in shared/ui, nowhere else
  return <span className={cn(badgeVariants({ tone, appearance }), className)} {...props} />;
}
