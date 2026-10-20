import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { CloudUpload, FileText, RefreshCw, Trash2 } from 'lucide-react';
import { useController, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useFormatters } from '@/shared/hooks/useFormatters';
import { cn } from '@/shared/lib/cn';
import { Button } from '../Button';
import { FilePreview } from '../FilePreview';

interface FileFieldProps {
  name: string;
  /** Heading inside the drop zone. */
  label: string;
  /** Explains what to drop and the limits. */
  hint: string;
  /** Same syntax as the input's `accept`, e.g. `image/*,application/pdf`. */
  accept: string;
  maxSizeBytes: number;
  className?: string;
}

/** Does `file` match an `accept` list (MIME types, `type/*` wildcards or `.ext`)? */
function isAccepted(file: File, accept: string) {
  return accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .some((rule) => {
      if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule);
      if (rule.endsWith('/*')) return file.type.startsWith(rule.slice(0, -1));
      return file.type === rule;
    });
}

/**
 * One file, picked or dropped, stored in the form as a `File` (or `null`). Shows an inline
 * preview once a file is chosen. Wrong type or size sets a field error instead of the value.
 */
export function FileField({ name, label, hint, accept, maxSizeBytes, className }: FileFieldProps) {
  const { t } = useTranslation('common');
  const { formatFileSize } = useFormatters();
  const { control, setError, clearErrors, getFieldState, formState } = useFormContext();
  const {
    field: { value, onChange, ref: focusRef },
  } = useController({ name, control });
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const file = value instanceof File ? value : null;
  const { error } = getFieldState(name, formState);
  const errorText = error?.message ? t(error.message, { defaultValue: error.message }) : null;

  function selectFile(candidate: File | undefined) {
    if (!candidate) return;
    if (!isAccepted(candidate, accept)) {
      setError(name, { type: 'fileType', message: 'validation.fileType' });
      return;
    }
    if (candidate.size > maxSizeBytes) {
      setError(name, { type: 'fileSize', message: 'validation.fileTooLarge' });
      return;
    }
    clearErrors(name);
    onChange(candidate);
  }

  function handleBrowse() {
    inputRef.current?.click();
  }

  function handleRemove() {
    clearErrors(name);
    onChange(null);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.currentTarget.files?.[0]);
    event.currentTarget.value = ''; // picking the same file again still fires change
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
    setIsDragOver(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
    selectFile(event.dataTransfer.files[0]);
  }

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      tabIndex={-1}
      aria-hidden
      onChange={handleInputChange}
      className="hidden"
    />
  );

  if (file) {
    return (
      <div className={cn('flex min-h-0 flex-col gap-3', className)} onDragOver={handleDragOver} onDrop={handleDrop}>
        {hiddenInput}
        <div className="flex items-center gap-3 rounded-md border border-border bg-card p-2">
          <FileText aria-hidden className="size-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          <Button ref={focusRef} variant="ghost" size="icon" onClick={handleBrowse} aria-label={t('form.replaceFile')} title={t('form.replaceFile')}>
            <RefreshCw aria-hidden />
          </Button>
          <Button variant="dangerGhost" size="icon" onClick={handleRemove} aria-label={t('form.removeFile')} title={t('form.removeFile')}>
            <Trash2 aria-hidden />
          </Button>
        </div>
        <FilePreview file={file} title={file.name} unsupportedText={t('form.noPreview')} className="min-h-96 w-full flex-1" />
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-drag-over={isDragOver || undefined}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input p-6 text-center transition-colors data-drag-over:border-primary data-drag-over:bg-accent',
        error && 'border-destructive',
        className,
      )}
    >
      {hiddenInput}
      <CloudUpload aria-hidden className="size-7 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="max-w-xs text-xs text-muted-foreground">{hint}</p>
      <Button ref={focusRef} className="mt-2" onClick={handleBrowse} aria-invalid={error ? true : undefined}>
        {t('form.chooseFile')}
      </Button>
      {errorText && (
        <p role="alert" className="text-xs text-destructive">
          {errorText}
        </p>
      )}
    </div>
  );
}
