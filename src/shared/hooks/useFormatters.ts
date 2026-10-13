import { useTranslation } from 'react-i18next';
import { formatDate, formatNumber } from '@/shared/lib/format';

/** The Intl formatters from shared/lib/format, bound to the active language. */
export function useFormatters() {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;

  return {
    locale,
    formatDate: (isoDate: string) => formatDate(isoDate, locale),
    formatNumber: (value: number) => formatNumber(value, locale),
  };
}
