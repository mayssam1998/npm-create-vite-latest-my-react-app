import { useId, type ReactNode } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';

/** Props a field component spreads onto its control so label, hint and error are linked. */
export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
}

interface FormFieldProps {
  /** The react-hook-form field path. */
  name: string;
  label: string;
  isRequired?: boolean;
  description?: string;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * Label, required marker, description and error text around one control. Every shared
 * field component is built on it; features never assemble these pieces by hand.
 * Error messages are translation keys in `common` (e.g. `validation.required`); a message
 * that is not a key — server text — is shown as-is.
 */
export function FormField({ name, label, isRequired = false, description, className, children }: FormFieldProps) {
  const { t } = useTranslation('common');
  const id = useId();
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name });
  const { error } = getFieldState(name, formState);

  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const describedBy = cn(description && descriptionId, error && errorId) || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-content">
        {label}
        {isRequired && (
          <span className="ms-0.5 text-danger" aria-hidden>
            *
          </span>
        )}
      </label>
      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': isRequired ? true : undefined,
      })}
      {description && (
        <p id={descriptionId} className="text-xs text-content-muted">
          {description}
        </p>
      )}
      {error?.message && (
        <p id={errorId} className="text-xs text-danger">
          {t(error.message, { defaultValue: error.message })}
        </p>
      )}
    </div>
  );
}
