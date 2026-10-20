import type { ReactElement } from 'react';
import { Check } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';

export interface RadioMenuGroup {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onValueChange: (value: string) => void;
}

interface RadioMenuProps {
  /** The element that opens the menu — must accept a ref (e.g. Button). */
  trigger: ReactElement;
  groups: readonly RadioMenuGroup[];
  align?: 'start' | 'center' | 'end';
}

/** A dropdown of single-choice groups (e.g. sort field + direction), with full keyboard support. */
export function RadioMenu({ trigger, groups, align = 'end' }: RadioMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={6}
          collisionPadding={16}
          className="z-50 min-w-48 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          {groups.map((group, index) => (
            <div key={group.label}>
              {index > 0 && <DropdownMenu.Separator className="my-1 h-px bg-border" />}
              <DropdownMenu.Label className="px-2 py-1 text-xs font-medium text-muted-foreground">
                {group.label}
              </DropdownMenu.Label>
              <DropdownMenu.RadioGroup value={group.value} onValueChange={group.onValueChange}>
                {group.options.map((option) => (
                  <DropdownMenu.RadioItem
                    key={option.value}
                    value={option.value}
                    className="relative flex cursor-default items-center rounded-md py-1.5 ps-7 pe-2 text-sm outline-none select-none data-highlighted:bg-accent"
                  >
                    <DropdownMenu.ItemIndicator className="absolute start-2 inline-flex">
                      <Check aria-hidden className="size-4" />
                    </DropdownMenu.ItemIndicator>
                    {option.label}
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </div>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
