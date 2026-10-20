import './i18n/i18n';
import { applyAppearance, readStoredAppearance } from './providers/theme';

/** Everything that must happen before the first render. */
export async function bootstrap() {
  // Apply light/dark and the theme family before React renders, so neither ever flashes.
  applyAppearance(readStoredAppearance());

  // No backend yet: serve /api from the in-browser mock server. Dynamic import keeps the
  // mock data out of the entry chunk, and out of any build with VITE_USE_MOCKS unset.
  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    const { startMockServer } = await import('@/mocks/mockServer');
    startMockServer();
  }
}
