import type { ReactElement } from 'react';
import type { LucideIcon } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';

export interface ActionMenuItem {
  id: string;
  label: string;
  /** A second, muted line under the label. */
  description?: string;
  icon?: LucideIcon;
  onSelect: () => void;
}

interface ActionMenuProps {
  /** The element that opens the menu — must accept a ref (e.g. Button). */
  trigger: ReactElement;
  /** Heading shown at the top of the menu. */
  label: string;
  items: readonly ActionMenuItem[];
  /** Shown when there are no items. */
  emptyText: string;
  align?: 'start' | 'center' | 'end';
}

/** A dropdown list of actions, with full keyboard support. */
export function ActionMenu({ trigger, label, items, emptyText, align = 'end' }: ActionMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={6}
          collisionPadding={16}
          className="z-50 max-h-96 w-72 overflow-y-auto rounded-lg border border-border bg-surface-raised p-1 text-content shadow-lg"
        >
          <DropdownMenu.Label className="px-2 py-1 text-xs font-medium text-content-subtle">{label}</DropdownMenu.Label>
          {items.length === 0 && <p className="px-2 py-3 text-sm text-content-muted">{emptyText}</p>}
          {items.map((item) => (
            <ActionMenuRow key={item.id} item={item} />
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function ActionMenuRow({ item }: { item: ActionMenuItem }) {
  const Icon = item.icon;

  return (
    <DropdownMenu.Item
      onSelect={item.onSelect}
      className="flex cursor-default items-start gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-surface-hover"
    >
      {Icon && <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-content-subtle" />}
      <span className="min-w-0">
        <span className="block truncate">{item.label}</span>
        {item.description && <span className="block text-xs text-content-muted">{item.description}</span>}
      </span>
    </DropdownMenu.Item>
  );
}
