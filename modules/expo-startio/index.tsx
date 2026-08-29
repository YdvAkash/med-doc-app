import { requireNativeModule, requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';
import { ViewProps } from 'react-native';

const ExpoStartio = requireNativeModule('ExpoStartio');
const NativeStartIoBanner = requireNativeViewManager('ExpoStartio');

export function initStartIo(appId: string, testMode: boolean = false): void {
  try {
    ExpoStartio.initStartIo(appId, testMode);
  } catch (e) {
    console.warn("StartIo Module not available or failed to initialize", e);
  }
}

export function showInterstitial(): void {
  try {
    ExpoStartio.showInterstitial();
  } catch (e) {
    console.warn("StartIo Module not available or failed to show interstitial", e);
  }
}

export type StartIoBannerProps = ViewProps & {
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: string) => void;
};

export function StartIoBanner(props: StartIoBannerProps) {
  return <NativeStartIoBanner {...props} />;
}
