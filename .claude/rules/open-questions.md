# Open questions, proposals, and gaps

Everything in `CLAUDE.md` and the other rule files is a **confirmed decision** from the
Oct 8, 2026 architecture document. This file holds what is *not* settled. Do not silently
resolve one of these — ask, then move the answer into the right rule file and delete the
entry here.

## Decisions still open (the document names two options)

| Question | Options | Where it bites |
|---|---|---|
| Graph library | Sigma.js **or** Cytoscape | `heavy-visual-modules.md`, the graph feature |
| API transport | `fetch` **or** axios, wrapped in `apiClient.ts` | `api-layer.md`, `add-api-endpoint` skill |
| Boundary enforcement | `eslint-plugin-boundaries` **or** `eslint-plugin-import` restricted zones | `architecture.md`, CI |
| Dark-mode selector | `data-theme` attribute **or** `.dark` class on `<html>` | `styling.md`, `ThemeProvider` |
| Draft persistence adapter | `idb-keyval` **or** a Zustand `persist` adapter over IndexedDB | `multi-tab-workspace` skill |

## A proposal recorded as the rule — please confirm

**Handler naming.** You proposed `dropdownChangeHandler` (`xHandler`). The document
recommends `handleDropdownChange` (`handleX`) instead, on the practical grounds that it
matches React tooling, library examples and Claude's default output, removing a correction
step on every file. Every example in the document uses `handleX`, so **`handleX` is written
into `CLAUDE.md` as the active rule**. Say the word and it flips — the rule that actually
matters is that props are `onX` and the function behind them is never also `onX`.

## Not specified anywhere in the source document

These are needed before the corresponding work can start:

- **Router library.** The document assumes a router ("defined in the router",
  `/cases?preview=…`, URL search-param state) but never names one. React Router vs TanStack
  Router changes the `useUrlState` recipe and the lazy-route registration in the
  `new-feature-module` skill.
- **Toast implementation.** Toasts are specified behaviourally ("fired from mutation
  callbacks") but no library is chosen.
- **Auth.** `app/` is described as holding "auth bootstrap"; no scheme, token storage or
  `usePermission` backing is defined.
- **The full token palette.** `styling.md` carries the three example tokens from the
  document. The real cream/green/amber/red values still have to be extracted from the
  design files.
- **Backend API shape.** Endpoint paths, pagination envelope and error body are unknown, so
  the `add-api-endpoint` template uses a placeholder shape.

## Skills: planned vs created

The document's final table lists **ten** skills, and all ten exist under `.claude/skills/`.
An eleventh, `review-project-instructions`, was added at your request and is **not** from
the document: it reviews a finished feature against these files and reports what has gone
stale. It operationalises the document's own "corrected twice" signal.
Four more are named in passing in the section "Mark:" lines but are absent from that final
table, which the document calls "the full list". They were **not** created as separate
skills; their content lives here instead:

| Mentioned in passing | Where its content went |
|---|---|
| "put state in the URL" / `useUrlState` | `add-table-filters` skill + `tables-filters-search.md` |
| "add a Zustand store" | `multi-tab-workspace` skill + `state-management.md` |
| "add a lazy route" | `new-feature-module` skill + `performance.md` |
| "move work to a Web Worker" | **Nowhere.** One line in `performance.md`; no recipe exists. |

Feature-specific graph and map skills are deliberately deferred — the document says to
write them "at the time, not now".

## The skills were written ahead of the code

The document is explicit: *"Write the skill after you have built the first real instance of
the pattern. A skill written from theory encodes guesses."* The repository is currently an
empty Vite starter, so **every skill here is written from theory.** Each one carries a note
saying so. Rewrite each skill's example from the real file the first time the pattern is
built — `CaseTable.tsx` for `add-data-table`, and so on.

## Repository gaps against the stated stack

The repo is a bare Vite + React 19 starter. The React Compiler *is* already enabled. Still
missing, and intentionally not installed or configured as part of writing these rules:

- `strict: true` is absent from `tsconfig.app.json` — the rules and the definition of done
  assume TypeScript strict.
- No `@/*` → `src/*` path alias in `tsconfig.app.json` or `vite.config.ts`, which every
  import example depends on.
- None of Tailwind v4, Radix, Lucide, TanStack, Zustand, react-hook-form, Zod, i18next,
  cva/clsx/tailwind-merge, MapLibre, deck.gl, D3, Vitest, Testing Library or Playwright is
  installed.
- No `src/app`, `src/shared` or `src/features` directories yet.
- ESLint has rules-of-hooks but not the boundary rules or the no-literal-JSX-text rule.

## Internal conflicts in the source document

1. **The overlay choice table.** The Dialogs section marks it *Always-on* ("short and
   constantly needed"), but the final "what goes in `CLAUDE.md`" list does not include it,
   and the same page says "resist adding more". The final list won: the table lives in
   `overlays.md`, not `CLAUDE.md`. Flip it if you disagree — it costs about eight lines.
2. **Skills: ten or fourteen?** The "Mark:" lines name four skills that the final table
   omits, while calling that table "the full list". The table won. See the mapping above.
3. **Pinned versions.** `CLAUDE.md` is specified to carry "stack and versions", but the
   document fixes no version numbers beyond React 19 — and deck.gl and MapLibre are
   required to be pinned exactly. Versions are therefore named only by major where known.
