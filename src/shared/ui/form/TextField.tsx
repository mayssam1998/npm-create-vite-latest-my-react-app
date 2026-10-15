import { useFormContext } from 'react-hook-form';
import { fieldControlVariants } from './fieldStyles';
import { FormField } from './FormField';

interface TextFieldProps {
  name: string;
  label: string;
  isRequired?: boolean;
  description?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel';
  autoComplete?: string;
  autoFocus?: boolean;
  className?: string;
}

/** A single-line input. Uncontrolled through `register`, so typing re-renders nothing else. */
export function TextField({
  name,
  label,
  isRequired,
  description,
  placeholder,
  type = 'text',
  autoComplete = 'off',
  autoFocus,
  className,
}: TextFieldProps) {
  const { register } = useFormContext();

  return (
    <FormField name={name} label={label} isRequired={isRequired} description={description} className={className}>
      {(control) => (
        <input
          {...control}
          {...register(name)}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={fieldControlVariants({ kind: 'input' })}
        />
      )}
    </FormField>
  );
}
