import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { Alert, Platform } from 'react-native';
import { APP_VERSION } from '../version';

const GITHUB_REPO = 'YdvAkash/med-doc-app';

interface GitHubRelease {
  tag_name: string;
  assets: {
    browser_download_url: string;
    name: string;
    content_type: string;
  }[];
}

export type UpdateState = 
  | 'IDLE' 
  | 'CHECKING' 
  | 'UPDATE_AVAILABLE' 
  | 'DOWNLOADING' 
  | 'DOWNLOAD_COMPLETE' 
  | 'PREPARING_INSTALL' 
  | 'OPENING_INSTALLER'
  | 'DOWNLOAD_FAILED';

export type UpdateListener = (state: UpdateState, progress?: number, version?: string) => void;

export class UpdateService {
  private static listener: UpdateListener | null = null;
  private static latestApkUrl: string | null = null;
  private static latestVersionName: string | null = null;

  static setListener(listener: UpdateListener | null) {
    this.listener = listener;
  }

  private static notify(state: UpdateState, progress: number = 0, version?: string) {
    if (this.listener) {
      this.listener(state, progress, version || this.latestVersionName || undefined);
    }
  }

  static isNewerVersion(currentVersion: string, latestVersion: string): boolean {
    if (__DEV__) {
      return false; // Automatically disable update prompts for local development!
    }
    
    // Clean versions to only contain numbers and dots
    const cleanCurrent = currentVersion.replace(/[^0-9.]/g, '');
    const cleanLatest = latestVersion.replace(/[^0-9.]/g, '');
    
    const v1Parts = cleanCurrent.split('.').map(Number);
    const v2Parts = cleanLatest.split('.').map(Number);
    
    const len = Math.max(v1Parts.length, v2Parts.length);
    for (let i = 0; i < len; i++) {
      const n1 = v1Parts[i] || 0;
      const n2 = v2Parts[i] || 0;
      if (n2 > n1) return true;
      if (n2 < n1) return false;
    }
    return false;
  }

  /**
   * Checks for a new release on GitHub.
   */
  static async checkForUpdates(silent: boolean = true) {
    if (Platform.OS !== 'android') {
      if (!silent) Alert.alert('Notice', 'In-app updates are only supported on Android.');
      return;
    }

    try {
      this.notify('CHECKING');
      const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Med-Doc-App'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch release info: ' + response.status);
      }

      const release: GitHubRelease = await response.json();
      const latestVersion = release.tag_name;
      const currentVersion = APP_VERSION;

      if (this.isNewerVersion(currentVersion, latestVersion)) {
        // Find the APK asset
        const apkAsset = release.assets.find(asset => asset.name.endsWith('.apk'));

        if (apkAsset) {
          this.latestApkUrl = apkAsset.browser_download_url;
          this.latestVersionName = latestVersion;
          this.notify('UPDATE_AVAILABLE', 0, latestVersion);
        } else {
          this.notify('IDLE');
          if (!silent) Alert.alert('Update', 'New version found, but no APK is attached to the release.');
        }
      } else {
        this.notify('IDLE');
        if (!silent) Alert.alert('Up to date', 'You are using the latest version of the app.');
      }
    } catch (error) {
      console.error('Check update error:', error);
      this.notify('IDLE');
      if (!silent) Alert.alert('Error', 'Failed to check for updates. Please try again later.');
    }
  }

  /**
   * Downloads and installs the APK.
   */
  static async startDownloadAndInstall() {
    if (!this.latestApkUrl) return;

    try {
      this.notify('DOWNLOADING', 0);
      
      const apkPath = FileSystem.documentDirectory + 'app-update.apk';

      // Ensure the old apk is removed before downloading a new one to avoid any conflicts
      const fileInfo = await FileSystem.getInfoAsync(apkPath);
      if (fileInfo.exists) {
         await FileSystem.deleteAsync(apkPath, { idempotent: true });
      }

      const downloadResumable = FileSystem.createDownloadResumable(
        this.latestApkUrl,
        apkPath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesExpectedToWrite > 0 
            ? downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite
            : 0;
          this.notify('DOWNLOADING', progress);
        }
      );

      const downloadRes = await downloadResumable.downloadAsync();

      if (!downloadRes || downloadRes.status !== 200) {
        throw new Error('Failed to download update');
      }

      this.notify('DOWNLOAD_COMPLETE');
      
      // Artificial delay to show "Download complete" before preparing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.notify('PREPARING_INSTALL');
      
      const uri = downloadRes.uri;

      // Convert to content:// URI so the package installer can read it
      const contentUri = await FileSystem.getContentUriAsync(uri);

      this.notify('OPENING_INSTALLER');
      
      // Artificial delay to show opening installer state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Launch the Android installer
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        type: 'application/vnd.android.package-archive',
      });
      
      // Set idle after a long timeout so modal closes if user returns
      setTimeout(() => {
         this.notify('IDLE');
      }, 5000);

    } catch (error) {
      console.error('Install update error:', error);
      this.notify('DOWNLOAD_FAILED');
    }
  }

  static dismissUpdate() {
    this.notify('IDLE');
  }
}
