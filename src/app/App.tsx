import { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { AppProviders } from './providers/AppProviders';
import { router } from './router/router';

/** Shown only while the `common` translations load on first paint — deliberately text-free. */
function AppSkeleton() {
  return <div aria-hidden className="h-dvh bg-surface" />;
}

export function App() {
  return (
    <Suspense fallback={<AppSkeleton />}>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </Suspense>
  );
}
