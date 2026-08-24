import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
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

const TabIcon = ({ name, focused, color }: { name: any, focused: boolean, color: string }) => {
  return <MaterialIcons name={name} size={24} color={color} />;
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors['outline-variant'],
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors['on-surface-variant'],
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => <TabIcon name="home" focused={focused} color={color} />
        }}
      />
      <Tab.Screen 
        name="ReportsTab" 
        component={MyReportsScreen} 
        options={{
          title: 'Reports',
          tabBarIcon: ({ focused, color }) => <TabIcon name="description" focused={focused} color={color} />
        }}
      />
      <Tab.Screen 
        name="HealthTab" 
        component={HealthDashboardScreen} 
        options={{
          title: 'Health',
          tabBarIcon: ({ focused, color }) => <TabIcon name="monitor-heart" focused={focused} color={color} />
        }}
      />
      <Tab.Screen 
        name="AskTab" 
        component={AskReportsScreen} 
        options={{
          title: 'Ask',
          tabBarIcon: ({ focused, color }) => <TabIcon name="chat" focused={focused} color={color} />
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => <TabIcon name="person" focused={focused} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { token, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        {token == null ? (
          // Auth Stack
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
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
  );
};
