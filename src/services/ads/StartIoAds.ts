import { initStartIo, showInterstitial } from '../../../modules/expo-startio';
import { Platform } from 'react-native';
import { useAuthStore } from '../../store/useAuth';

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

  async showInterstitialSafely() {
    if (!this.isInitialized || Platform.OS !== 'android') return;

    const tier = useAuthStore.getState().user?.subscriptionTier || 'FREE';
    if (tier !== 'FREE') {
      console.log(`Skipping interstitial ad for ${tier} tier.`);
      return;
    }

    const now = Date.now();
    if (now - this.lastInterstitialTime < this.COOLDOWN_MS) {
      console.log('Interstitial ad on cooldown, skipping.');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const adsTracking = await import('@react-native-async-storage/async-storage').then(m => m.default);
      
      const key = `@ads_count_${today}`;
      const countStr = await adsTracking.getItem(key);
      const count = countStr ? parseInt(countStr, 10) : 0;

      if (count >= 10) {
        console.log('Daily ad limit reached (10 ads). Skipping ad.');
        return;
      }

      showInterstitial();
      this.lastInterstitialTime = now;
      await adsTracking.setItem(key, (count + 1).toString());
      console.log(`Ad shown. Daily count: ${count + 1}/10`);
    } catch (e) {
      console.warn('Failed to show interstitial', e);
    }
  }
}

export const StartIoAds = new StartIoAdsService();
