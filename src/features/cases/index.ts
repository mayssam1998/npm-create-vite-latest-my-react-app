// Public API of the cases feature — the ONLY import path for other features.
// Kept deliberately small: export only what another feature needs today.
// The route page is NOT exported here; app/router lazy-loads it directly so it stays
// out of every chunk that imports this file.
export type { Case, CasePriority, CaseStatus } from './model/case';
