# Dialogs, overlays and panels

**One system: Radix primitives wrapped once in `shared/ui/`.** No feature ever imports
`@radix-ui/*` directly, and no feature builds its own modal with a `position: fixed` div.
Wrapping once is what gives you consistent animation, focus trapping, escape handling,
scroll locking and RTL in every overlay for free.

## Choose the overlay type by what the user is doing

| Type | Use for | Example |
|---|---|---|
| `Dialog` | A focused task that blocks the page | Confirm delete, assign owner |
| `Sheet` / side panel | Detail or context beside the main view | Case preview from a table row |
| `Popover` | Small controls attached to a trigger | Filter dropdowns, column visibility |
| `DropdownMenu` | A list of actions | Row actions menu |
| `Tooltip` | Short labels only — never interactive content | Icon buttons in the header |
| `Toast` | Result of an action | "Case created" |

## Routed vs local

If an overlay should be linkable, refreshable or in browser history, it is a **route**
(`/cases?preview=CASE-2026-0169`). If it is transient — a confirm, a quick menu — it is
**local state** via `useDisclosure`.

Case detail panels should be routed. Confirms should not.

## Rules

- **Never nest a dialog inside a dialog.** If you need a second step, make it a step inside
  the same dialog.
- One shared `useConfirm()` hook returning a promise, so confirmations do not need
  per-component state.
- Toasts are fired from mutation callbacks, not from components: `toast.success(…)` from
  `shared/lib/toast.ts`, rendered by `shared/ui/Toaster` (Radix Toast, decided Oct 15,
  2026). Messages are translated in the mutation hook.
- Overlay content that fetches must be lazy — mount the query only when the overlay opens.
- All overlays render in a portal attached to a root with the correct `dir`, so Arabic
  layouts do not break.

Recipe: the `add-dialog` skill.
