---
name: build-form
description: Build a form with react-hook-form, a Zod schema and the shared field components. Use for any create page, edit page, validation work, draft saving, or a form with a save/discard/submit action. Produces the schema, inferred types, field layout, mutation wiring, dirty guard and save-as-draft behaviour.
---

# Build a form

> Written from the architecture document before the first real form existed. Replace the
> example with the Create Case form once it is built.

Rules: `.claude/rules/forms.md`. **Never `useState` per field.**

## Steps

1. **Schema first** in `features/<domain>/model/<name>Schema.ts`. Derive the type with
   `z.infer`. This one schema is the contract for client validation *and* response parsing.
2. **Form hook** — `useForm` with `zodResolver(schema)` and `defaultValues`. If the form
   edits server data, seed `defaultValues` from the query; **do not** mirror the entity
   into `useState`.
3. **Layout** — compose `shared/ui/form` field components only. Never call `register()`
   by hand in a feature.
4. **Submit** — one mutation per action. Disable the button while pending and show pending
   state on the button itself.
5. **Server errors** — map field errors back with `setError` so each message lands under
   its input.
6. **Dirty guard** — `useUnsavedChangesGuard(formState.isDirty)`.
7. **Draft** — if the form has a "Save as draft" action, validate with `schema.partial()`
   and autosave on a debounce. Never autosave a final submit.
8. **Check** — translated labels, RTL, keyboard order, loading/empty/error states.

## Template

```tsx
// features/cases/model/createCaseSchema.ts
export const createCaseSchema = z.object({
  title: z.string().min(1, 'cases.form.titleRequired'),
  priority: z.enum(['urgent', 'high', 'normal', 'low']),
  sectionId: z.string().min(1),
  tags: z.array(z.string()).default([]),
});
export type CreateCaseInput = z.infer<typeof createCaseSchema>;
```

```tsx
// features/cases/components/create-case/CreateCaseForm.tsx
interface CreateCaseFormProps {
  defaultValues?: Partial<CreateCaseInput>;
  onCreated: (caseId: string) => void;
}

export function CreateCaseForm({ defaultValues, onCreated }: CreateCaseFormProps) {
  const { t } = useTranslation('cases');
  const createCase = useCreateCase();
  const form = useForm<CreateCaseInput>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: { tags: [], ...defaultValues },
  });

  useUnsavedChangesGuard(form.formState.isDirty);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const created = await createCase.mutateAsync(values);
      form.reset();           // reset, do not remount
      onCreated(created.id);
    } catch (error) {
      applyServerFieldErrors(error, form.setError); // shared/lib helper
    }
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField name="title" label={t('form.title')} required />
        <SelectField name="priority" label={t('form.priority')} options={PRIORITY_OPTIONS} />
        <SelectField name="sectionId" label={t('form.section')} options={sectionOptions} />
        <TagsField name="tags" label={t('form.tags')} />

        <div className="flex gap-2">
          <Button type="submit" isPending={createCase.isPending}>
            {t('form.createCase')}
          </Button>
          <Button type="button" variant="secondary" onClick={handleSaveDraft}>
            {t('form.saveAsDraft')}
          </Button>
          <Button type="button" variant="ghost" onClick={handleDiscard}>
            {t('form.discard')}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
```

> `applyServerFieldErrors` is the one place that translates a server error body into
> `setError` calls. It does not exist yet — build it in `shared/lib` with the first form.

## The three save actions

| Button | Behaviour |
|---|---|
| Create case | Full validation → mutation → invalidate `caseKeys.all` → navigate → success toast |
| Save as draft | `schema.partial()` → draft store + server → stay on the page |
| Discard | Confirm if dirty (`useConfirm()`) → clear the draft → close the tab |

## Do not

- Use `useState` for a field value, or mirror a fetched entity into state to edit it.
- Unmount a collapsed section that holds entered data — hide it with CSS, keep it mounted.
- Remount the form to clear it. Use `reset()`.
- Wire `register()` directly in a feature component.
- Autosave a final submit.

Shared field components to build first: `TextField`, `SelectField`, `DateField`,
`TagsField`, `TextareaField`, `FileField` in `shared/ui/form/`.
