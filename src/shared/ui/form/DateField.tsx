import { useFormContext } from 'react-hook-form';
import { fieldControlVariants } from './fieldStyles';
import { FormField } from './FormField';

interface DateFieldProps {
  name: string;
  label: string;
  isRequired?: boolean;
  description?: string;
  className?: string;
}

/**
 * A calendar date as `YYYY-MM-DD` (empty string when cleared). The native picker is
 * localised by the browser and keyboard accessible.
 */
export function DateField({ name, label, isRequired, description, className }: DateFieldProps) {
  const { register } = useFormContext();

  return (
    <FormField name={name} label={label} isRequired={isRequired} description={description} className={className}>
      {(control) => <input {...control} {...register(name)} type="date" className={fieldControlVariants()} />}
    </FormField>
  );
}
