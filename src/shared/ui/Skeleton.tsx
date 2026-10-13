import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib/cn';

export function Skeleton({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div aria-hidden className={cn('animate-pulse rounded bg-surface-muted', className)} {...props} />;
}
