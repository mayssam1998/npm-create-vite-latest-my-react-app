import type { ReactElement } from 'react';
import type { LucideIcon } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import { cn } from '@/shared/lib/cn';

export interface MenuAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  /** Language of the label when it differs from the page (e.g. "العربية" in an English UI). */
  lang?: string;
  onSelect: () => void;
}

export type MenuSection =
  | {
      type: 'radio';
      id: string;
      /** Small uppercase heading above the options; also the group's accessible name. */
      label: string;
      value: string;
      options: readonly { value: string; label: string }[];
      onValueChange: (value: string) => void;
    }
  | { type: 'actions'; id: string; items: readonly MenuAction[] };

interface MenuProps {
  /** The element that opens the menu — must accept a ref (e.g. Button). */
  trigger: ReactElement;
  /** Rendered in order, with a separator between sections. */
  sections: readonly MenuSection[];
  align?: 'start' | 'center' | 'end';
}

const itemClassName =
  'relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground';

/** A dropdown mixing single-choice groups and actions, with full keyboard support. */
export function Menu({ trigger, sections, align = 'end' }: MenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={6}
          collisionPadding={16}
          className="z-50 min-w-56 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          {sections.map((section, index) => (
            <div key={section.id}>
              {index > 0 && <DropdownMenu.Separator className="my-1 h-px bg-border" />}
              {section.type === 'radio' ? <RadioSection section={section} /> : <ActionSection items={section.items} />}
            </div>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function RadioSection({ section }: { section: Extract<MenuSection, { type: 'radio' }> }) {
  return (
    <>
      <DropdownMenu.Label className="px-2 pt-1.5 pb-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {section.label}
      </DropdownMenu.Label>
      <DropdownMenu.RadioGroup aria-label={section.label} value={section.value} onValueChange={section.onValueChange}>
        {section.options.map((option) => (
          <DropdownMenu.RadioItem key={option.value} value={option.value} className={cn(itemClassName, 'ps-7')}>
            <DropdownMenu.ItemIndicator className="absolute start-2.5 inline-flex">
              <span aria-hidden className="size-1.5 rounded-full bg-current" />
            </DropdownMenu.ItemIndicator>
            {option.label}
          </DropdownMenu.RadioItem>
        ))}
      </DropdownMenu.RadioGroup>
    </>
  );
}

function ActionSection({ items }: { items: readonly MenuAction[] }) {
  return items.map((item) => {
    const Icon = item.icon;
    return (
      <DropdownMenu.Item key={item.id} onSelect={item.onSelect} className={itemClassName}>
        {Icon && <Icon aria-hidden className="size-4 shrink-0 text-muted-foreground" />}
        <span lang={item.lang}>{item.label}</span>
      </DropdownMenu.Item>
    );
  });
}
