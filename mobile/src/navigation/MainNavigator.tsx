import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import DashboardScreen from '../modules/dashboard/screens/DashboardScreen';
import HistoricalTrendsScreen from '../modules/dashboard/screens/HistoricalTrendsScreen';
import CoachScreen from '../modules/coach/screens/CoachScreen';
import TrackerScreen from '../modules/tracking/screens/TrackerScreen';
import ActivitiesScreen from '../modules/tracking/screens/ActivitiesScreen';
import RouteMapScreen from '../modules/tracking/screens/RouteMapScreen';
import LiveGPSCoachScreen from '../modules/tracking/screens/LiveGPSCoachScreen';
import TasksScreen from '../modules/productivity/screens/TasksScreen';
import FocusModeScreen from '../modules/productivity/screens/FocusModeScreen';
import JournalScreen from '../modules/journal/screens/JournalScreen';
import MealLoggingScreen from '../modules/health/screens/MealLoggingScreen';
import SmartAlarmScreen from '../modules/health/screens/SmartAlarmScreen';
import LimiterScreen from '../modules/limiter/screens/LimiterScreen';
import ProfileScreen from '../modules/profile/screens/ProfileScreen';
import SquadsScreen from '../modules/squad/screens/SquadsScreen';
import SquadDetailScreen from '../modules/squad/screens/SquadDetailScreen';
import CreateSquadScreen from '../modules/squad/screens/CreateSquadScreen';
import JoinSquadScreen from '../modules/squad/screens/JoinSquadScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Tracker: undefined;
  Tasks: undefined;
  Squads: undefined;
  Profile: undefined;
};

export type HealthStackParamList = {
  HealthMain: undefined;
  MealLogging: undefined;
  SmartAlarm: undefined;
};

export type TrackerStackParamList = {
  TrackerMain: undefined;
  Activities: undefined;
  RouteMap: { activity: any };
  LiveGPSCoach: undefined;
};

export type ProductivityStackParamList = {
  TasksMain: undefined;
  FocusMode: undefined;
};

export type SquadStackParamList = {
  SquadsMain: undefined;
  SquadDetail: { squadId: string };
  CreateSquad: undefined;
  JoinSquad: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HealthStack = createNativeStackNavigator<HealthStackParamList>();
const TrackerStack = createNativeStackNavigator<TrackerStackParamList>();
const ProductivityStack = createNativeStackNavigator<ProductivityStackParamList>();
const SquadStack = createNativeStackNavigator<SquadStackParamList>();

const HealthNavigator = () => {
  const { colors } = useTheme();
  return (
    <HealthStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <HealthStack.Screen 
        name="HealthMain" 
        component={CoachScreen} 
        options={{ headerShown: false }} 
      />
      <HealthStack.Screen 
        name="MealLogging" 
        component={MealLoggingScreen}
        options={{ title: 'Log Meal' }} 
      />
      <HealthStack.Screen 
        name="SmartAlarm" 
        component={SmartAlarmScreen}
        options={{ title: 'Smart Alarm' }} 
      />
    </HealthStack.Navigator>
  );
};

const TrackerNavigator = () => {
  const { colors } = useTheme();
  return (
    <TrackerStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <TrackerStack.Screen 
        name="TrackerMain" 
        component={TrackerScreen} 
        options={{ headerShown: false }} 
      />
      <TrackerStack.Screen 
        name="Activities" 
        component={ActivitiesScreen} 
        options={{ title: 'Activity History' }} 
      />
      <TrackerStack.Screen 
        name="RouteMap" 
        component={RouteMapScreen} 
        options={{ title: 'Route Map' }} 
      />
      <TrackerStack.Screen 
        name="LiveGPSCoach" 
        component={LiveGPSCoachScreen} 
        options={{ title: 'Live GPS Coach' }} 
      />
    </TrackerStack.Navigator>
  );
};

const ProductivityNavigator = () => {
  const { colors } = useTheme();
  return (
    <ProductivityStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <ProductivityStack.Screen 
        name="TasksMain" 
        component={TasksScreen} 
        options={{ headerShown: false }} 
      />
      <ProductivityStack.Screen 
        name="FocusMode" 
        component={FocusModeScreen} 
        options={{ title: 'Focus Mode' }} 
      />
    </ProductivityStack.Navigator>
  );
};

const SquadNavigator = () => {
  const { colors } = useTheme();
  return (
    <SquadStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <SquadStack.Screen 
        name="SquadsMain" 
        component={SquadsScreen} 
        options={{ headerShown: false }} 
      />
      <SquadStack.Screen 
        name="SquadDetail" 
        component={SquadDetailScreen} 
        options={{ title: 'Squad Details' }} 
      />
      <SquadStack.Screen 
        name="CreateSquad" 
        component={CreateSquadScreen} 
        options={{ title: 'Create Squad' }} 
      />
      <SquadStack.Screen 
        name="JoinSquad" 
        component={JoinSquadScreen} 
        options={{ title: 'Join Squad' }} 
      />
    </SquadStack.Navigator>
  );
};

const MainNavigator = () => {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tracker') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else if (route.name === 'Squads') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Tracker" 
        component={TrackerNavigator}
        options={{ title: 'Tracker', headerShown: false }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={ProductivityNavigator} 
        options={{ title: 'Tasks', headerShown: false }} 
      />
      <Tab.Screen 
        name="Squads" 
        component={SquadNavigator}
        options={{ title: 'Squads', headerShown: false }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
