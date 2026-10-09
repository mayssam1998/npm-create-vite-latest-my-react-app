---
name: add-dialog
description: Add a dialog, modal, side panel, sheet, popover, dropdown menu, tooltip or confirmation. Use when an overlay is needed, when choosing between a routed panel and local state, or when wrapping a Radix primitive. Produces the correct overlay type, the shared wrapper usage, focus handling and RTL-safe portalling.
---

# Add a dialog or overlay

> Written from the architecture document before the first overlay existed. Replace the
> example once `shared/ui/Dialog` is built.

Rules: `.claude/rules/overlays.md`.

**One system: Radix wrapped once in `shared/ui/`.** A feature never imports `@radix-ui/*`
directly and never builds its own modal from a `position: fixed` div. Wrapping once is what
gives consistent animation, focus trapping, escape handling, scroll locking and RTL
everywhere for free.

## Step 1 — pick the type

| Type | Use for | Example |
|---|---|---|
| `Dialog` | A focused task that blocks the page | Confirm delete, assign owner |
| `Sheet` / side panel | Detail or context beside the main view | Case preview from a table row |
| `Popover` | Small controls attached to a trigger | Filter dropdowns, column visibility |
| `DropdownMenu` | A list of actions | Row actions menu |
| `Tooltip` | Short labels only — **never** interactive content | Icon buttons in the header |
| `Toast` | Result of an action | "Case created" |

## Step 2 — routed or local?

**Routed** if it should be linkable, refreshable or in browser history —
`/cases?preview=CASE-2026-0169`. Case detail panels are routed.

**Local** if it is transient — a confirm, a quick menu. Use `useDisclosure`. Confirms are
never routed.

## Step 3 — build it

```tsx
// routed: the open state is the URL
export function CasePreviewSheet() {
  const [params, setParams] = useUrlState();
  const previewId = params.preview;

  return (
    <Sheet open={Boolean(previewId)} onOpenChange={() => setParams({ preview: undefined })}>
      {/* content is lazy: the query only mounts when previewId exists */}
      {previewId ? <CasePreviewContent caseId={previewId} /> : null}
    </Sheet>
  );
}

function CasePreviewContent({ caseId }: { caseId: string }) {
  const { data, isLoading } = useCase(caseId);   // mounted only when open
  if (isLoading) return <SheetSkeleton />;
  return <CaseDetailPanel case={data} />;
}
```

```tsx
// local + confirm: no per-component dialog state at all
export function CaseRowActions({ caseId }: CaseRowActionsProps) {
  const { t } = useTranslation('cases');
  const confirm = useConfirm();
  const deleteCase = useDeleteCase();

  async function handleDelete() {
    const isConfirmed = await confirm({
      titleKey: 'cases.delete.title',
      bodyKey: 'cases.delete.body',
      tone: 'destructive',
    });
    if (!isConfirmed) return;
    deleteCase.mutate(caseId);   // toast fires from the mutation, not from here
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton icon={MoreHorizontal} label={t('row.actions')} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={handleDelete}>{t('row.delete')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Do not

- Nest a dialog inside a dialog. If you need a second step, make it a step **inside** the
  same dialog.
- Put interactive content in a `Tooltip`.
- Import `@radix-ui/*` from a feature.
- Fetch in an overlay that is always mounted — mount the query only when it opens.
- Fire a toast from a component. Toasts come from mutation callbacks.
- Render outside the portal root that carries the correct `dir` — Arabic layouts break.
- Add per-component `useState` for a confirmation. Use `useConfirm()`.

A toast library has not been chosen — see `.claude/rules/open-questions.md`.
