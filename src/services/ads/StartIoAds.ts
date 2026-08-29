import { initStartIo, showInterstitial } from '../../../modules/expo-startio';
import { Platform } from 'react-native';

class StartIoAdsService {
  private isInitialized = false;
  private lastInterstitialTime = 0;
  private readonly COOLDOWN_MS = 0; // 0 minutes for testing
  private readonly START_IO_APP_ID = '207384927';

  init() {
    if (this.isInitialized || Platform.OS !== 'android') return;
    try {
      initStartIo(this.START_IO_APP_ID, __DEV__);
      this.isInitialized = true;
      console.log('Start.io Ads initialized safely');
    } catch (e) {
      console.warn('Failed to initialize Start.io Ads', e);
    }
  }

  showInterstitialSafely() {
    if (!this.isInitialized || Platform.OS !== 'android') return;

    const now = Date.now();
    if (now - this.lastInterstitialTime < this.COOLDOWN_MS) {
      console.log('Interstitial ad on cooldown, skipping.');
      return;
    }

    try {
      showInterstitial();
      this.lastInterstitialTime = now;
    } catch (e) {
      console.warn('Failed to show interstitial', e);
    }
  }
}

export const StartIoAds = new StartIoAdsService();
