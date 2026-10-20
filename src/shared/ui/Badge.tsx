import type { ComponentPropsWithRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

// Tones are the design system's semantic families (DESIGN-RULES.md): a chip is
// `bg-<family>-soft text-<family>`, a tag is `bg-tag-x text-tag-x-fg`.
const badgeVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap rounded-md text-xs font-medium [&_svg]:size-3.5 [&_svg]:shrink-0',
  {
    variants: {
      tone: {
        neutral: 'text-muted-foreground',
        statusDraft: 'text-status-draft',
        statusOpen: 'text-status-open',
        statusProgress: 'text-status-progress',
        statusReview: 'text-status-review',
        statusAck: 'text-status-ack',
        statusDone: 'text-status-done',
        statusClosed: 'text-status-closed',
        priorityUrgent: 'text-priority-urgent',
        priorityHigh: 'text-priority-high',
        priorityNormal: 'text-priority-normal',
        priorityLow: 'text-priority-low',
        tagNeutral: 'text-tag-neutral-fg',
        tagSand: 'text-tag-sand-fg',
        tagSage: 'text-tag-sage-fg',
        tagSlate: 'text-tag-slate-fg',
        tagClay: 'text-tag-clay-fg',
      },
      appearance: {
        soft: 'px-1.5 py-0.5',
        outline: 'border border-current/40 px-1.5 py-0.5',
        plain: '',
      },
    },
    compoundVariants: [
      { appearance: 'soft', tone: 'neutral', className: 'bg-muted' },
      { appearance: 'soft', tone: 'statusDraft', className: 'bg-status-draft-soft' },
      { appearance: 'soft', tone: 'statusOpen', className: 'bg-status-open-soft' },
      { appearance: 'soft', tone: 'statusProgress', className: 'bg-status-progress-soft' },
      { appearance: 'soft', tone: 'statusReview', className: 'bg-status-review-soft' },
      { appearance: 'soft', tone: 'statusAck', className: 'bg-status-ack-soft' },
      { appearance: 'soft', tone: 'statusDone', className: 'bg-status-done-soft' },
      { appearance: 'soft', tone: 'statusClosed', className: 'bg-status-closed-soft' },
      // priorities have no -soft token; they are normally shown plain
      {
        appearance: 'soft',
        tone: ['priorityUrgent', 'priorityHigh', 'priorityNormal', 'priorityLow'],
        className: 'bg-current/10',
      },
      { appearance: 'soft', tone: 'tagNeutral', className: 'bg-tag-neutral' },
      { appearance: 'soft', tone: 'tagSand', className: 'bg-tag-sand' },
      { appearance: 'soft', tone: 'tagSage', className: 'bg-tag-sage' },
      { appearance: 'soft', tone: 'tagSlate', className: 'bg-tag-slate' },
      { appearance: 'soft', tone: 'tagClay', className: 'bg-tag-clay' },
    ],
    defaultVariants: { tone: 'neutral', appearance: 'soft' },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;

interface BadgeProps extends ComponentPropsWithRef<'span'>, VariantProps<typeof badgeVariants> {}

export function Badge({ tone, appearance, className, ...props }: BadgeProps) {
  // spreading props onto a DOM element is allowed in shared/ui, nowhere else
  return <span className={cn(badgeVariants({ tone, appearance }), className)} {...props} />;
}
