import type { GitHubRelease, UpdateCheckResult } from './types';

export const GITHUB_REPO = 'anirudh1804/deutsch-lernen';
export const LATEST_RELEASE_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

/** The version this build was compiled from (injected by Vite from package.json). */
export const APP_VERSION: string = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';

/**
 * Compares two semver strings (e.g. "1.2.3") and returns:
 *  1 if a > b, -1 if a < b, 0 if equal.
 * Handles "v" prefixes and ignores pre-release/build metadata.
 */
export function compareVersions(a: string, b: string): number {
  const parse = (v: string) =>
    v
      .replace(/^v/i, '')
      .split('-')[0]
      .split('+')[0]
      .split('.')
      .map(n => parseInt(n, 10) || 0);

  const pa = parse(a);
  const pb = parse(b);
  const len = Math.max(pa.length, pb.length);

  for (let i = 0; i < len; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

/** Fetches the latest GitHub release for the repo. Throws on network/API errors. */
export async function fetchLatestRelease(): Promise<GitHubRelease> {
  const res = await fetch(LATEST_RELEASE_URL, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) {
    throw new Error(`GitHub API responded with ${res.status}`);
  }
  const data = await res.json();
  return {
    tag_name: data.tag_name,
    name: data.name,
    published_at: data.published_at,
    html_url: data.html_url,
    assets: (data.assets || []).map((a: { name: string; browser_download_url: string; size: number }) => ({
      name: a.name,
      url: a.browser_download_url,
      size: a.size,
    })),
  };
}

/** Checks for an update and normalises the result. Never throws. */
export async function checkForUpdate(): Promise<UpdateCheckResult> {
  try {
    const release = await fetchLatestRelease();
    const latest = (release.tag_name || '').replace(/^v/i, '');
    const current = APP_VERSION;
    const hasUpdate = latest !== '' && compareVersions(latest, current) > 0;
    return {
      currentVersion: current,
      latestVersion: latest || null,
      hasUpdate,
      error: null,
    };
  } catch (e) {
    return {
      currentVersion: APP_VERSION,
      latestVersion: null,
      hasUpdate: false,
      error: (e as Error).message || 'Update check failed',
    };
  }
}
