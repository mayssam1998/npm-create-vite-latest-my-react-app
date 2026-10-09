# Custom hooks and React features

## When to extract a hook

Extract when the same stateful logic appears in two places, or when a single component has
more than roughly 30 lines of logic above its `return`.

**Do not** extract a hook that is called once and contains no state — that is just a
function, and it belongs in `model/` or `lib/`.

## Where it goes

- Used by one feature → `features/<domain>/hooks/`
- Used by two or more features → `shared/hooks/`
- Wraps a server call → `features/<domain>/api/` as a query hook, **not** in `hooks/`

## Return shape

Return an **object**, not an array, as soon as there are more than two values.
`const { cases, isLoading, refetch } = useCases()` survives refactoring;
`const [a, b, c, d] = useCases()` does not.

## Build these in `shared/hooks/` early, before features invent their own

`useDebounce` · `useDebouncedValue` · `useUrlState` · `useDisclosure`
(open/close/toggle for dialogs) · `useUnsavedChangesGuard` · `useMediaQuery` ·
`usePermission` · `useKeyboardShortcut`

Also shared, from other sections: `useConfirm()` — promise-returning, see `overlays.md`.

## React features worth standardising

| Feature | Use it for |
|---|---|
| `useId` | Linking a label to an input in shared form components |
| `useTransition` | Keeping the table interactive while a heavy filter re-render happens |
| `useDeferredValue` | Typing in a search box that filters a large client-side list |
| `useSyncExternalStore` | Reading from a non-React source — rarely needed, Zustand uses it internally |
| `useRef` | Holding Sigma / MapLibre instances, and any value that must not trigger a render |
| `useImperativeHandle` | Exposing `fitToView()` or `reset()` from a map or graph component |
| Error boundaries | One per route, one around each heavy visualisation |
| `<Suspense>` | Route-level lazy loading and skeleton states |

Recipe: the `write-custom-hook` skill.
