import * as Location from 'expo-location';
import axios from 'axios';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

interface ScheduledActivity {
  id: string;
  name: string;
  type: 'workout' | 'meeting' | 'study' | 'task';
  scheduledTime: Date;
  location?: string;
  duration: number; // minutes
}

interface LocationContext {
  latitude: number;
  longitude: number;
  placeName?: string;
}

interface ConflictResolution {
  conflictId: string;
  originalActivity: ScheduledActivity;
  detectedLocation: LocationContext;
  aiSuggestions: string[];
  selectedSuggestion?: string;
  timestamp: Date;
}

const CONFLICT_CHECK_INTERVAL = 300000; // Check every 5 minutes
const KNOWN_LOCATIONS_KEY = '@aether_known_locations';

let conflictCheckInterval: NodeJS.Timeout | null = null;

// Known location types
interface KnownLocation {
  name: string;
  latitude: number;
  longitude: number;
  type: 'home' | 'office' | 'gym' | 'other';
}

export const startConflictMonitoring = async (token: string) => {
  if (conflictCheckInterval) return; // Already monitoring

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.log('Location permission not granted');
    return;
  }

  // Check for conflicts every 5 minutes
  conflictCheckInterval = setInterval(async () => {
    await checkForScheduleConflicts(token);
  }, CONFLICT_CHECK_INTERVAL);

  // Immediate first check
  await checkForScheduleConflicts(token);
};

export const stopConflictMonitoring = () => {
  if (conflictCheckInterval) {
    clearInterval(conflictCheckInterval);
    conflictCheckInterval = null;
  }
};

const checkForScheduleConflicts = async (token: string) => {
  try {
    // Get current location
    const location = await Location.getCurrentPositionAsync({});
    const locationContext: LocationContext = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    // Determine where user is
    const knownLocations = await getKnownLocations();
    const currentPlace = identifyLocation(locationContext, knownLocations);
    locationContext.placeName = currentPlace;

    // Get upcoming activities (next 2 hours)
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    // Fetch user's schedule from backend
    const activitiesResponse = await axios.get(`${API_URL}/productivity/schedule`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        startTime: now.toISOString(),
        endTime: twoHoursLater.toISOString(),
      },
    });

    const upcomingActivities: ScheduledActivity[] = activitiesResponse.data;

    // Check each activity for conflicts
    for (const activity of upcomingActivities) {
      const conflict = detectConflict(activity, locationContext);
      
      if (conflict) {
        await handleConflict(activity, locationContext, token);
      }
    }
  } catch (error: any) {
    if (error.response?.status !== 404) {
      console.log('Conflict check error:', error.message);
    }
  }
};

const detectConflict = (
  activity: ScheduledActivity,
  currentLocation: LocationContext
): boolean => {
  const timeUntilActivity = new Date(activity.scheduledTime).getTime() - Date.now();
  const isUpcoming = timeUntilActivity > 0 && timeUntilActivity < 60 * 60 * 1000; // Within 1 hour

  if (!isUpcoming) return false;

  // Conflict scenarios
  if (activity.type === 'workout') {
    // User should be heading to gym but is still at office
    return currentLocation.placeName === 'office';
  }

  if (activity.type === 'meeting') {
    // User should be at office but is at home
    return currentLocation.placeName === 'home';
  }

  return false;
};

const handleConflict = async (
  activity: ScheduledActivity,
  location: LocationContext,
  token: string
) => {
  // Check if we already notified about this conflict
  const conflictKey = `@conflict_${activity.id}_${new Date().toDateString()}`;
  const alreadyNotified = await AsyncStorage.getItem(conflictKey);
  
  if (alreadyNotified) return;

  // Get AI-powered suggestions
  const suggestions = await getAISuggestions(activity, location, token);

  // Send notification with conflict resolution options
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚠️ Work-Life Conflict Detected',
      body: `"${activity.name}" starts soon but you're still at ${location.placeName}. Tap for AI suggestions.`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: {
        type: 'conflict',
        activityId: activity.id,
        suggestions: JSON.stringify(suggestions),
      },
    },
    trigger: null, // Immediate
  });

  // Mark as notified
  await AsyncStorage.setItem(conflictKey, 'true');

  // Log conflict
  await logConflict({
    conflictId: `${activity.id}_${Date.now()}`,
    originalActivity: activity,
    detectedLocation: location,
    aiSuggestions: suggestions,
    timestamp: new Date(),
  });
};

const getAISuggestions = async (
  activity: ScheduledActivity,
  location: LocationContext,
  token: string
): Promise<string[]> => {
  try {
    const response = await axios.post(
      `${API_URL}/productivity/resolve-conflict`,
      {
        activity: {
          name: activity.name,
          type: activity.type,
          scheduledTime: activity.scheduledTime,
          duration: activity.duration,
        },
        currentLocation: location.placeName,
        currentTime: new Date().toISOString(),
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data.suggestions;
  } catch (error) {
    // Fallback suggestions if AI fails
    return generateFallbackSuggestions(activity, location);
  }
};

const generateFallbackSuggestions = (
  activity: ScheduledActivity,
  location: LocationContext
): string[] => {
  if (activity.type === 'workout') {
    return [
      `Push workout to ${new Date(new Date(activity.scheduledTime).getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      'Reduce to 20-minute high-intensity session',
      'Replace with home workout (no commute needed)',
      'Cancel and reschedule for tomorrow',
    ];
  }

  if (activity.type === 'meeting') {
    return [
      'Request virtual meeting instead',
      `Delay by 30 minutes (${new Date(new Date(activity.scheduledTime).getTime() + 30 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      'Send delegate to meeting',
      'Reschedule for tomorrow',
    ];
  }

  return [
    'Reschedule to later today',
    'Reduce activity duration by 50%',
    'Cancel this session',
  ];
};

export const learnLocation = async (name: string, type: KnownLocation['type']) => {
  try {
    const location = await Location.getCurrentPositionAsync({});
    const knownLocations = await getKnownLocations();

    const newLocation: KnownLocation = {
      name,
      type,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    knownLocations.push(newLocation);
    await AsyncStorage.setItem(KNOWN_LOCATIONS_KEY, JSON.stringify(knownLocations));

    return newLocation;
  } catch (error) {
    console.error('Failed to learn location:', error);
    return null;
  }
};

const getKnownLocations = async (): Promise<KnownLocation[]> => {
  try {
    const data = await AsyncStorage.getItem(KNOWN_LOCATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

const identifyLocation = (
  current: LocationContext,
  knownLocations: KnownLocation[]
): string | undefined => {
  const RADIUS_THRESHOLD = 0.1; // km

  for (const known of knownLocations) {
    const distance = calculateDistance(
      current.latitude,
      current.longitude,
      known.latitude,
      known.longitude
    );

    if (distance < RADIUS_THRESHOLD) {
      return known.name;
    }
  }

  return 'unknown location';
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

const logConflict = async (conflict: ConflictResolution) => {
  try {
    const conflicts = await AsyncStorage.getItem('@aether_conflicts');
    const conflictList = conflicts ? JSON.parse(conflicts) : [];
    conflictList.push(conflict);
    await AsyncStorage.setItem('@aether_conflicts', JSON.stringify(conflictList));
  } catch (error) {
    console.error('Failed to log conflict:', error);
  }
};

export const getConflictHistory = async (): Promise<ConflictResolution[]> => {
  try {
    const data = await AsyncStorage.getItem('@aether_conflicts');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

export const resolveConflict = async (
  conflictId: string,
  selectedSuggestion: string
) => {
  try {
    const conflicts = await AsyncStorage.getItem('@aether_conflicts');
    const conflictList: ConflictResolution[] = conflicts ? JSON.parse(conflicts) : [];
    
    const conflict = conflictList.find(c => c.conflictId === conflictId);
    if (conflict) {
      conflict.selectedSuggestion = selectedSuggestion;
      await AsyncStorage.setItem('@aether_conflicts', JSON.stringify(conflictList));
    }
  } catch (error) {
    console.error('Failed to resolve conflict:', error);
  }
};
