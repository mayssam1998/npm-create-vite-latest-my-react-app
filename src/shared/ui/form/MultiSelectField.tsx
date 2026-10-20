import { ChevronDown } from 'lucide-react';
import { useController, useFormContext } from 'react-hook-form';
import { MultiSelectOptions, type MultiSelectOption } from '../filters/MultiSelectOptions';
import { Popover } from '../Popover';
import { fieldControlVariants } from './fieldStyles';
import { FormField } from './FormField';

interface MultiSelectFieldProps {
  name: string;
  label: string;
  options: readonly MultiSelectOption<string>[];
  placeholder?: string;
  isRequired?: boolean;
  description?: string;
  isLoading?: boolean;
  className?: string;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

/** Several choices from a known list (e.g. sections), stored as an array of ids. */
export function MultiSelectField({
  name,
  label,
  options,
  placeholder,
  isRequired,
  description,
  isLoading = false,
  className,
}: MultiSelectFieldProps) {
  const { control } = useFormContext();
  const { field } = useController({ name, control });

  const value = toStringArray(field.value);
  const selectedLabels = options.filter((option) => value.includes(option.value)).map((option) => option.label);
  const hasSelection = selectedLabels.length > 0;

  return (
    <FormField name={name} label={label} isRequired={isRequired} description={description} className={className}>
      {(controlProps) => (
        <Popover
          className="w-(--radix-popover-trigger-width) min-w-64"
          trigger={
            <button
              type="button"
              {...controlProps}
              ref={field.ref}
              onBlur={field.onBlur}
              className={fieldControlVariants({ kind: 'trigger' })}
            >
              {hasSelection ? (
                <span className="truncate">{selectedLabels.join(', ')}</span>
              ) : (
                <span className="truncate text-muted-foreground">{placeholder}</span>
              )}
              <ChevronDown aria-hidden className="text-muted-foreground" />
            </button>
          }
        >
          <MultiSelectOptions
            label={label}
            options={options}
            value={value}
            onValueChange={field.onChange}
            isLoading={isLoading}
          />
        </Popover>
      )}
    </FormField>
  );
}
