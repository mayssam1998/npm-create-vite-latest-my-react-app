import { ChevronDown } from 'lucide-react';
import { Button } from '../Button';
import { Popover } from '../Popover';
import { MultiSelectOptions, type MultiSelectOption } from './MultiSelectOptions';

export type { MultiSelectOption } from './MultiSelectOptions';

interface MultiSelectFilterProps<TValue extends string> {
  label: string;
  options: readonly MultiSelectOption<TValue>[];
  value: readonly TValue[];
  onValueChange: (value: TValue[]) => void;
  /** Options come from reference data that is still loading. */
  isLoading?: boolean;
}

export function MultiSelectFilter<TValue extends string>({
  label,
  options,
  value,
  onValueChange,
  isLoading = false,
}: MultiSelectFilterProps<TValue>) {
  const selectedCount = value.length;
  const hasSelection = selectedCount > 0;

  return (
    <Popover
      trigger={
        <Button isActive={hasSelection}>
          {label}
          {hasSelection && (
            <span className="rounded bg-primary px-1 text-xs text-primary-foreground">{selectedCount}</span>
          )}
          <ChevronDown aria-hidden />
        </Button>
      }
    >
      <MultiSelectOptions
        label={label}
        options={options}
        value={value}
        onValueChange={onValueChange}
        isLoading={isLoading}
      />
    </Popover>
  );
}
