import type { ReactElement, ReactNode } from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { cn } from '@/shared/lib/cn';

interface PopoverProps {
  /** The element that opens the popover — must accept a ref (e.g. Button). */
  trigger: ReactElement;
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

/**
 * Small controls attached to a trigger (filter dropdowns, column visibility).
 * Features use this wrapper and never import Radix directly. Content unmounts when
 * closed, so local state inside it resets and anything that fetches runs only while open.
 */
export function Popover({ trigger, children, align = 'start', className }: PopoverProps) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={align}
          sideOffset={6}
          collisionPadding={16}
          className={cn(
            'z-50 w-64 rounded-lg border border-border bg-surface-raised p-2 text-content shadow-lg',
            className,
          )}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
