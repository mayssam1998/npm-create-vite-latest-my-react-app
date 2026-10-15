export interface DebouncedFunction {
  (): void;
  /** Run the pending call now, if there is one. */
  flush: () => void;
  /** Drop the pending call. */
  cancel: () => void;
}

/**
 * Plain (non-React) trailing debounce with `flush` and `cancel`. For a debounced *value*
 * inside a component use `useDebouncedValue`; this is for subscriptions set up in an effect.
 */
export function debounce(fn: () => void, delayMs: number): DebouncedFunction {
  let timeoutId: number | undefined;

  function cancel() {
    window.clearTimeout(timeoutId);
    timeoutId = undefined;
  }

  function flush() {
    if (timeoutId === undefined) return;
    cancel();
    fn();
  }

  function debounced() {
    cancel();
    timeoutId = window.setTimeout(flush, delayMs);
  }

  return Object.assign(debounced, { flush, cancel });
}
