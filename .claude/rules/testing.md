# Testing and definition of done

Be selective. Testing everything in an app this size is not affordable; testing nothing is
worse.

| Layer | Tool | What to cover |
|---|---|---|
| Pure logic, schemas, formatters, reducers | Vitest | Everything. Cheap and high value. |
| Custom hooks | Vitest + Testing Library | Hooks with real logic — filters, drafts, guards |
| Components | Testing Library | Shared `ui` components and complex forms only |
| Critical flows | Playwright | Create case, filter and find a case, open a case, switch language |
| Graph and map | Smoke only | That it mounts, renders a canvas, and destroys cleanly. Do not assert pixels. |

## Static gates in CI — these catch more than the tests do

- TypeScript **strict**, no `any`, no `@ts-ignore` without a comment.
- ESLint, including rules-of-hooks, the boundary rules, and the no-literal-JSX-text rule.
- The bundle budgets in `performance.md`.

> Not yet configured: the literal-string ESLint rule, the bundle budgets, and a CI pipeline
> to run them. The boundary rules are in `eslint.config.js` (see `architecture.md`).

## Definition of done for a feature task

1. Types strict, no `any`
2. Loading, empty and error states all exist
3. Keyboard accessible, focus visible
4. Works in Arabic/RTL and in dark mode
5. No new library added without a note saying why
6. Lists over 100 rows virtualised
7. Strings translated

This checklist is duplicated in `CLAUDE.md` on purpose — it is the one thing that must be
in context for every task.
