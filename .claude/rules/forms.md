# Forms and save actions

**Stack: react-hook-form + Zod + `@hookform/resolvers`. Never `useState` per field.** The
Create Case form has roughly fifteen fields; fifteen `useState` calls means fifteen
re-renders of the whole form on every keystroke. react-hook-form keeps inputs uncontrolled
and re-renders only what changed.

**The schema is the contract.** Write the Zod schema once in `model/`, derive the
TypeScript type from it with `z.infer`, and reuse it for both client validation and
response parsing. One source of truth for shape and rules.

**Field components.** Build a small set in `shared/ui/form/`: `TextField`, `SelectField`,
`DateField`, `TagsField`, `TextareaField`, `FileField`. Each wraps a Radix primitive and
handles label, required marker, error text, description and RTL. **Features never wire
`register()` by hand.**

## Save actions

| Button | Behaviour |
|---|---|
| Create case | Full validation → mutation → invalidate `caseKeys.all` → navigate to the case → success toast |
| Save as draft | Partial validation only (`schema.partial()`) → save to draft store and server → stay on the page |
| Discard | Confirm if dirty → clear the draft → close the tab |

## Rules

- Disable submit while the mutation is pending, and show the pending state on the button
  itself.
- Map server field errors back onto the form with `setError`, so the message appears under
  the right input.
- Autosave drafts on a debounce; **never autosave a final submit**.
- Block navigation when the form is dirty, using the one shared `useUnsavedChangesGuard`.
- Reset the form with `reset()` after a successful create, not by remounting — unless you
  want a fresh tab.
- Large or optional sections go in collapsible groups, but **never unmount a section with
  entered data**, or its values are lost. Hide with CSS, keep it mounted.

Recipe: the `build-form` skill. Multi-draft behaviour: the `multi-tab-workspace` skill.
