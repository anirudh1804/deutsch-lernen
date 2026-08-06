import { useSettings } from '@/features/settings';
import { useAuth } from '@/features/auth';

export function Settings() {
  const { settings, updateSettings } = useSettings();
  const { user } = useAuth();

  const t = {
    de: {
      title: 'Einstellungen',
      language: 'Sprache',
      voice: 'Stimme',
      speed: 'Geschwindigkeit',
      autoPlay: 'Audio automatisch abspielen',
      showTranslation: 'Übersetzung anzeigen',
      theme: 'Design',
      light: 'Hell',
      dark: 'Dunkel',
      system: 'System',
      save: 'Speichern',
      saved: 'Gespeichert!',
      account: 'Konto',
      username: 'Benutzername',
      email: 'E-Mail',
    },
    en: {
      title: 'Settings',
      language: 'Language',
      voice: 'Voice',
      speed: 'Speed',
      autoPlay: 'Auto-play audio',
      showTranslation: 'Show translation',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      save: 'Save',
      saved: 'Saved!',
      account: 'Account',
      username: 'Username',
      email: 'Email',
    },
  }[settings.language];

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>

      <div className="card p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">{t.account}</h2>
        <div className="space-y-4">
          <div>
            <label className="label">{t.username}</label>
            <input
              type="text"
              className="input"
              value={user?.username || ''}
              readOnly
            />
          </div>
          <div>
            <label className="label">{t.email}</label>
            <input
              type="email"
              className="input"
              value={user?.email || ''}
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">{settings.language === 'de' ? 'Spiel & Audio' : 'Game & Audio'}</h2>
        
        <div>
          <label className="label">{t.language}</label>
          <select
            className="input"
            value={settings.language}
            onChange={(e) => updateSettings({ language: e.target.value as 'de' | 'en' })}
          >
            <option value="de">🇩🇪 Deutsch</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>

        <div>
          <label className="label">{t.voice}</label>
          <select className="input" value={settings.voice} onChange={(e) => updateSettings({ voice: e.target.value })}>
            <option value="de-DE-Neural2-A">Neural2-A (Female, Natural)</option>
            <option value="de-DE-Neural2-B">Neural2-B (Male, Natural)</option>
            <option value="de-DE-Wavenet-A">Wavenet-A (Female)</option>
            <option value="de-DE-Wavenet-B">Wavenet-B (Male)</option>
            <option value="de-DE-Standard-A">Standard-A (Female)</option>
            <option value="de-DE-Standard-B">Standard-B (Male)</option>
          </select>
        </div>

        <div>
          <label className="label">{t.speed}: {settings.speed}x</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={settings.speed}
            onChange={(e) => updateSettings({ speed: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none accent-primary-600"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="label mb-0">{t.autoPlay}</label>
          <input
            type="checkbox"
            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            checked={settings.autoPlayAudio}
            onChange={(e) => updateSettings({ autoPlayAudio: e.target.checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="label mb-0">{t.showTranslation}</label>
          <input
            type="checkbox"
            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            checked={settings.showTranslation}
            onChange={(e) => updateSettings({ showTranslation: e.target.checked })}
          />
        </div>
      </div>

      <div className="card p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">{t.theme}</h2>
        <div className="flex space-x-3">
          {[
            { value: 'light', label: t.light },
            { value: 'dark', label: t.dark },
            { value: 'system', label: t.system },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateSettings({ theme: value as 'light' | 'dark' | 'system' })}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                settings.theme === value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}