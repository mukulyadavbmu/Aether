import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Application from 'expo-application';

const USAGE_KEY = '@aether_app_usage';
const LIMITS_KEY = '@aether_app_limits';

interface AppUsage {
  appName: string;
  todayUsage: number; // in minutes
  lastUpdated: string;
  isBlocked: boolean;
}

interface AppLimit {
  appName: string;
  dailyLimit: number; // in minutes
}

let appStateSubscription: any = null;
let sessionStart: Date | null = null;
let currentApp: string | null = null;

export const initializeUsageTracking = () => {
  // Track app state changes
  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
  
  // Reset daily usage at midnight
  scheduleDailyReset();
};

export const cleanupUsageTracking = () => {
  if (appStateSubscription) {
    appStateSubscription.remove();
  }
};

const handleAppStateChange = async (nextAppState: AppStateStatus) => {
  if (nextAppState === 'active') {
    // App came to foreground
    sessionStart = new Date();
  } else if (nextAppState === 'background' || nextAppState === 'inactive') {
    // App went to background - record session
    if (sessionStart && currentApp) {
      const sessionDuration = (new Date().getTime() - sessionStart.getTime()) / 1000 / 60; // minutes
      await updateAppUsage(currentApp, sessionDuration);
      sessionStart = null;
    }
  }
};

export const startAppUsageTracking = async (appName: string) => {
  currentApp = appName;
  sessionStart = new Date();
  
  // Check if app is blocked
  const isBlocked = await isAppBlocked(appName);
  if (isBlocked) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚫 App Limit Reached',
        body: `You've reached your daily limit for ${appName}`,
        sound: true,
      },
      trigger: null,
    });
    return false;
  }
  return true;
};

export const stopAppUsageTracking = async () => {
  if (sessionStart && currentApp) {
    const sessionDuration = (new Date().getTime() - sessionStart.getTime()) / 1000 / 60;
    await updateAppUsage(currentApp, sessionDuration);
    sessionStart = null;
    currentApp = null;
  }
};

const updateAppUsage = async (appName: string, additionalMinutes: number) => {
  try {
    const usageData = await getAppUsage();
    const today = new Date().toDateString();
    
    let appUsage = usageData.find(u => u.appName === appName);
    
    if (!appUsage) {
      appUsage = {
        appName,
        todayUsage: 0,
        lastUpdated: today,
        isBlocked: false,
      };
      usageData.push(appUsage);
    }
    
    // Reset if it's a new day
    if (appUsage.lastUpdated !== today) {
      appUsage.todayUsage = 0;
      appUsage.lastUpdated = today;
      appUsage.isBlocked = false;
    }
    
    appUsage.todayUsage += additionalMinutes;
    
    // Check against limits
    const limits = await getAppLimits();
    const limit = limits.find(l => l.appName === appName);
    
    if (limit && appUsage.todayUsage >= limit.dailyLimit) {
      appUsage.isBlocked = true;
      
      // Send notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏱️ Daily Limit Reached',
          body: `You've used ${appName} for ${Math.round(appUsage.todayUsage)} minutes today (limit: ${limit.dailyLimit} min)`,
          sound: true,
        },
        trigger: null,
      });
    }
    
    await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(usageData));
  } catch (error) {
    console.error('Failed to update app usage:', error);
  }
};

export const getAppUsage = async (): Promise<AppUsage[]> => {
  try {
    const data = await AsyncStorage.getItem(USAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

export const setAppLimit = async (appName: string, dailyLimit: number) => {
  try {
    const limits = await getAppLimits();
    const existingIndex = limits.findIndex(l => l.appName === appName);
    
    if (existingIndex >= 0) {
      limits[existingIndex].dailyLimit = dailyLimit;
    } else {
      limits.push({ appName, dailyLimit });
    }
    
    await AsyncStorage.setItem(LIMITS_KEY, JSON.stringify(limits));
  } catch (error) {
    console.error('Failed to set app limit:', error);
  }
};

export const getAppLimits = async (): Promise<AppLimit[]> => {
  try {
    const data = await AsyncStorage.getItem(LIMITS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

export const isAppBlocked = async (appName: string): Promise<boolean> => {
  const usageData = await getAppUsage();
  const appUsage = usageData.find(u => u.appName === appName);
  
  if (!appUsage) return false;
  
  // Check if it's still today
  const today = new Date().toDateString();
  if (appUsage.lastUpdated !== today) {
    return false;
  }
  
  return appUsage.isBlocked;
};

const GRACE_PERIOD_KEY = '@aether_grace_period_used';
const GHOST_MODE_KEY = '@aether_ghost_mode';

export const isGhostModeActive = async (): Promise<boolean> => {
  const ghostMode = await AsyncStorage.getItem(GHOST_MODE_KEY);
  return ghostMode === 'true';
};

export const activateGhostMode = async () => {
  await AsyncStorage.setItem(GHOST_MODE_KEY, 'true');
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '👻 GHOST MODE ACTIVATED',
      body: 'All distracting apps are now HARD BLOCKED. No 2-minute grace period until you complete your weekly goal.',
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: null,
  });
};

export const deactivateGhostMode = async () => {
  await AsyncStorage.setItem(GHOST_MODE_KEY, 'false');
};

export const requestGracePeriod = async (appName: string): Promise<boolean> => {
  const isGhost = await isGhostModeActive();
  if (isGhost) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚫 GHOST MODE - NO MERCY',
        body: 'Grace period DENIED. Complete your weekly goal first.',
        sound: true,
      },
      trigger: null,
    });
    return false;
  }

  const today = new Date().toDateString();
  const graceKey = `${GRACE_PERIOD_KEY}_${appName}_${today}`;
  const graceUsed = await AsyncStorage.getItem(graceKey);
  
  if (graceUsed) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏱️ Grace Period Already Used',
        body: `You already used your 2-minute emergency access for ${appName} today.`,
        sound: true,
      },
      trigger: null,
    });
    return false;
  }

  // Grant 2-minute access
  await AsyncStorage.setItem(graceKey, 'true');
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏱️ 2-MINUTE GRACE PERIOD STARTED',
      body: `Emergency access granted for ${appName}. Lock in 2 minutes.`,
      sound: true,
    },
    trigger: null,
  });

  // Schedule lock notification
  setTimeout(async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔒 GRACE PERIOD ENDED',
        body: `${appName} is now LOCKED again. No more access today.`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: null,
    });
  }, 120000); // 2 minutes

  return true;
};

export const getTodayUsageSummary = async () => {
  const usageData = await getAppUsage();
  const limits = await getAppLimits();
  const today = new Date().toDateString();
  
  return usageData
    .filter(u => u.lastUpdated === today)
    .map(u => {
      const limit = limits.find(l => l.appName === u.appName);
      return {
        appName: u.appName,
        usedMinutes: Math.round(u.todayUsage),
        limitMinutes: limit?.dailyLimit || 0,
        isBlocked: u.isBlocked,
        percentageUsed: limit ? Math.round((u.todayUsage / limit.dailyLimit) * 100) : 0,
      };
    });
};

const scheduleDailyReset = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const msUntilMidnight = tomorrow.getTime() - now.getTime();
  
  setTimeout(async () => {
    // Reset all usage data
    await AsyncStorage.setItem(USAGE_KEY, JSON.stringify([]));
    
    // Schedule next reset
    scheduleDailyReset();
  }, msUntilMidnight);
};

export const getInstalledApps = async () => {
  // Note: This feature requires a development build with native modules
  // Expo Go doesn't support app usage stats
  
  if (Platform.OS === 'android') {
    // For now, return mock data with a note that this needs native implementation
    // In a production app, you would:
    // 1. Create a native module using expo-modules
    // 2. Use Android's UsageStatsManager to get real app data
    // 3. Request android.permission.PACKAGE_USAGE_STATS permission
    
    return [
      { name: 'Instagram', packageName: 'com.instagram.android', icon: '📷' },
      { name: 'Facebook', packageName: 'com.facebook.katana', icon: '👤' },
      { name: 'Twitter', packageName: 'com.twitter.android', icon: '🐦' },
      { name: 'TikTok', packageName: 'com.zhiliaoapp.musically', icon: '🎵' },
      { name: 'YouTube', packageName: 'com.google.android.youtube', icon: '▶️' },
      { name: 'Reddit', packageName: 'com.reddit.frontpage', icon: '🤖' },
      { name: 'Snapchat', packageName: 'com.snapchat.android', icon: '👻' },
      { name: 'WhatsApp', packageName: 'com.whatsapp', icon: '💬' },
    ];
  }
  
  // iOS doesn't allow app usage tracking of other apps
  return [];
};

// Request app usage permission (Android only)
export const requestUsagePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return false;
  }
  
  // This requires a native module implementation
  // For now, show alert explaining the limitation
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Permission Required',
      body: 'App usage tracking requires a development build with native modules. This feature is not available in Expo Go.',
      sound: false,
    },
    trigger: null,
  });
  
  return false;
};
