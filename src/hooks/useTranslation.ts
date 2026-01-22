import { useSettings } from '../context/SettingsContext';
import { translations, Translations, Language } from '../i18n/translations';

export function useTranslation(): { t: Translations; language: Language } {
  const { settings } = useSettings();
  const language = settings?.language || 'en';
  return { t: translations[language], language };
}
