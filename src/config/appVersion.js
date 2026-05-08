import appConfig from '../../app.json';

export const APP_NAME = appConfig.expo.name;
export const CURRENT_VERSION = appConfig.expo.version;
export const CURRENT_VERSION_NAME = `v${CURRENT_VERSION}`;
export const GITHUB_REPO = 'MuhmmadTayyab/dt-attendance';
export const GITHUB_DOWNLOAD_PAGE_URL = `https://github.com/${GITHUB_REPO}/releases`;
export const GITHUB_LATEST_RELEASE_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
