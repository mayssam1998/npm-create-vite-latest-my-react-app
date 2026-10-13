import { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { AppShell } from '../layout/AppShell';
import { CaseManagementPage, ComingSoonPage } from './lazyPages';
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
        path: 'cases',
        handle: { titleKey: 'nav.caseManagement' } satisfies RouteHandle,
        errorElement: <RouteErrorState />,
        element: (
          <Suspense fallback={<RouteSkeleton />}>
            <CaseManagementPage />
          </Suspense>
        ),
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
