import de from './de.json';
import en from './en.json';

export type Language = 'de' | 'en';
export type TranslationKeys = typeof de;

export const translations: Record<Language, TranslationKeys> = {
  de,
  en,
};

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.');
  let value: unknown = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // Fallback to key if not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}