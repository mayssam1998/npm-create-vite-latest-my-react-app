---
name: design-system-component
description: Add or change a component in shared/ui — badge, button, chip, input, card, status pill or any shared primitive. Use when building a design-system component, defining variants, or working with design tokens. Produces the cva variant map, token-only colours, cn() class merging, RTL logical properties and dark mode.
---

# Add a design-system component

> Written from the architecture document before `shared/ui` existed. Replace the example
> with the real `Badge.tsx` once it is built.

Rules: `.claude/rules/styling.md`. Tailwind v4 only — no CSS Modules, no CSS-in-JS.

## Steps

1. **Tokens first.** If the component needs a colour that is not already a CSS variable in
   `@theme`, add the token. **Never write a raw colour or an arbitrary value in a
   component.**
2. **Variants with `cva`** — one declaration, every combination. No conditionals building
   class strings.
3. **Compose with `cn()`** (clsx + tailwind-merge) so a caller's `className` can override
   cleanly.
4. **Logical properties only** — `ms-` `me-` `ps-` `pe-` `start-` `end-`. Never `ml-`,
   `mr-`, `pl-`, `pr-`, `left-`, `right-`.
5. **Semantic mapping lives beside the component**, as a function — not as a ternary in
   JSX at the call site.
6. **Check** — dark mode, RTL, keyboard focus ring, `forwardRef` if it wraps a DOM element,
   prop spreading allowed here (and only here).

## Template

```tsx
// shared/ui/Badge.tsx
const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-muted text-content-muted',
        pending: 'bg-status-pending/15 text-status-pending',
        urgent:  'bg-priority-urgent/15 text-priority-urgent',
      },
      size: { sm: 'text-xs', md: 'text-sm px-2.5 py-1' },
    },
    defaultVariants: { tone: 'neutral', size: 'sm' },
  },
);

interface BadgeProps
  extends ComponentPropsWithoutRef<'span'>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ tone, size, className, ...props }: BadgeProps) {
  // spreading unknown props onto a DOM element is allowed in shared/ui, nowhere else
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}
```

```ts
// shared/ui/badgeTone.ts — mapping function, never a ternary in JSX
const PRIORITY_TONE: Record<CasePriority, BadgeTone> = {
  urgent: 'urgent',
  high: 'urgent',
  normal: 'neutral',
  low: 'neutral',
};

export function getPriorityTone(priority: CasePriority): BadgeTone {
  return PRIORITY_TONE[priority];
}
```

```css
/* src/index.css */
@theme {
  --color-surface: oklch(98% 0.01 90);
  --color-status-pending: oklch(70% 0.14 70);
  --color-priority-urgent: oklch(58% 0.19 25);
}
```

## Do not

- Write `text-[#2A5C3F]` or `w-[437px]` outside a throwaway prototype. If a value is needed
  twice, it is a token.
- Build a class string with a template literal and ternaries. Use `cva` and `cn()`.
- Branch on priority or status inside JSX. Use a mapping function.
- Use `ml-`/`mr-`/`left-`/`right-`.
- Check the current language to pick a margin — logical properties handle it.
- Restyle a `shared/ui` component from a feature. Features **compose**; if a variant is
  missing, add the variant here.

The full palette has not been extracted from the design files yet — see
`.claude/rules/open-questions.md`. The three tokens above are the document's examples.
