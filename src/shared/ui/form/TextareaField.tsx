import { useFormContext } from 'react-hook-form';
import { fieldControlVariants } from './fieldStyles';
import { FormField } from './FormField';

interface TextareaFieldProps {
  name: string;
  label: string;
  isRequired?: boolean;
  description?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function TextareaField({ name, label, isRequired, description, placeholder, rows = 4, className }: TextareaFieldProps) {
  const { register } = useFormContext();

  return (
    <FormField name={name} label={label} isRequired={isRequired} description={description} className={className}>
      {(control) => (
        <textarea
          {...control}
          {...register(name)}
          rows={rows}
          placeholder={placeholder}
          className={fieldControlVariants({ kind: 'textarea' })}
        />
      )}
    </FormField>
  );
}
