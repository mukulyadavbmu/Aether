import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config/api';

const REMINDER_CHECK_KEY = '@aether_last_reminder_check';

export const setupNotifications = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }

  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  return true;
};

export const checkAndScheduleProactiveReminders = async (token: string) => {
  try {
    const lastCheck = await AsyncStorage.getItem(REMINDER_CHECK_KEY);
    const now = new Date();
    
    // Only check every 4 hours
    if (lastCheck) {
      const lastCheckTime = new Date(lastCheck);
      const hoursSince = (now.getTime() - lastCheckTime.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 4) {
        return;
      }
    }

    // Fetch proactive reminders from backend
    const response = await axios.get(`${API_URL}/productivity/reminders/proactive`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const reminders = response.data;

    // Schedule notifications for each reminder
    for (const reminder of reminders) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💡 Aether Reminder',
          body: reminder.message || reminder.reminder,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: { seconds: 5 },
      });
    }

    await AsyncStorage.setItem(REMINDER_CHECK_KEY, now.toISOString());
  } catch (error) {
    console.log('Failed to schedule proactive reminders:', error);
  }
};

export const scheduleTaskDeadlineReminder = async (taskName: string, deadline: Date) => {
  const now = new Date();
  const timeUntilDeadline = (deadline.getTime() - now.getTime()) / 1000;

  // Schedule reminder 1 hour before deadline
  if (timeUntilDeadline > 3600) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Task Deadline Approaching',
        body: `"${taskName}" is due in 1 hour!`,
        sound: true,
      },
      trigger: { seconds: Math.max(1, Math.floor(timeUntilDeadline - 3600)) },
    });
  }
};

export const sendDailySummaryReminder = async () => {
  // Schedule daily reminder at 9 PM
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(21, 0, 0, 0);
  
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📝 Daily Summary',
      body: "Don't forget to write your daily summary for AI analysis!",
      sound: true,
    },
    trigger: { date: scheduledTime },
  });
};
