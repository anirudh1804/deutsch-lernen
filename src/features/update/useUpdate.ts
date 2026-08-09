import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import type { UpdateAsset, UpdateCheckResult, UpdatePlatform } from './types';
import { APP_VERSION, checkForUpdate, fetchLatestRelease } from './updateService';

/** Detects the current runtime platform. */
export function detectPlatform(): UpdatePlatform {
  if (Capacitor.isNativePlatform()) return 'android';
  // Tauri exposes its internals on the window object.
  if ('__TAURI_INTERNALS__' in window) return 'desktop';
  return 'web';
}

export type UpdateStatus =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'check-failed'; message: string }
  | { state: 'up-to-date'; result: UpdateCheckResult }
  | { state: 'update-available'; result: UpdateCheckResult }
  | { state: 'downloading'; asset?: UpdateAsset }
  | { state: 'update-ready'; result: UpdateCheckResult }
  | { state: 'error'; message: string };

export interface UseUpdate {
  platform: UpdatePlatform;
  currentVersion: string;
  status: UpdateStatus;
  latestReleaseUrl: string | null;
  assets: UpdateAsset[];
  check: () => Promise<void>;
  performUpdate: () => void;
}

/**
 * Cross-platform update hook.
 * - web:     a newer build is deployed -> reload to pick up the new PWA.
 * - desktop: opens the latest GitHub release page to download the new installer.
 * - android: downloads + opens the latest APK asset.
 */
export function useUpdate(): UseUpdate {
  const platform = detectPlatform();
  const [status, setStatus] = useState<UpdateStatus>({ state: 'idle' });
  const [latestReleaseUrl, setLatestReleaseUrl] = useState<string | null>(null);
  const [assets, setAssets] = useState<UpdateAsset[]>([]);

  const check = useCallback(async () => {
    setStatus({ state: 'checking' });
    const result = await checkForUpdate();
    if (result.error) {
      setStatus({ state: 'check-failed', message: result.error });
      return;
    }
    if (result.hasUpdate) {
      try {
        const release = await fetchLatestRelease();
        setLatestReleaseUrl(release.html_url);
        setAssets(release.assets);
      } catch {
        setLatestReleaseUrl(null);
        setAssets([]);
      }
      setStatus({ state: 'update-available', result });
    } else {
      setLatestReleaseUrl(null);
      setAssets([]);
      setStatus({ state: 'up-to-date', result });
    }
  }, []);

  const performUpdate = useCallback(() => {
    if (platform === 'web') {
      // A newer build is deployed; reload to pick up the new service worker.
      setStatus({ state: 'update-ready', result: status.state === 'update-available' ? status.result : { currentVersion: APP_VERSION, latestVersion: null, hasUpdate: true, error: null } });
      navigator.serviceWorker?.getRegistration().then(reg => {
        reg?.update().then(() => window.location.reload()).catch(() => window.location.reload());
      }).catch(() => window.location.reload());
      return;
    }

    if (platform === 'android') {
      const apk = assets.find(a => a.name.toLowerCase().endsWith('.apk')) || assets[0];
      setStatus({ state: 'downloading', asset: apk });
      if (apk) {
        window.location.href = apk.url;
      } else {
        setStatus({ state: 'error', message: 'No APK asset available for this release.' });
      }
      return;
    }

    // desktop: open the latest release page to grab the installer.
    if (latestReleaseUrl) {
      window.open(latestReleaseUrl, '_blank');
    }
  }, [platform, assets, latestReleaseUrl, status]);

  useEffect(() => {
    // Automatically check once on mount.
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { platform, currentVersion: APP_VERSION, status, latestReleaseUrl, assets, check, performUpdate };
}
