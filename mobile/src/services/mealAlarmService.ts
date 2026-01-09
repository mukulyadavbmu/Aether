import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MEAL_TIMES_KEY = '@aether_meal_times';
const MEAL_LOGGED_KEY = '@aether_meal_logged';

interface MealTime {
  id: string;
  name: string;
  hour: number;
  minute: number;
  enabled: boolean;
}

const DEFAULT_MEAL_TIMES: MealTime[] = [
  { id: 'breakfast', name: 'Breakfast', hour: 8, minute: 0, enabled: true },
  { id: 'lunch', name: 'Lunch', hour: 13, minute: 0, enabled: true },
  { id: 'snack', name: 'Snack', hour: 17, minute: 0, enabled: true },
  { id: 'dinner', name: 'Dinner', hour: 20, minute: 0, enabled: true },
];

export const scheduleMealAlarms = async () => {
  const mealTimes = await getMealTimes();
  
  for (const meal of mealTimes) {
    if (meal.enabled) {
      // Schedule initial alarm
      await scheduleInitialMealAlarm(meal);
    }
  }
};

const scheduleInitialMealAlarm = async (meal: MealTime) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🍽️ ${meal.name} Time!`,
      body: 'Log your meal now. I will remind you again in 10 minutes if you skip this.',
      sound: true,
      data: { mealId: meal.id, attempt: 1 },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      repeats: true,
      hour: meal.hour,
      minute: meal.minute,
    },
  });
};

export const schedulePersistentMealReminder = async (mealId: string, mealName: string, attempt: number = 1) => {
  // Check if meal was logged
  const today = new Date().toDateString();
  const loggedKey = `${MEAL_LOGGED_KEY}_${mealId}_${today}`;
  const isLogged = await AsyncStorage.getItem(loggedKey);
  
  if (isLogged) {
    return; // Meal already logged, don't remind
  }

  // If not logged, schedule reminder in 10 minutes
  if (attempt <= 6) { // Max 6 attempts (1 hour total)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚠️ ${mealName} NOT LOGGED! (Attempt ${attempt}/6)`,
        body: attempt < 6 
          ? 'You MUST log this meal. I will keep pestering you every 10 minutes!' 
          : 'FINAL WARNING: Log your meal NOW or accept you failed today.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { mealId, attempt: attempt + 1 },
      },
      trigger: { seconds: 600 }, // 10 minutes
    });
  }
};

export const markMealAsLogged = async (mealId: string) => {
  const today = new Date().toDateString();
  const loggedKey = `${MEAL_LOGGED_KEY}_${mealId}_${today}`;
  await AsyncStorage.setItem(loggedKey, 'true');
  
  // Cancel all pending reminders for this meal
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of notifications) {
    if (notification.content.data?.mealId === mealId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
};

export const getMealTimes = async (): Promise<MealTime[]> => {
  try {
    const data = await AsyncStorage.getItem(MEAL_TIMES_KEY);
    return data ? JSON.parse(data) : DEFAULT_MEAL_TIMES;
  } catch (error) {
    return DEFAULT_MEAL_TIMES;
  }
};

export const setMealTimes = async (mealTimes: MealTime[]) => {
  await AsyncStorage.setItem(MEAL_TIMES_KEY, JSON.stringify(mealTimes));
  await scheduleMealAlarms();
};

// Listen for notification responses
Notifications.addNotificationResponseReceivedListener((response) => {
  const { mealId, attempt } = response.notification.request.content.data || {};
  
  if (mealId && attempt && typeof mealId === 'string' && typeof attempt === 'number') {
    // Schedule next reminder if meal not logged
    const mealName = response.notification.request.content.title?.split(' ')[1] || 'Meal';
    schedulePersistentMealReminder(mealId, mealName, attempt);
  }
});
