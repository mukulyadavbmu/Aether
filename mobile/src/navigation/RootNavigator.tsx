import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../modules/auth/store/authStore';
import { useTheme } from '../context/ThemeContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import CoachScreen from '../modules/coach/screens/CoachScreen';
import JournalScreen from '../modules/journal/screens/JournalScreen';
import LimiterScreen from '../modules/limiter/screens/LimiterScreen';
import HistoricalTrendsScreen from '../modules/dashboard/screens/HistoricalTrendsScreen';
import MealLoggingScreen from '../modules/health/screens/MealLoggingScreen';
import SmartAlarmScreen from '../modules/health/screens/SmartAlarmScreen';
import SettingsScreen from '../modules/settings/screens/SettingsScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Health: undefined;
  MealLogging: undefined;
  SmartAlarm: undefined;
  Journal: undefined;
  Limiter: undefined;
  Trends: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { colors } = useTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen 
            name="Health" 
            component={CoachScreen} 
            options={{ 
              headerShown: true, 
              title: 'Health Coach',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }} 
          />
          <Stack.Screen 
            name="MealLogging" 
            component={MealLoggingScreen} 
            options={{ 
              headerShown: true, 
              title: 'Log Meal',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }} 
          />
          <Stack.Screen 
            name="SmartAlarm" 
            component={SmartAlarmScreen} 
            options={{ 
              headerShown: true, 
              title: 'Smart Alarm',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }} 
          />
          <Stack.Screen 
            name="Journal" 
            component={JournalScreen} 
            options={{ 
              headerShown: true, 
              title: 'AI Journal',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }} 
          />
          <Stack.Screen 
            name="Limiter" 
            component={LimiterScreen} 
            options={{ 
              headerShown: true, 
              title: 'App Limiter',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }} 
          />
          <Stack.Screen 
            name="Trends" 
            component={HistoricalTrendsScreen} 
            options={{ 
              headerShown: true, 
              title: 'Historical Trends',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }} 
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{ 
              headerShown: true, 
              title: 'Settings',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }} 
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
