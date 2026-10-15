import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/** A titled group of fields. A `fieldset`, so screen readers announce the group with each field. */
export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <fieldset className={cn('flex flex-col gap-4 border-b border-border pb-6 last:border-b-0', className)}>
      <legend className="contents">
        <span className="block text-xs font-semibold tracking-wider text-content-subtle uppercase">{title}</span>
      </legend>
      {description && <p className="-mt-2 text-sm text-content-muted">{description}</p>}
      {children}
    </fieldset>
  );
}
