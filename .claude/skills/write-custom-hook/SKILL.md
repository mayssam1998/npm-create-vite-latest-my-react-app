---
name: write-custom-hook
description: Decide whether to extract a custom hook, where it belongs, and write it. Use when extracting logic from a component, sharing stateful logic between components, or adding a hook to shared/hooks or a feature's hooks folder. Produces the placement decision, naming, object return shape and a template.
---

# Write a custom hook

> Written from the architecture document before the first hook existed. Replace the example
> once `useUnsavedChangesGuard` or `useCaseFilters` is built.

Rules: `.claude/rules/hooks.md`.

## Step 1 — should this be a hook at all?

**Yes** if the same stateful logic appears in two places, or a single component has more
than roughly 30 lines of logic above its `return`.

**No** if it is called once and contains no state — that is a plain function, and it belongs
in `model/` (domain logic) or `shared/lib/` (generic). Wrapping a pure function in `use…`
buys nothing and costs a lint rule.

## Step 2 — check `shared/hooks` first

These are planned and should exist before features invent their own:
`useDebounce` · `useDebouncedValue` · `useUrlState` · `useDisclosure` ·
`useUnsavedChangesGuard` · `useMediaQuery` · `usePermission` · `useKeyboardShortcut` ·
`useConfirm`.

If what you need is a near-match, extend the shared hook rather than writing a sibling.

## Step 3 — place it

| Scope | Location |
|---|---|
| One feature | `features/<domain>/hooks/useX.ts` |
| Two or more features | `shared/hooks/useX.ts` |
| Wraps a server call | `features/<domain>/api/*.queries.ts` — **not** `hooks/` |

A hook that two features need **moves** to `shared/`. Never import sideways between
features to avoid the move.

## Step 4 — write it

```ts
// shared/hooks/useDisclosure.ts
interface UseDisclosureOptions {
  defaultOpen?: boolean;
}

export function useDisclosure({ defaultOpen = false }: UseDisclosureOptions = {}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);  // updater form

  // object, not a tuple — more than two values
  return { isOpen, open, close, toggle };
}
```

## Conventions

- **Name**: `useX`, camelCase file matching the hook (`useCaseFilters.ts`).
- **Return an object**, not an array, as soon as there are more than two values.
  `const { cases, isLoading, refetch } = useCases()` survives refactoring;
  `const [a, b, c, d] = useCases()` does not.
- **Options as a single object** with defaults, so adding one later is not a breaking change.
- **Updater form** for any state update that depends on the previous value.
- **`useEffect` only for the legitimate cases** — external subscriptions, listeners,
  observers, imperative libraries — and always with a cleanup. Everything else has a better
  answer; see `CLAUDE.md`.
- The React Compiler is on, so `useCallback` here is optional — keep it only when the value
  crosses into a non-React library, an effect dependency, or a context value.

## Do not

- Create a hook for a one-off pure function.
- Put a `useQuery` wrapper in `hooks/` instead of `api/`.
- Return a long tuple.
- Duplicate something in `shared/hooks` inside a feature.
- Reach for `useEffect` to derive a value — compute it during render.
