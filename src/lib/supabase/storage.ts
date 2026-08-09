import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import type { SupportedStorage } from '@supabase/supabase-js';

/**
 * A Supabase storage adapter that persists the auth session in native
 * Capacitor Preferences on mobile (Android/iOS), falling back to
 * localStorage on web/desktop.
 *
 * The default `persistSession` uses `localStorage`, which the Capacitor
 * Android WebView does not reliably persist across app restarts, causing
 * users to be logged out. Native Preferences survive restarts.
 */
export const capacitorStorage: SupportedStorage = {
  getItem: (key: string) => {
    if (Capacitor.isNativePlatform()) {
      return Preferences.get({ key }).then(r => r.value);
    }
    return Promise.resolve(localStorage.getItem(key));
  },
  setItem: (key: string, value: string) => {
    if (Capacitor.isNativePlatform()) {
      return Preferences.set({ key, value }).then(() => undefined);
    }
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    if (Capacitor.isNativePlatform()) {
      return Preferences.remove({ key }).then(() => undefined);
    }
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};
