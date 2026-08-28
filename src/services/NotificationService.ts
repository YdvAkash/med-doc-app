import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async () => {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
};

export const scheduleDailyReminder = async (hour: number = 20, minute: number = 30) => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return false;

  // Cancel any existing reminders first
  await cancelAllReminders();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🩺 Time for your Health Check-in!",
      body: "Please upload your latest reports and let's analyze your health and medical history. Stay healthy! 🌟",
      sound: true,
    },
    trigger: {
      hour: hour,
      minute: minute,
      repeats: true,
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
    },
  });
  
  console.log(`Scheduled daily reminder at ${hour}:${minute} with ID: ${id}`);
  return id;
};

export const cancelAllReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const checkScheduledNotifications = async () => {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  return notifications;
};
