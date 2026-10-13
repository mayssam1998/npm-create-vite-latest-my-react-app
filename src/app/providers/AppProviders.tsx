import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Direction } from 'radix-ui';
import { useTranslation } from 'react-i18next';
import { queryClient } from '@/shared/lib/queryClient';
import { ThemeProvider } from './ThemeProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const { i18n } = useTranslation();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {/* Radix positions and keyboard-navigates overlays by this direction. */}
        <Direction.Provider dir={i18n.dir()}>{children}</Direction.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
