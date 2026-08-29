import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';

const GITHUB_REPO = 'YdvAkash/med-doc-app';

interface GitHubRelease {
  tag_name: string;
  assets: {
    browser_download_url: string;
    name: string;
    content_type: string;
  }[];
}

export class UpdateService {
  /**
   * Compares two semantic version strings (e.g., '1.0.0' and '1.0.1').
   * Returns true if versionB is newer than versionA.
   */
  private static isNewerVersion(versionA: string, versionB: string): boolean {
    const vA = versionA.replace('v', '').split('.').map(Number);
    const vB = versionB.replace('v', '').split('.').map(Number);

    for (let i = 0; i < Math.max(vA.length, vB.length); i++) {
      const numA = vA[i] || 0;
      const numB = vB[i] || 0;
      if (numB > numA) return true;
      if (numB < numA) return false;
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
      const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch release info');
      }

      const release: GitHubRelease = await response.json();
      const latestVersion = release.tag_name;
      const currentVersion = Constants.expoConfig?.version || '1.0.0';

      if (this.isNewerVersion(currentVersion, latestVersion)) {
        // Find the APK asset
        const apkAsset = release.assets.find(asset => asset.name.endsWith('.apk'));

        if (apkAsset) {
          Alert.alert(
            'Update Available',
            `A new version (${latestVersion}) is available. Would you like to update now?`,
            [
              { text: 'Later', style: 'cancel' },
              { text: 'Update', onPress: () => this.downloadAndInstallUpdate(apkAsset.browser_download_url) }
            ]
          );
        } else {
          if (!silent) Alert.alert('Update', 'New version found, but no APK is attached to the release.');
        }
      } else {
        if (!silent) Alert.alert('Up to date', 'You are using the latest version of the app.');
      }
    } catch (error) {
      console.error('Check update error:', error);
      if (!silent) Alert.alert('Error', 'Failed to check for updates. Please try again later.');
    }
  }

  /**
   * Downloads and installs the APK.
   */
  private static async downloadAndInstallUpdate(apkUrl: string) {
    try {
      // 1. Download the APK
      const downloadRes = await FileSystem.downloadAsync(
        apkUrl,
        FileSystem.documentDirectory + 'app-update.apk'
      );

      if (downloadRes.status !== 200) {
        throw new Error('Failed to download update');
      }

      const uri = downloadRes.uri;

      // 2. Convert to content:// URI so the package installer can read it
      const contentUri = await FileSystem.getContentUriAsync(uri);

      // 3. Launch the Android installer
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        type: 'application/vnd.android.package-archive',
      });
    } catch (error) {
      console.error('Install update error:', error);
      Alert.alert('Error', 'Failed to download or install the update.');
    }
  }
}
