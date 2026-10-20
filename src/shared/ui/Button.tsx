import type { ComponentPropsWithRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import { Slot } from 'radix-ui';
import { cn } from '@/shared/lib/cn';

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'border border-border bg-card text-foreground hover:bg-accent',
        ghost: 'text-muted-foreground hover:bg-accent hover:text-foreground',
        danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        dangerGhost: 'text-destructive hover:bg-destructive/10',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-4 text-sm',
        icon: 'size-8',
      },
      isActive: {
        true: 'border-primary bg-accent text-primary hover:bg-accent',
        false: '',
      },
      // While pending, the spinner replaces the button's own icon.
      isPending: {
        true: 'cursor-progress [&>svg:not([data-spinner])]:hidden',
        false: '',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'sm', isActive: false, isPending: false },
  },
);

interface ButtonProps extends ComponentPropsWithRef<'button'>, VariantProps<typeof buttonVariants> {
  /** Render the single child (e.g. a router Link) with button styling. */
  asChild?: boolean;
}

export function Button({
  variant,
  size,
  isActive,
  isPending = false,
  asChild = false,
  className,
  type,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const variantClassName = cn(buttonVariants({ variant, size, isActive, isPending }), className);

  if (asChild) {
    return (
      <Slot.Root className={variantClassName} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      type={type ?? 'button'}
      className={variantClassName}
      disabled={disabled || isPending === true}
      aria-busy={isPending === true || undefined}
      {...props}
    >
      {isPending && <LoaderCircle aria-hidden data-spinner className="animate-spin" />}
      {children}
    </button>
  );
}
