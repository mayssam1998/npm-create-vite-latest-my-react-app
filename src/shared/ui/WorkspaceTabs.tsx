import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { X, type LucideIcon } from 'lucide-react';
import { Tabs } from 'radix-ui';

const MIDDLE_MOUSE_BUTTON = 1;

interface WorkspaceTabsProps {
  /** Accessible name of the tab list. */
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  /** `WorkspaceTab` elements. */
  tabs: ReactNode;
  /** Controls after the tabs, e.g. a "New" button. */
  actions?: ReactNode;
  /** The active tab's panel. Only the active panel is ever mounted. */
  children: ReactNode;
}

/**
 * A browser-style strip of closable tabs over one panel — case intake drafts today, the
 * investigator workspaces later. Arrow keys move between tabs, Delete closes the focused
 * tab, and a middle click closes a tab.
 */
export function WorkspaceTabs({ label, value, onValueChange, tabs, actions, children }: WorkspaceTabsProps) {
  return (
    <Tabs.Root value={value} onValueChange={onValueChange} className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-end gap-1 border-b border-border bg-surface-muted px-2 pt-1">
        <Tabs.List aria-label={label} className="flex min-w-0 items-end overflow-x-auto overflow-y-hidden">
          {tabs}
        </Tabs.List>
        {actions && <div className="flex shrink-0 items-center gap-1 self-center pb-1">{actions}</div>}
      </div>
      <Tabs.Content value={value} className="flex min-h-0 flex-1 flex-col">
        {children}
      </Tabs.Content>
    </Tabs.Root>
  );
}

interface WorkspaceTabProps {
  value: string;
  label: string;
  icon?: LucideIcon;
  /** Shows a dot after the label. */
  hasUnsavedChanges?: boolean;
  /** Screen-reader text for the dot. */
  unsavedChangesLabel?: string;
  /** Accessible name of the close button, e.g. "Close New case". */
  closeLabel: string;
  onClose: (value: string) => void;
}

export function WorkspaceTab({
  value,
  label,
  icon: Icon,
  hasUnsavedChanges = false,
  unsavedChangesLabel,
  closeLabel,
  onClose,
}: WorkspaceTabProps) {
  function handleClose() {
    onClose(value);
  }

  function handleAuxClick(event: MouseEvent<HTMLButtonElement>) {
    if (event.button !== MIDDLE_MOUSE_BUTTON) return;
    event.preventDefault();
    onClose(value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'Delete') return;
    event.preventDefault();
    onClose(value);
  }

  return (
    <div className="-mb-px flex shrink-0 items-center rounded-t-md border border-transparent has-[[data-state=active]]:border-border has-[[data-state=active]]:border-b-surface has-[[data-state=active]]:bg-surface">
      <Tabs.Trigger
        value={value}
        title={label}
        onAuxClick={handleAuxClick}
        onKeyDown={handleKeyDown}
        className="flex h-9 max-w-52 items-center gap-1.5 rounded-t-md ps-3 pe-1 text-sm text-content-muted hover:text-content data-[state=active]:font-medium data-[state=active]:text-content"
      >
        {Icon && <Icon aria-hidden className="size-4 shrink-0" />}
        <span className="truncate">{label}</span>
        {hasUnsavedChanges && (
          <span className="size-1.5 shrink-0 rounded-full bg-accent-amber">
            <span className="sr-only">{unsavedChangesLabel}</span>
          </span>
        )}
      </Tabs.Trigger>
      <button
        type="button"
        aria-label={closeLabel}
        title={closeLabel}
        onClick={handleClose}
        className="me-1 rounded p-1 text-content-subtle hover:bg-surface-hover hover:text-content"
      >
        <X aria-hidden className="size-3.5" />
      </button>
    </div>
  );
}
