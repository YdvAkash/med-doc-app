import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { DocumentsScreen } from '../screens/DocumentsScreen';
import { MyReportsScreen } from '../screens/MyReportsScreen';
import { HealthDashboardScreen } from '../screens/HealthDashboardScreen';
import { AskReportsScreen } from '../screens/AskReportsScreen';
import { AddReportScreen } from '../screens/AddReportScreen';
import { ReportDetailScreen } from '../screens/ReportDetailScreen';
import { useAuthStore } from '../store/useAuth';
import { ActivityIndicator, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import { PremiumTabBar } from '../components/navigation/PremiumTabBar';

const TabIcon = ({ name, focused, color }: { name: any, focused: boolean, color: string }) => {
  return <MaterialIcons name={name} size={24} color={color} />;
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <PremiumTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={MyReportsScreen}
        options={{ title: 'Reports' }}
      />
      <Tab.Screen
        name="HealthTab"
        component={HealthDashboardScreen}
        options={{ title: 'Health' }}
      />
      <Tab.Screen
        name="AskTab"
        component={AskReportsScreen}
        options={{ title: 'Ask' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

import { LoginSuccessOverlay } from '../components/common/LoginSuccessOverlay';

export const AppNavigator = () => {
  const { token, isInitialized, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          {token == null ? (
            // Auth Stack
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            </>
          ) : (
            // App Stack
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="AddReport" component={AddReportScreen} />
              <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
              <Stack.Screen name="Documents" component={DocumentsScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <LoginSuccessOverlay />
    </>
  );
};
