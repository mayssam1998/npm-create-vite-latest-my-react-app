# Internationalisation and RTL

The header carries a language toggle next to a dark-mode toggle. **Arabic/RTL and dark mode
are day-one concerns, not a later pass.** Retrofitting Arabic into a finished English app
costs several times what building both from the start does, so these rules apply from the
first component.

- **No hardcoded user-facing strings.** Every string goes through `t()`. Add an ESLint rule
  for literal JSX text so this is caught automatically, not in review.
- **One namespace per feature** (`cases`, `entities`, `graph`), loaded lazily with the
  route. A single large translation file defeats code splitting.
- **Keys are structured, not sentences**: `cases.table.emptyState`, not
  `There are no cases`.
- **Use ICU plurals and interpolation** for anything with a count — Arabic has six plural
  forms, so `{count} cases` will not work by concatenation.
- **`dir` is set once on `<html>`** by the language provider. Components use logical CSS
  properties and **never check the language to pick a margin**.
- **Canvas containers stay `dir="ltr"`** — see `heavy-visual-modules.md`.
- **Dates, numbers and relative times go through `Intl`**, never a hand-written formatter.
  The case list shows dates in several formats; centralise them in `shared/lib/format.ts`.
- **Self-host the Arabic font** (IBM Plex Sans Arabic or Noto Sans Arabic) — an on-premise
  deployment cannot call Google Fonts.

Stack: i18next. Logical-property rules live in `styling.md`.
