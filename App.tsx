import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AppNavigator } from './src/navigation/AppNavigator';
import { UpdateService } from './src/services/UpdateService';
import { StartIoAds } from './src/services/ads/StartIoAds';
import { UpdateModal } from './src/components/common/UpdateModal';
import { InAppBanner } from './src/components/InAppBanner';

import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography } from './src/theme';

const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View style={{
      height: 70,
      width: '90%',
      backgroundColor: '#0F172A',
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
      marginTop: 10,
    }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(16, 185, 129, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
        <MaterialIcons name="check-circle" size={24} color="#10B981" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 }}>{text1}</Text>
        {text2 && <Text style={{ fontSize: 13, color: '#94A3B8' }}>{text2}</Text>}
      </View>
    </View>
  ),
  info: ({ text1, text2 }: any) => (
    <View style={{
      height: 70,
      width: '90%',
      backgroundColor: '#0F172A',
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
      marginTop: 10,
    }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(59, 130, 246, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
        <MaterialIcons name="info" size={24} color="#3B82F6" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 }}>{text1}</Text>
        {text2 && <Text style={{ fontSize: 13, color: '#94A3B8' }}>{text2}</Text>}
      </View>
    </View>
  ),
};

export default function App() {
  useEffect(() => {
    StartIoAds.init();
    UpdateService.checkForUpdates();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
      <UpdateModal />
      <InAppBanner />
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}
