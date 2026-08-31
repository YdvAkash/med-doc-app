import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser, getProfile, updatePushToken } from '../services/api';
import { requestNotificationPermissions } from '../services/NotificationService';

interface User {
  id?: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  subscriptionTier?: string;
  reportsUploadedThisWeek?: number;
  chatsThisWeek?: number;
  emergencyContactPhone?: string;
  phone?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  profilePictureUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

const syncPushToken = async () => {
  try {
    const pushToken = await requestNotificationPermissions();
    if (pushToken && typeof pushToken === 'string') {
      await updatePushToken(pushToken);
      console.log('Push token synced with server');
    }
  } catch (err) {
    console.error('Failed to sync push token', err);
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,
  error: null,
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await loginUser({ email, password });
      const user = res.data.user;
      const token = res.data.accessToken;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isLoading: false });
      
      // Sync push token after successful login
      syncPushToken();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  register: async (firstName, lastName, email, password) => {
    set({ isLoading: true });
    try {
      await registerUser({ firstName, lastName, email, password });
      
      // Auto-login is removed because the user needs to verify OTP first.
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    set({ user: null, token: null, isLoading: false });
  },
  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), isInitialized: true });
        // Sync push token on app start if logged in
        syncPushToken();
      } else {
        set({ isInitialized: true });
      }
    } catch (e) {
      set({ isInitialized: true });
    }
  },
  fetchProfile: async () => {
    try {
      const res = await getProfile();
      if (res.success && res.data) {
        set({ user: res.data });
        await AsyncStorage.setItem('user', JSON.stringify(res.data));
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  },
}));
