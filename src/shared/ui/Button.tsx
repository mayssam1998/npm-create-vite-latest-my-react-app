import type { ComponentPropsWithRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@/shared/lib/cn';

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        secondary: 'border border-border bg-surface-raised text-content hover:bg-surface-hover',
        ghost: 'text-content-muted hover:bg-surface-hover hover:text-content',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-4 text-sm',
        icon: 'size-8',
      },
      isActive: {
        true: 'border-primary bg-primary-soft text-primary hover:bg-primary-soft',
        false: '',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'sm', isActive: false },
  },
);

interface ButtonProps extends ComponentPropsWithRef<'button'>, VariantProps<typeof buttonVariants> {
  /** Render the single child (e.g. a router Link) with button styling. */
  asChild?: boolean;
}

export function Button({ variant, size, isActive, asChild = false, className, type, ...props }: ButtonProps) {
  const Component = asChild ? Slot.Root : 'button';
  return (
    <Component
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(buttonVariants({ variant, size, isActive }), className)}
      {...props}
    />
  );
}
