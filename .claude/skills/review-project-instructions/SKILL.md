---
name: review-project-instructions
description: Review a finished feature against CLAUDE.md, .claude/rules/ and .claude/skills/ and report which project instructions need updating. Use after completing a feature or a significant change, when asked whether the rules or docs are still accurate, or when a convention seems to have drifted from what is written down. Reports proposed changes only — it never edits the instruction files itself.
---

# Review the project instructions after a change

Run this after a feature lands. The point is to keep `CLAUDE.md`, `.claude/rules/` and
`.claude/skills/` describing what the codebase actually does — the instructions are only
worth loading if they are true.

**Report first, edit never.** Produce the proposed changes and wait. Do not modify
`CLAUDE.md`, any rule file, or any skill as part of this review, even when a change is
obviously right.

## Steps

1. **Read the change.** `git diff` the feature (or the named range). Note what is new: a
   pattern, a folder, a library, a decision that was made in code without being written
   down anywhere.
2. **Inspect, in this order:** `CLAUDE.md` → the rule files in `.claude/rules/` that the
   change touches → the skills in `.claude/skills/` whose workflow the change exercised →
   any other affected project docs (`README.md`, `.claude/rules/open-questions.md`).
3. **Look for the four things** in the table below.
4. **Report** in the format below. If nothing needs changing, **say so explicitly** — that
   is a valid and common outcome, not a failure to find something.

## What to look for

| # | Look for | Typical target |
|---|---|---|
| 1 | A new architectural decision or convention that is now load-bearing but written nowhere | the matching `.claude/rules/` file; `CLAUDE.md` only if it applies to *every* file |
| 2 | An instruction that is now outdated, wrong, duplicated, or describes something that no longer exists | wherever it currently lives |
| 3 | A skill whose workflow the feature changed — steps that no longer match, or a template that drifted from the real code | that skill's `SKILL.md` |
| 4 | A reusable workflow that got invented during the feature and will be repeated | a new skill |

## Three checks specific to this repo

- **Theory → real code.** Every skill carries a note saying its example was written before
  the first real instance existed. If this feature *was* that first instance, the single
  highest-value change is replacing the skill's invented example with the real file —
  `CaseTable.tsx` for `add-data-table`, the real `useCaseFilters` for `add-table-filters`,
  and so on. Flag it and name the file.
- **Resolved open questions.** If the feature settled something listed in
  `.claude/rules/open-questions.md` — the router, the graph library, fetch vs axios, the
  dark-mode selector — propose moving it *out* of that file and into the rule it belongs
  to. A decision left in `open-questions.md` after it has been made is worse than one that
  was never recorded.
- **The twice rule.** If the same correction came up twice during the feature, that is the
  signal: it belongs in `CLAUDE.md` or a skill. Say which, and why that one.

## Report format

For each proposed change:

```
TARGET   .claude/rules/api-layer.md
CHANGE   Add: responses are parsed with Zod at the boundary in every list endpoint, not
         just complex ones.
WHY      CaseList and EntityList both do it; the rule currently says "for anything
         complex", which reads as optional and is not what the code does.
```

End with anything you deliberately did **not** propose and why — that is often the more
useful half of the review.

## Do not

- Edit any instruction file. Report, then wait.
- Propose a rule change because a feature implemented something differently. A valid rule
  that the code violates is a **code** finding, not a docs finding — say which one it is.
- Document what the code already makes obvious. If a reader would learn it in ten seconds
  from the file itself, it does not go in an instruction file.
- Restate an existing rule in a second location. One rule, one home — the only intentional
  duplication is the definition-of-done checklist.
- Add to `CLAUDE.md` what belongs in a rule file. It is a one-page budget, and every line
  added makes the others less likely to be followed.
- Propose a new skill for something done once. Skills are for repetition.
