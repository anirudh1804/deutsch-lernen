export type UpdatePlatform = 'web' | 'desktop' | 'android';

export interface UpdateCheckResult {
  /** Version currently installed / running. */
  currentVersion: string;
  /** Latest version published on GitHub. Null if no release found or check failed. */
  latestVersion: string | null;
  /** True when latestVersion exists and is newer than currentVersion. */
  hasUpdate: boolean;
  /** Human-readable error if the check failed. */
  error: string | null;
}

export interface UpdateAsset {
  /** Display name of the asset. */
  name: string;
  /** Direct download URL. */
  url: string;
  /** File size in bytes. */
  size: number;
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  assets: UpdateAsset[];
}
