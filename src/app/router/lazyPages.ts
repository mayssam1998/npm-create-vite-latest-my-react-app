import { lazy } from 'react';

// Route chunk loaders — shared by the lazy route components below and the sidebar
// (prefetch on intent), so hovering a nav item warms exactly the chunk the route will load.
export const loadCaseManagementPage = () => import('@/features/cases/pages/CaseManagementPage');
export const loadComingSoonPage = () => import('./ComingSoonPage');

// Every route is lazy: no feature code is in the entry chunk.
export const CaseManagementPage = lazy(loadCaseManagementPage);
export const ComingSoonPage = lazy(loadComingSoonPage);
