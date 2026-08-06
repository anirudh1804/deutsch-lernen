import { useSettings } from '@/features/settings';
import { getTranslation, TranslationKeys } from './index';

export function useTranslation() {
  const { settings } = useSettings();
  
  const t = (key: string): string => {
    return getTranslation(settings.language, key);
  };
  
  // Helper to get nested object for complex translations
  const tObj = <T extends keyof TranslationKeys>(namespace: T): TranslationKeys[T] => {
    return translations[settings.language][namespace];
  };
  
  return { t, tObj, language: settings.language };
}

// Re-export for convenience
import { translations } from './index';
export { translations };