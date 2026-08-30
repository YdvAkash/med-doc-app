import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { UpdateService } from './src/services/UpdateService';
import { StartIoAds } from './src/services/ads/StartIoAds';

export default function App() {
  useEffect(() => {
    StartIoAds.init();
    UpdateService.checkForUpdates();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
