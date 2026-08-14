import { useState } from 'react';
import { useSettings } from '@/features/settings';
import { useAuth } from '@/features/auth';
import { useTTS } from '@/features/tts';
import { useUpdate } from '@/features/update';
import { Link } from 'react-router-dom';

export function Settings() {
  const { settings, updateSettings } = useSettings();
  const { user, isGuest, updateProfile } = useAuth();
  const { voices } = useTTS();
  const update = useUpdate();
  const [username, setUsername] = useState(user?.username || '');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

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
      usernamePlaceholder: 'Noch kein Benutzername festgelegt',
      usernameTaken: 'Benutzername bereits vergeben',
      account: 'Konto',
      username: 'Benutzername',
      email: 'E-Mail',
      autoVoice: 'Auto (System)',
      update: 'Update',
      updateTitle: 'App aktualisieren',
      updateSubtitle: 'Prüfe, ob eine neuere Version verfügbar ist.',
      currentVersion: 'Aktuelle Version',
      checkUpdates: 'Nach Updates suchen',
      checking: 'Suche nach Updates...',
      upToDate: 'Du bist auf dem neuesten Stand.',
      updateAvailable: 'Neue Version verfügbar:',
      installUpdate: 'Jetzt aktualisieren',
      updateReady: 'Aktualisierung wird angewendet...',
      downloadInstallers: 'Neuere Version auf GitHub ansehen',
      checkFailed: 'Update-Prüfung fehlgeschlagen.',
      noApk: 'Für diese Version ist keine APK verfügbar.',
      guestAccountTitle: 'Konto',
      guestAccountSubtitle: 'Du spielst als Gast. Melde dich an, um Benutzername, E-Mail und Fortschritt zu speichern.',
      login: 'Anmelden',
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
      usernamePlaceholder: 'No username set yet',
      usernameTaken: 'Username already taken',
      account: 'Account',
      username: 'Username',
      email: 'Email',
      autoVoice: 'Auto (System)',
      update: 'Update',
      updateTitle: 'App Update',
      updateSubtitle: 'Check whether a newer version is available.',
      currentVersion: 'Current version',
      checkUpdates: 'Check for updates',
      checking: 'Checking for updates...',
      upToDate: 'You are up to date.',
      updateAvailable: 'New version available:',
      installUpdate: 'Update now',
      updateReady: 'Applying update...',
      downloadInstallers: 'View newer version on GitHub',
      checkFailed: 'Update check failed.',
      noApk: 'No APK available for this release.',
      guestAccountTitle: 'Account',
      guestAccountSubtitle: 'You are playing as a guest. Log in to save your username, email, and progress.',
      login: 'Log in',
    },
  }[settings.language];

  const handleSaveUsername = async () => {
    const value = username.trim();
    if (!value) return;
    setUsernameStatus('saving');
    try {
      await updateProfile({ username: value });
      setUsernameStatus('saved');
      setTimeout(() => setUsernameStatus('idle'), 2000);
    } catch {
      setUsernameStatus('error');
      setTimeout(() => setUsernameStatus('idle'), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>

      <div className="card p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">{t.account}</h2>
        {isGuest ? (
          <div className="space-y-4">
            <p className="text-gray-600">{t.guestAccountSubtitle}</p>
            <Link to="/login" className="btn-primary inline-block">{t.login}</Link>
          </div>
        ) : (
        <div className="space-y-4">
          <div>
            <label className="label">{t.username}</label>
            <div className="flex space-x-2">
              <input
                type="text"
                className="input flex-1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.usernamePlaceholder}
                autoComplete="username"
                minLength={3}
                maxLength={20}
              />
              <button
                type="button"
                onClick={handleSaveUsername}
                className="btn-primary shrink-0"
                disabled={usernameStatus === 'saving' || username.trim().length < 3}
              >
                {usernameStatus === 'saving'
                  ? (settings.language === 'de' ? 'Speichern...' : 'Saving...')
                  : t.save}
              </button>
            </div>
            {usernameStatus === 'saved' && (
              <p className="text-sm text-green-600 mt-1">{t.saved}</p>
            )}
            {usernameStatus === 'error' && (
              <p className="text-sm text-red-600 mt-1">{t.usernameTaken}</p>
            )}
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
        )}
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
          <select
            className="input"
            value={voices.some(v => v.voiceURI === settings.voice) ? settings.voice : ''}
            onChange={(e) => updateSettings({ voice: e.target.value })}
          >
            <option value="">{t.autoVoice}</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.localService ? 'lokal' : 'online'})
              </option>
            ))}
          </select>
          {voices.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {settings.language === 'de'
                ? 'Keine deutschen Stimmen im Browser gefunden.'
                : 'No German voices found in your browser.'}
            </p>
          )}
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
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 dark:border-primary-400 text-primary-900 dark:text-primary-50'
                  : 'border-gray-200 hover:border-gray-300 text-gray-900 dark:text-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t.updateTitle}</h2>
            <p className="text-sm text-gray-500">{t.updateSubtitle}</p>
          </div>
          <span className="badge-info">{t.currentVersion}: {update.currentVersion}</span>
        </div>

        <button
          type="button"
          onClick={update.check}
          className="btn-secondary"
          disabled={update.status.state === 'checking'}
        >
          {update.status.state === 'checking' ? t.checking : t.checkUpdates}
        </button>

        {update.status.state === 'up-to-date' && (
          <p className="text-sm text-green-600">{t.upToDate}</p>
        )}

        {update.status.state === 'check-failed' && (
          <p className="text-sm text-red-600">{t.checkFailed} ({update.status.message})</p>
        )}

        {update.status.state === 'update-available' && (
          <div className="p-4 rounded-lg border border-primary-200 bg-primary-50">
            <p className="text-sm text-gray-800 mb-3">
              {t.updateAvailable} <span className="font-semibold text-primary-700">v{update.status.result.latestVersion}</span>
            </p>
            <button type="button" onClick={update.performUpdate} className="btn-primary w-full">
              {update.platform === 'web' ? t.installUpdate : t.downloadInstallers}
            </button>
          </div>
        )}

        {update.status.state === 'downloading' && (
          <p className="text-sm text-gray-600">{t.updateReady}</p>
        )}

        {update.status.state === 'update-ready' && (
          <p className="text-sm text-gray-600">{t.updateReady}</p>
        )}

        {update.status.state === 'error' && (
          <p className="text-sm text-red-600">{update.status.message}</p>
        )}
      </div>
    </div>
  );
}