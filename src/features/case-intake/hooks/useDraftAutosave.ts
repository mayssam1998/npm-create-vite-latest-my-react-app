import { useEffect, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { debounce, type DebouncedFunction } from '@/shared/lib/debounce';
import { AUTOSAVE_DELAY_MS, type CaseDraftValues } from '../model/caseDraft';
import { useDraftsStore } from '../model/draftsStore';

/**
 * Form → drafts store, debounced. The store is the source of truth and the form is a copy:
 * the form was seeded from the store once, and this writes it back ~500 ms after typing
 * stops — never on every keystroke, and without re-rendering the form (a `watch` callback
 * subscription, not `watch()` in render).
 *
 * The first change of a never-edited draft is written at once, so the draft stops counting
 * as blank immediately (closing its tab must not delete it). Pending changes are flushed on
 * unmount (tab switch) and when the page is hidden (reload, browser closed).
 */
export function useDraftAutosave(draftId: string, form: UseFormReturn<CaseDraftValues>) {
  const saveValues = useDraftsStore((state) => state.saveValues);
  const pendingRef = useRef<DebouncedFunction | null>(null);

  // Legitimate effect: subscribing to an external source (the form) and writing to an
  // external store, with cleanup.
  useEffect(() => {
    let isFirstChange = useDraftsStore.getState().drafts[draftId]?.revision === 0;

    function writeValues() {
      saveValues(draftId, form.getValues());
    }

    const pending = debounce(writeValues, AUTOSAVE_DELAY_MS);
    pendingRef.current = pending;

    const subscription = form.watch(() => {
      if (isFirstChange) {
        isFirstChange = false;
        writeValues();
        return;
      }
      pending();
    });

    window.addEventListener('pagehide', pending.flush);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('pagehide', pending.flush);
      pending.flush();
      pendingRef.current = null;
    };
  }, [draftId, form, saveValues]);

  return {
    /** Write any pending change now — before reading the draft from the store. */
    flush: () => pendingRef.current?.flush(),
    /** Drop any pending change — before deleting the draft. */
    cancel: () => pendingRef.current?.cancel(),
  };
}
