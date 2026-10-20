import { Check, ChevronDown } from 'lucide-react';
import { Select } from 'radix-ui';
import { useController, useFormContext } from 'react-hook-form';
import { fieldControlVariants } from './fieldStyles';
import { FormField } from './FormField';

export interface SelectFieldOption {
  value: string;
  label: string;
}

/** Radix Select forbids an item with value ''; this sentinel stands for "not set". */
const EMPTY_OPTION_VALUE = '__empty__';

interface SelectFieldProps {
  name: string;
  label: string;
  options: readonly SelectFieldOption[];
  placeholder?: string;
  /** Adds a first option that clears the value (stored as ''), e.g. "Not set". */
  emptyOptionLabel?: string;
  isRequired?: boolean;
  description?: string;
  /** Options come from reference data that is still loading. */
  isLoading?: boolean;
  /** Called after the form value changes — for dependent fields. */
  onValueChange?: (value: string) => void;
  className?: string;
}

export function SelectField({
  name,
  label,
  options,
  placeholder,
  emptyOptionLabel,
  isRequired,
  description,
  isLoading = false,
  onValueChange,
  className,
}: SelectFieldProps) {
  const { control } = useFormContext();
  const { field } = useController({ name, control });

  const value = typeof field.value === 'string' ? field.value : '';
  const selectValue = value === '' && emptyOptionLabel ? EMPTY_OPTION_VALUE : value;

  function handleValueChange(next: string) {
    const nextValue = next === EMPTY_OPTION_VALUE ? '' : next;
    field.onChange(nextValue);
    onValueChange?.(nextValue);
  }

  return (
    <FormField name={name} label={label} isRequired={isRequired} description={description} className={className}>
      {(controlProps) => (
        <Select.Root value={selectValue} onValueChange={handleValueChange} disabled={isLoading} name={field.name}>
          <Select.Trigger
            {...controlProps}
            ref={field.ref}
            onBlur={field.onBlur}
            className={fieldControlVariants({ kind: 'trigger' })}
          >
            <span className="truncate">
              <Select.Value placeholder={placeholder} />
            </span>
            <Select.Icon className="text-muted-foreground">
              <ChevronDown aria-hidden />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content
              position="popper"
              sideOffset={4}
              collisionPadding={16}
              className="z-50 max-h-(--radix-select-content-available-height) w-(--radix-select-trigger-width) overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
            >
              <Select.Viewport className="p-1">
                {emptyOptionLabel && <SelectOption value={EMPTY_OPTION_VALUE} label={emptyOptionLabel} />}
                {options.map((option) => (
                  <SelectOption key={option.value} value={option.value} label={option.label} />
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      )}
    </FormField>
  );
}

function SelectOption({ value, label }: SelectFieldOption) {
  return (
    <Select.Item
      value={value}
      className="relative flex cursor-default items-center rounded-md py-1.5 ps-7 pe-2 text-sm outline-none select-none data-highlighted:bg-accent"
    >
      <Select.ItemIndicator className="absolute start-2 inline-flex">
        <Check aria-hidden className="size-4" />
      </Select.ItemIndicator>
      <Select.ItemText>{label}</Select.ItemText>
    </Select.Item>
  );
}
