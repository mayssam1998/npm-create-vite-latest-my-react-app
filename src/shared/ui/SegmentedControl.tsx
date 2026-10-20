import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface SegmentedControlItem<TValue extends string> {
  value: TValue;
  label: string;
  icon?: LucideIcon;
  /** Pre-formatted count shown after the label, e.g. quick-tab totals. */
  count?: ReactNode;
}

interface SegmentedControlProps<TValue extends string> {
  /** Accessible name of the group. */
  label: string;
  items: readonly SegmentedControlItem<TValue>[];
  value: TValue;
  onValueChange: (value: TValue) => void;
  className?: string;
}

export function SegmentedControl<TValue extends string>({
  label,
  items,
  value,
  onValueChange,
  className,
}: SegmentedControlProps<TValue>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'inline-flex h-8 items-stretch overflow-hidden rounded-md border border-border bg-card',
        className,
      )}
    >
      {items.map((item) => (
        <SegmentButton key={item.value} item={item} isSelected={item.value === value} onSelect={onValueChange} />
      ))}
    </div>
  );
}

interface SegmentButtonProps<TValue extends string> {
  item: SegmentedControlItem<TValue>;
  isSelected: boolean;
  onSelect: (value: TValue) => void;
}

function SegmentButton<TValue extends string>({ item, isSelected, onSelect }: SegmentButtonProps<TValue>) {
  const Icon = item.icon;

  function handleClick() {
    onSelect(item.value);
  }

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1.5 border-e border-border px-3 text-sm text-muted-foreground last:border-e-0 hover:bg-accent',
        isSelected && 'bg-accent text-primary hover:bg-accent',
      )}
    >
      {Icon && <Icon aria-hidden className="size-4" />}
      {item.label}
      {item.count !== undefined && <span className="text-xs text-muted-foreground">{item.count}</span>}
    </button>
  );
}
