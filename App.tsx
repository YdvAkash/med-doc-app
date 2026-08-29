import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { UpdateService } from './src/services/UpdateService';

export default function App() {
  useEffect(() => {
    // Check for updates silently on app startup
    UpdateService.checkForUpdates(true);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
