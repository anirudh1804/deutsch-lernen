import { useSettings } from '@/features/settings';

export function LanguageToggle() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="relative" role="group" aria-label="Language selection">
      <button
        onClick={() => updateSettings({ language: settings.language === 'de' ? 'en' : 'de' })}
        className="btn-secondary text-sm px-3"
        aria-pressed={settings.language === 'de'}
      >
        {settings.language === 'de' ? '🇩🇪 DE' : '🇬🇧 EN'}
      </button>
    </div>
  );
}