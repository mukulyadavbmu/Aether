import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore } from './src/modules/auth/store/authStore';
import { setupNotifications, checkAndScheduleProactiveReminders, sendDailySummaryReminder } from './src/services/notificationService';
import { initializeUsageTracking, cleanupUsageTracking } from './src/services/usageTrackingService';
import { scheduleMealAlarms } from './src/services/mealAlarmService';
import PhoneUnlockOverlay, { usePhoneUnlockDetection } from './src/components/PhoneUnlockOverlay';
import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  const loadToken = useAuthStore((state) => state.loadToken);
  const token = useAuthStore((state) => state.token);
  const { showOverlay, setShowOverlay } = usePhoneUnlockDetection();
  
  useEffect(() => {
    loadToken();
    initializeNotifications();
    initializeUsageTracking();
    scheduleMealAlarms();
    
    return () => {
      cleanupUsageTracking();
    };
  }, []);

  useEffect(() => {
    if (token) {
      scheduleReminders();
    }
  }, [token]);

  const initializeNotifications = async () => {
    await setupNotifications();
    await sendDailySummaryReminder();
  };

  const scheduleReminders = async () => {
    if (token) {
      await checkAndScheduleProactiveReminders(token);
      
      // Check every 4 hours
      setInterval(() => {
        checkAndScheduleProactiveReminders(token);
      }, 4 * 60 * 60 * 1000);
    }
  };
  
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
        <PhoneUnlockOverlay 
          visible={showOverlay} 
          onDismiss={() => setShowOverlay(false)} 
        />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
