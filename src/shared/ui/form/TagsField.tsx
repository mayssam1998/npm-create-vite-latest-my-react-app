import { useId, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { useController, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { fieldControlVariants } from './fieldStyles';
import { FormField } from './FormField';

interface TagsFieldProps {
  name: string;
  label: string;
  /** Offered as autocomplete; any other text is accepted too. */
  suggestions?: readonly string[];
  placeholder?: string;
  isRequired?: boolean;
  description?: string;
  className?: string;
}

/** Keys that turn the typed text into a tag. */
const COMMIT_KEYS = new Set(['Enter', ',']);

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

/** Free-text tags shown as removable chips. Enter or comma adds a tag; Backspace on an empty input removes the last. */
export function TagsField({ name, label, suggestions = [], placeholder, isRequired, description, className }: TagsFieldProps) {
  const { t } = useTranslation('common');
  const suggestionsId = useId();
  const { control } = useFormContext();
  const { field } = useController({ name, control });
  const [text, setText] = useState('');

  const tags = toStringArray(field.value);
  const availableSuggestions = suggestions.filter((suggestion) => !tags.includes(suggestion));

  function addTag(rawTag: string) {
    const tag = rawTag.trim();
    setText('');
    if (!tag || tags.some((existing) => existing.toLocaleLowerCase() === tag.toLocaleLowerCase())) return;
    field.onChange([...tags, tag]);
  }

  function commitText() {
    addTag(text);
  }

  function removeTag(tag: string) {
    field.onChange(tags.filter((existing) => existing !== tag));
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;
    // Picking from the suggestion list fires a plain Event, typing fires an InputEvent:
    // a picked suggestion becomes a tag straight away.
    const isPickedSuggestion = !(event.nativeEvent instanceof InputEvent) && availableSuggestions.includes(value);
    if (isPickedSuggestion) addTag(value);
    else setText(value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (COMMIT_KEYS.has(event.key)) {
      event.preventDefault();
      commitText();
    } else if (event.key === 'Backspace' && text === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  function handleBlur() {
    commitText();
    field.onBlur();
  }

  return (
    <FormField name={name} label={label} isRequired={isRequired} description={description} className={className}>
      {(controlProps) => (
        <div className={fieldControlVariants({ kind: 'box' })}>
          {tags.map((tag) => (
            <TagChip key={tag} tag={tag} removeLabel={t('form.removeTag', { tag })} onRemove={removeTag} />
          ))}
          <input
            {...controlProps}
            ref={field.ref}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            list={suggestionsId}
            placeholder={tags.length === 0 ? placeholder : undefined}
            autoComplete="off"
            className="h-7 min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <datalist id={suggestionsId}>
            {availableSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </div>
      )}
    </FormField>
  );
}

interface TagChipProps {
  tag: string;
  removeLabel: string;
  onRemove: (tag: string) => void;
}

function TagChip({ tag, removeLabel, onRemove }: TagChipProps) {
  function handleRemove() {
    onRemove(tag);
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-accent py-0.5 ps-2 pe-1 text-xs font-medium text-primary">
      {tag}
      <button type="button" aria-label={removeLabel} onClick={handleRemove} className="rounded p-0.5 hover:bg-accent">
        <X aria-hidden className="size-3" />
      </button>
    </span>
  );
}
