import { useState, type ChangeEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../Button';
import { Popover } from '../Popover';
import { SearchInput } from '../SearchInput';
import { Skeleton } from '../Skeleton';

/** Above this many options the list gets a local search box. */
const LOCAL_SEARCH_THRESHOLD = 8;

export interface MultiSelectOption<TValue extends string> {
  value: TValue;
  label: string;
}

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

/** Mounted only while the popover is open, so the local search resets on every open. */
function MultiSelectOptions<TValue extends string>({
  label,
  options,
  value,
  onValueChange,
  isLoading,
}: Required<MultiSelectFilterProps<TValue>>) {
  const { t, i18n } = useTranslation('common');
  const [search, setSearch] = useState('');

  // Local filter inside a picker: plain client-side filter(), no debounce needed.
  const normalisedSearch = search.trim().toLocaleLowerCase(i18n.language);
  const visibleOptions = normalisedSearch
    ? options.filter((option) => option.label.toLocaleLowerCase(i18n.language).includes(normalisedSearch))
    : options;
  const isSearchable = options.length > LOCAL_SEARCH_THRESHOLD;
  const hasSelection = value.length > 0;

  function handleOptionChange(event: ChangeEvent<HTMLInputElement>) {
    const { value: rawValue, checked } = event.currentTarget;
    const option = options.find((candidate) => candidate.value === rawValue);
    if (!option) return;
    onValueChange(checked ? [...value, option.value] : value.filter((item) => item !== option.value));
  }

  function handleClear() {
    onValueChange([]);
  }

  return (
    <div className="flex flex-col gap-2">
      {isSearchable && (
        <SearchInput
          value={search}
          onValueChange={setSearch}
          label={t('filters.searchOptions', { label })}
          placeholder={t('filters.searchPlaceholder')}
        />
      )}
      <fieldset className="max-h-64 overflow-y-auto">
        <legend className="sr-only">{label}</legend>
        {isLoading && <OptionsSkeleton />}
        {!isLoading && visibleOptions.length === 0 && (
          <p className="px-2 py-3 text-sm text-content-muted">{t('filters.noMatches')}</p>
        )}
        {visibleOptions.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-hover"
          >
            <input
              type="checkbox"
              value={option.value}
              checked={value.includes(option.value)}
              onChange={handleOptionChange}
              className="size-4 accent-primary"
            />
            <span className="truncate">{option.label}</span>
          </label>
        ))}
      </fieldset>
      <div className="flex justify-end border-t border-border pt-2">
        <Button variant="ghost" onClick={handleClear} disabled={!hasSelection}>
          {t('filters.clear')}
        </Button>
      </div>
    </div>
  );
}

const SKELETON_OPTIONS = 4;

function OptionsSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-2">
      {Array.from({ length: SKELETON_OPTIONS }, (_, index) => (
        <Skeleton key={index} className="h-5" />
      ))}
    </div>
  );
}
