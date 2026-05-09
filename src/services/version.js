import {
  CURRENT_VERSION,
  GITHUB_DOWNLOAD_PAGE_URL,
  GITHUB_LATEST_RELEASE_API_URL,
  SERVER_VERSION_CHECK_URL,
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

function pickFirst(source, keys) {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null && String(source[key]).trim()) {
      return source[key];
    }
  }
  return '';
}

function normalizeVersionPayload(payload, fallbackDownloadUrl = GITHUB_DOWNLOAD_PAGE_URL) {
  const source = Array.isArray(payload) ? payload[0] : payload;
  if (!source || typeof source !== 'object') return null;

  const latestVersion = pickFirst(source, [
    'latest_version',
    'latestVersion',
    'version',
    'app_version',
    'appVersion',
    'tag_name',
    'tagName',
  ]);

  if (!latestVersion) return null;

  const latestVersionName =
    pickFirst(source, ['latest_version_name', 'latestVersionName', 'version_name', 'versionName', 'name']) ||
    `v${String(latestVersion).replace(/^v/i, '')}`;

  const downloadUrl =
    pickFirst(source, ['download_url', 'downloadUrl', 'apk_url', 'apkUrl', 'url', 'html_url']) ||
    fallbackDownloadUrl;

  const forceUpdate = source.force_update !== false && source.forceUpdate !== false && source.required !== false;

  return {
    updateAvailable: isNewerVersion(latestVersion),
    forceUpdate,
    currentVersion: CURRENT_VERSION,
    latestVersion,
    latestVersionName,
    downloadUrl,
  };
}

function findApkDownloadUrl(release) {
  const asset = release?.assets?.find((item) => String(item?.name || '').toLowerCase().endsWith('.apk'));
  return asset?.browser_download_url || release?.html_url || GITHUB_DOWNLOAD_PAGE_URL;
}

async function checkServerVersion() {
  const response = await fetch(SERVER_VERSION_CHECK_URL, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) return null;

  const payload = await response.json();
  return normalizeVersionPayload(payload);
}

async function checkGitHubVersion() {
  const response = await fetch(GITHUB_LATEST_RELEASE_API_URL, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    return {
      updateAvailable: false,
      forceUpdate: false,
      currentVersion: CURRENT_VERSION,
      downloadUrl: GITHUB_DOWNLOAD_PAGE_URL,
    };
  }

  const release = await response.json();
  const latestVersion = release.tag_name || release.name || '';

  return {
    updateAvailable: isNewerVersion(latestVersion),
    forceUpdate: true,
    currentVersion: CURRENT_VERSION,
    latestVersion,
    latestVersionName: release.name || latestVersion,
    downloadUrl: findApkDownloadUrl(release),
  };
}

export async function checkForAppUpdate() {
  try {
    const serverInfo = await checkServerVersion();
    if (serverInfo) return serverInfo;
  } catch {
    // If the school server has no version endpoint yet, use the GitHub release as backup.
  }

  return checkGitHubVersion();
}
