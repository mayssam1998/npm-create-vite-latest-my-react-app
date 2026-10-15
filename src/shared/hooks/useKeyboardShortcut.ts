import { useEffect, useRef } from 'react';

interface KeyboardShortcutOptions {
  /** `event.key`, case-insensitive — e.g. `'s'`. */
  key: string;
  /** Require Ctrl (Windows/Linux) or ⌘ (macOS). */
  withModifier?: boolean;
  isEnabled?: boolean;
}

/**
 * Run `onTrigger` on a global keyboard shortcut. The browser default (e.g. Save page for
 * Ctrl+S) is prevented only when the shortcut fires.
 */
export function useKeyboardShortcut(
  { key, withModifier = false, isEnabled = true }: KeyboardShortcutOptions,
  onTrigger: () => void,
) {
  // Latest handler without re-subscribing on every render.
  const onTriggerRef = useRef(onTrigger);
  useEffect(() => {
    onTriggerRef.current = onTrigger;
  });

  useEffect(() => {
    if (!isEnabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== key.toLowerCase()) return;
      if (withModifier && !(event.ctrlKey || event.metaKey)) return;
      if (event.repeat) return;
      event.preventDefault();
      onTriggerRef.current();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, withModifier, isEnabled]);
}
