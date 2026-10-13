import type { ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface SearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible name — the placeholder is not a label. */
  label: string;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onValueChange, label, placeholder, className }: SearchInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onValueChange(event.currentTarget.value);
  }

  return (
    <div className={cn('relative', className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-content-subtle"
      />
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="h-8 w-full rounded-md border border-border bg-surface-raised ps-8 pe-2 text-sm text-content placeholder:text-content-subtle"
      />
    </div>
  );
}
