import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createIndexedDbStorage } from '@/shared/lib/indexedDbStorage';
import { createDraft, isBlankDraft, type CaseDraft, type CaseDraftValues, type ServerDraft } from './caseDraft';

interface DraftsData {
  /** Every draft on this device, keyed by id — open in a tab or not. */
  drafts: Record<string, CaseDraft>;
  /** Drafts open as tabs, in tab order. A draft that is closed but kept is absent here. */
  openIds: string[];
  activeId: string | null;
}

interface DraftsActions {
  /** Open a new blank draft in a tab and focus it. */
  createDraft: () => string;
  /** The "New case" entry point: focus an open blank draft if there is one, else create one. */
  startNewCase: () => string;
  /** Reopen a kept draft as a tab, or focus it if it is already open. */
  openDraft: (id: string) => void;
  /** Close the tab. A blank draft is deleted; any other draft is kept and can be reopened. */
  closeTab: (id: string) => void;
  /** Delete the draft for good — Discard, or after the case is created. */
  removeDraft: (id: string) => void;
  setActive: (id: string) => void;
  /** Local autosave from the form. Ignored for a draft that no longer exists. */
  saveValues: (id: string, values: CaseDraftValues) => void;
  /** Record a successful server save of `revision`. Later local edits stay marked unsaved. */
  markSavedToServer: (id: string, serverDraft: ServerDraft, revision: number) => void;
}

type DraftsState = DraftsData & DraftsActions;

const STORAGE_NAME = 'case-intake-drafts';
const STORAGE_VERSION = 1;

function omitDraft(drafts: Record<string, CaseDraft>, id: string) {
  const next = { ...drafts };
  delete next[id];
  return next;
}

/** Browser-tab behaviour: closing the active tab activates its right-hand neighbour, else its left. */
function nextActiveId(openIds: readonly string[], closingId: string, activeId: string | null) {
  if (activeId !== closingId) return activeId;
  const index = openIds.indexOf(closingId);
  return openIds[index + 1] ?? openIds[index - 1] ?? null;
}

function withoutTab(state: DraftsData, id: string): Pick<DraftsData, 'openIds' | 'activeId'> {
  return {
    openIds: state.openIds.filter((openId) => openId !== id),
    activeId: nextActiveId(state.openIds, id, state.activeId),
  };
}

/**
 * Case intake drafts — the multi-tab workspace. Zustand (not Context) so a keystroke in
 * one tab never re-renders the others; persisted to IndexedDB so drafts survive a reload
 * or a closed browser. Always subscribe with a selector.
 */
export const useDraftsStore = create<DraftsState>()(
  persist(
    (set, get) => ({
      drafts: {},
      openIds: [],
      activeId: null,

      createDraft: () => {
        const draft = createDraft(crypto.randomUUID());
        set((state) => ({
          drafts: { ...state.drafts, [draft.id]: draft },
          openIds: [...state.openIds, draft.id],
          activeId: draft.id,
        }));
        return draft.id;
      },

      startNewCase: () => {
        const { drafts, openIds } = get();
        const blankId = openIds.find((id) => isBlankDraft(drafts[id]));
        if (!blankId) return get().createDraft();
        set({ activeId: blankId });
        return blankId;
      },

      openDraft: (id) =>
        set((state) => {
          if (!state.drafts[id]) return state;
          const openIds = state.openIds.includes(id) ? state.openIds : [...state.openIds, id];
          return { openIds, activeId: id };
        }),

      closeTab: (id) =>
        set((state) => {
          const draft = state.drafts[id];
          const drafts = draft && isBlankDraft(draft) ? omitDraft(state.drafts, id) : state.drafts;
          return { drafts, ...withoutTab(state, id) };
        }),

      removeDraft: (id) => set((state) => ({ drafts: omitDraft(state.drafts, id), ...withoutTab(state, id) })),

      setActive: (id) => set({ activeId: id }),

      saveValues: (id, values) =>
        set((state) => {
          const draft = state.drafts[id];
          if (!draft) return state;
          return {
            drafts: {
              ...state.drafts,
              [id]: { ...draft, values, revision: draft.revision + 1, updatedAt: new Date().toISOString() },
            },
          };
        }),

      markSavedToServer: (id, serverDraft, revision) =>
        set((state) => {
          const draft = state.drafts[id];
          if (!draft) return state;
          return { drafts: { ...state.drafts, [id]: { ...draft, serverDraft, savedRevision: revision } } };
        }),
    }),
    {
      name: STORAGE_NAME,
      version: STORAGE_VERSION,
      storage: createIndexedDbStorage<DraftsData>(),
      partialize: ({ drafts, openIds, activeId }) => ({ drafts, openIds, activeId }),
      // Hydrated on demand by ensureDraftsHydrated(), so importing the store never touches IndexedDB.
      skipHydration: true,
    },
  ),
);

let hydration: Promise<void> | undefined;

/**
 * Resolves once the drafts are loaded from IndexedDB. Always the same promise, so a page
 * can `use()` it to suspend until the drafts are there.
 */
export function ensureDraftsHydrated() {
  hydration ??= Promise.resolve(useDraftsStore.persist.rehydrate());
  return hydration;
}
