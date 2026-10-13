import i18n, { type BackendModule } from 'i18next';
import { initReactI18next } from 'react-i18next';

export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const DEFAULT_LANGUAGE: Language = 'en';
const LANGUAGE_STORAGE_KEY = 'insightx.language';

// One JSON file per language per namespace. Vite turns each into its own chunk, so a
// feature's namespace is fetched only when that feature calls useTranslation('<ns>').
const localeLoaders = import.meta.glob<{ default: Record<string, unknown> }>('../../locales/*/*.json');

const lazyLocaleBackend: BackendModule = {
  type: 'backend',
  init() {},
  read(language, namespace, callback) {
    const load = localeLoaders[`../../locales/${language}/${namespace}.json`];
    if (!load) {
      callback(new Error(`Missing translations: ${language}/${namespace}`), false);
      return;
    }
    load().then(
      (module) => callback(null, module.default),
      (error: unknown) => callback(error instanceof Error ? error : new Error(String(error)), false),
    );
  },
};

function isSupportedLanguage(value: string | null): value is Language {
  return SUPPORTED_LANGUAGES.some((language) => language === value);
}

function readStoredLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isSupportedLanguage(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE; // storage can be blocked; fall back silently
  }
}

/** `dir` is set once, on <html>. Components use logical CSS and never check the language. */
function applyDocumentLanguage(language: string) {
  document.documentElement.lang = language;
  document.documentElement.dir = i18n.dir(language);
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // storage can be blocked; the choice just won't survive a reload
  }
}

i18n.on('languageChanged', applyDocumentLanguage);

void i18n
  .use(lazyLocaleBackend)
  .use(initReactI18next)
  .init({
    lng: readStoredLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false }, // React already escapes
    react: { useSuspense: true },
  });

export { i18n };
