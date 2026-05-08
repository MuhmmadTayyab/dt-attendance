import {
  CURRENT_VERSION,
  GITHUB_DOWNLOAD_PAGE_URL,
  GITHUB_LATEST_RELEASE_API_URL,
} from '../config/appVersion';

function versionParts(version) {
  return String(version || '')
    .replace(/^v/i, '')
    .split(/[.-]/)
    .map((part) => {
      const match = part.match(/\d+/);
      return match ? Number(match[0]) : 0;
    });
}

export function isNewerVersion(latestVersion, currentVersion = CURRENT_VERSION) {
  const latest = versionParts(latestVersion);
  const current = versionParts(currentVersion);
  const length = Math.max(latest.length, current.length);

  for (let index = 0; index < length; index += 1) {
    const next = latest[index] || 0;
    const active = current[index] || 0;
    if (next > active) return true;
    if (next < active) return false;
  }

  return false;
}

export async function checkForAppUpdate() {
  const response = await fetch(GITHUB_LATEST_RELEASE_API_URL, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    return {
      updateAvailable: false,
      currentVersion: CURRENT_VERSION,
      downloadUrl: GITHUB_DOWNLOAD_PAGE_URL,
    };
  }

  const release = await response.json();
  const latestVersion = release.tag_name || release.name || '';

  return {
    updateAvailable: isNewerVersion(latestVersion),
    currentVersion: CURRENT_VERSION,
    latestVersion,
    latestVersionName: release.name || latestVersion,
    downloadUrl: release.html_url || GITHUB_DOWNLOAD_PAGE_URL,
  };
}
