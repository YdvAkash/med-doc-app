import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  htmlContent: string;
  actionUrl: string;
  isActive: boolean;
}

const DISMISSED_BANNERS_KEY = '@dismissed_banners';

export const fetchActiveBanners = async (): Promise<Banner[]> => {
  try {
    const response = await api.get('/banners/active');
    return response.data;
  } catch (error) {
    console.error('Error fetching active banners:', error);
    return [];
  }
};

export const getDismissedBannerIds = async (): Promise<number[]> => {
  try {
    const data = await AsyncStorage.getItem(DISMISSED_BANNERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

export const dismissBanner = async (id: number): Promise<void> => {
  try {
    const dismissed = await getDismissedBannerIds();
    if (!dismissed.includes(id)) {
      dismissed.push(id);
      await AsyncStorage.setItem(DISMISSED_BANNERS_KEY, JSON.stringify(dismissed));
    }
  } catch (error) {
    console.error('Error dismissing banner:', error);
  }
};
