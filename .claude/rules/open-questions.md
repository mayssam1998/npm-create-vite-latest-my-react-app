# Open questions, proposals, and gaps

Everything in `CLAUDE.md` and the other rule files is a **confirmed decision** from the
Oct 8, 2026 architecture document. This file holds what is *not* settled. Do not silently
resolve one of these — ask, then move the answer into the right rule file and delete the
entry here.

## Decisions still open (the document names two options)

| Question | Options | Where it bites |
|---|---|---|
| Graph library | Sigma.js **or** Cytoscape | `heavy-visual-modules.md`, the graph feature |

## Not specified anywhere in the source document

These are needed before the corresponding work can start:

- **Auth.** `app/` is described as holding "auth bootstrap"; no scheme, token storage or
  `usePermission` backing is defined.
- **The full token palette.** `styling.md` carries the three example tokens from the
  document. The real cream/green/amber/red values still have to be extracted from the
  design files.
- **Backend API shape.** Endpoint paths, pagination envelope and error body are unknown, so
  the `add-api-endpoint` template uses a placeholder shape. The mock server assumes a 422
  body of `{ fieldErrors: { "<dotted.path>": "<message or key>" } }`, read by
  `getServerFieldIssues` in `shared/lib/formErrors.ts`, plus `PUT/DELETE /case-drafts/:id`.
- **Priority service levels.** `PRIORITY_DUE_DAYS` (urgent 1 · high 3 · normal 5 · low 10
  days) in `features/cases/model/createCase.ts` is an assumption; replace with the real
  values, ideally served as reference data.

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

Done on Oct 13, 2026 with the Case Management page: `strict: true`, the `@/*` alias, the
`src/app` / `src/shared` / `src/features` layout, and Tailwind v4, Radix (`radix-ui`), Lucide,
TanStack Query / Table **v9** / Virtual, Zod v4, i18next + react-i18next,
cva / clsx / tailwind-merge and React Router v7. Still missing:

- Not installed: Zustand, react-hook-form + `@hookform/resolvers`, MapLibre, deck.gl, D3,
  Vitest, Testing Library, Playwright.
- ESLint has rules-of-hooks and the boundary rules (Oct 15, 2026) but not the
  no-literal-JSX-text rule.
- No CI pipeline yet — every "enforce in CI" currently means `npm run lint` / `npm run build`.
- No bundle-budget check (`size-limit`) in the build yet.

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
