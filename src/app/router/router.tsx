import { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { AppShell } from '../layout/AppShell';
import { CaseIntakePage, CaseManagementPage, ComingSoonPage } from './lazyPages';
import { newCaseDraftAction } from './routeActions';
import { RouteErrorState } from './RouteErrorState';
import type { RouteHandle } from './routeHandle';
import { RouteSkeleton } from './RouteSkeleton';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <RouteErrorState />,
    children: [
      { index: true, element: <Navigate to="/cases" replace /> },
      {
        // The parent carries the "Case Management" breadcrumb for every page beneath it.
        path: 'cases',
        handle: { titleKey: 'nav.caseManagement' } satisfies RouteHandle,
        errorElement: <RouteErrorState />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<RouteSkeleton />}>
                <CaseManagementPage />
              </Suspense>
            ),
          },
          {
            path: 'intake',
            handle: { titleKey: 'nav.caseIntakeReview' } satisfies RouteHandle,
            action: newCaseDraftAction,
            errorElement: <RouteErrorState />,
            element: (
              <Suspense fallback={<RouteSkeleton />}>
                <CaseIntakePage />
              </Suspense>
            ),
          },
        ],
      },
      {
        // Modules not built yet share one placeholder route.
        path: '*',
        handle: { titleKey: 'nav.notBuilt' } satisfies RouteHandle,
        errorElement: <RouteErrorState />,
        element: (
          <Suspense fallback={<RouteSkeleton />}>
            <ComingSoonPage />
          </Suspense>
        ),
      },
    ],
  },
]);
