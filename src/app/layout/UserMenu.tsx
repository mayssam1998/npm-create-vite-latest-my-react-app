import { CircleUser } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { THEME_FAMILIES, useTheme, type ThemeFamily } from '@/shared/hooks/useTheme';
import { Button } from '@/shared/ui/Button';
import { Menu, type MenuSection } from '@/shared/ui/Menu';

/** Every family needs a label, so adding one to THEME_FAMILIES fails the typecheck until it has one. */
const FAMILY_LABEL_KEY: Record<ThemeFamily, string> = {
  default: 'theme.familyDefault',
  analyst: 'theme.familyAnalyst',
};

function isThemeFamily(value: string): value is ThemeFamily {
  return (THEME_FAMILIES as readonly string[]).includes(value);
}

/**
 * The account menu at the end of the header: theme family, light/dark and language.
 * No auth exists yet (open-questions.md), so there is no user name or Sign out item.
 */
export function UserMenu() {
  const { t, i18n } = useTranslation('common');
  const { theme, toggleTheme, family, setFamily } = useTheme();
  const isArabic = i18n.resolvedLanguage === 'ar';

  function handleFamilyChange(value: string) {
    if (isThemeFamily(value)) setFamily(value);
  }

  function handleLanguageToggle() {
    void i18n.changeLanguage(isArabic ? 'en' : 'ar');
  }

  const sections: MenuSection[] = [
    {
      type: 'radio',
      id: 'family',
      label: t('theme.family'),
      value: family,
      options: THEME_FAMILIES.map((name) => ({ value: name, label: t(FAMILY_LABEL_KEY[name]) })),
      onValueChange: handleFamilyChange,
    },
    {
      type: 'actions',
      id: 'preferences',
      items: [
        { id: 'theme', label: theme === 'dark' ? t('theme.light') : t('theme.dark'), onSelect: toggleTheme },
        {
          id: 'language',
          label: t('language.switchTo'),
          lang: isArabic ? 'en' : 'ar',
          onSelect: handleLanguageToggle,
        },
      ],
    },
  ];

  return (
    <Menu
      sections={sections}
      trigger={
        <Button variant="ghost" size="icon" aria-label={t('header.userMenu')}>
          <CircleUser aria-hidden />
        </Button>
      }
    />
  );
}
