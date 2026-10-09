---
name: multi-tab-workspace
description: Build a multi-tab surface where several drafts or workspaces are open at once, each with its own state that survives tab switching and page reload. Use for draft tabs, open multiple items, case intake review tabs, or the investigator workspace. Produces a Zustand store keyed by id, IndexedDB persistence and per-tab dirty state.
---

# Multi-tab workspace

> Written from the architecture document before Case Intake Review existed. Replace the
> example with the real `draftsStore.ts` once it is built.

This is the trickiest pattern in the design. Rules: `.claude/rules/state-management.md`
and `.claude/rules/forms.md`.

**Do not use Context, and do not use Redux.** Context would re-render every open tab on
every keystroke in the active one. Redux is more machinery than the problem needs.

## The five rules that make it work

1. **Only the active tab is mounted.** Hidden tabs render nothing — their data lives in the
   store, not in a hidden DOM tree. With heavy forms and an upload panel, keeping three
   mounted triples the cost for no benefit.
2. **The store is the source of truth, the form is a copy.** On mount the form is
   initialised from the store via `defaultValues`. On change it writes back **debounced at
   ~500 ms**. Never make react-hook-form controlled by Zustand on every keystroke.
3. **Persist to IndexedDB, not localStorage.** Drafts hold a lot of text and a file
   reference. An analyst who closes the browser must find their drafts on return.
4. **Dirty state is per tab.** Closing a dirty tab asks for confirmation; closing a clean
   one does not.
5. **Subscribe with selectors.** `useDraftsStore(s => s.drafts[id])`, never
   `useDraftsStore()` — selecting the whole store defeats the point of using Zustand.

## Template

```ts
// features/case-intake/model/draftsStore.ts
type DraftsState = {
  drafts: Record<string, CaseDraft>;   // keyed by draft id
  order: string[];                     // tab order
  activeId: string | null;
};

type DraftsActions = {
  openDraft: () => string;
  closeDraft: (id: string) => void;
  setActive: (id: string) => void;
  updateDraft: (id: string, patch: Partial<CaseDraft>) => void;
};

export const useDraftsStore = create<DraftsState & DraftsActions>()(
  persist(
    (set) => ({
      drafts: {},
      order: [],
      activeId: null,

      openDraft: () => {
        const id = crypto.randomUUID();
        set((s) => ({
          drafts: { ...s.drafts, [id]: createEmptyDraft(id) },  // never mutate
          order: [...s.order, id],
          activeId: id,
        }));
        return id;
      },

      closeDraft: (id) =>
        set((s) => {
          const { [id]: _removed, ...rest } = s.drafts;
          const order = s.order.filter((x) => x !== id);
          return { drafts: rest, order, activeId: s.activeId === id ? order.at(-1) ?? null : s.activeId };
        }),

      setActive: (id) => set({ activeId: id }),

      updateDraft: (id, patch) =>
        set((s) => ({
          drafts: { ...s.drafts, [id]: { ...s.drafts[id], ...patch, isDirty: true } },
        })),
    }),
    { name: 'case-intake-drafts', storage: createIndexedDbStorage() },
  ),
);
```

```tsx
// features/case-intake/components/DraftTabs.tsx
export function DraftTabs() {
  const order = useDraftsStore((s) => s.order);            // selector, always
  const activeId = useDraftsStore((s) => s.activeId);
  const openDraft = useDraftsStore((s) => s.openDraft);

  return (
    <>
      <TabBar>
        {order.map((id) => <DraftTab key={id} draftId={id} />)}
        <TabBar.Add onClick={openDraft} />
      </TabBar>

      {/* only the active tab is mounted; key resets the form per draft */}
      {activeId ? <DraftPanel key={activeId} draftId={activeId} /> : <EmptyDraftState />}
    </>
  );
}
```

```tsx
// features/case-intake/components/DraftPanel.tsx
export function DraftPanel({ draftId }: DraftPanelProps) {
  const draft = useDraftsStore((s) => s.drafts[draftId]);   // one draft, not the store
  const updateDraft = useDraftsStore((s) => s.updateDraft);
  const form = useForm<CaseDraft>({ defaultValues: draft }); // store -> form, once

  // form -> store, debounced; NOT on every keystroke
  const debouncedValues = useDebouncedValue(form.watch(), 500);
  useEffect(() => { updateDraft(draftId, debouncedValues); }, [debouncedValues]);

  return <CreateCaseForm form={form} />;
}
```

> The `useEffect` above is one of the few legitimate ones: it synchronises React with an
> external store on a debounce. Keep it that narrow.

## Do not

- Keep hidden tabs mounted.
- Call `useDraftsStore()` without a selector.
- Mutate `drafts` or `order` in place.
- Use localStorage — drafts can be large and hold file references.
- Close a dirty tab without `useConfirm()`.
- Make the form controlled by the store on every keystroke.

The same pattern covers the Investigator Workspace later — multiple open workspaces, each
with graph and map state, saved to IndexedDB. Build it here with that in mind.

`createIndexedDbStorage()` is unwritten; `idb-keyval` vs a custom `persist` adapter is open
— see `.claude/rules/open-questions.md`.
