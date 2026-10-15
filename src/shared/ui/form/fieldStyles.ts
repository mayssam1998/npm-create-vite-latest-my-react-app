import { cva } from 'class-variance-authority';

/** The one look of every text-like form control. `aria-invalid` turns the border red. */
export const fieldControlVariants = cva(
  'w-full rounded-md border border-border bg-surface-raised text-sm text-content placeholder:text-content-subtle hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger',
  {
    variants: {
      kind: {
        input: 'h-9 px-3',
        textarea: 'min-h-28 resize-y px-3 py-2',
        trigger: 'flex h-9 items-center justify-between gap-2 px-3 text-start [&_svg]:size-4 [&_svg]:shrink-0',
        box: 'flex min-h-9 flex-wrap items-center gap-1.5 px-2 py-1 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus',
      },
    },
    defaultVariants: { kind: 'input' },
  },
);
