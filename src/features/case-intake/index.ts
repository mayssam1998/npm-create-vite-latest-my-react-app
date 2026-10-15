// Public API of the case-intake feature — the ONLY import path for other features.
// Nothing outside needs it today. The route page and the "new draft" route action are
// wired by app/router through lazy imports, so they stay out of every other chunk.
export type { CaseDraft } from './model/caseDraft';
