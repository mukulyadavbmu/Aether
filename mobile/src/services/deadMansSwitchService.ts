import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FocusSession {
  id: string;
  startTime: Date;
  duration: number; // in minutes
  type: 'deep-work' | 'study' | 'creative';
  isActive: boolean;
}

const FOCUS_SESSION_KEY = '@aether_focus_session';
const MOVEMENT_THRESHOLD = 0.1; // km - if user hasn't moved this much, trigger alarm
const SCROLL_THRESHOLD = 50; // accelerometer events - detects phone scrolling
const CHECK_INTERVAL = 60000; // Check every 1 minute

let focusCheckInterval: NodeJS.Timeout | null = null;
let scrollEventCount = 0;
let lastLocation: Location.LocationObject | null = null;
let alarmVolume = 0.2; // Start at 20% volume

export const startFocusSession = async (type: FocusSession['type'], durationMinutes: number) => {
  const session: FocusSession = {
    id: Date.now().toString(),
    startTime: new Date(),
    duration: durationMinutes,
    type,
    isActive: true,
  };

  await AsyncStorage.setItem(FOCUS_SESSION_KEY, JSON.stringify(session));

  // Request location permission
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === 'granted') {
    lastLocation = await Location.getCurrentPositionAsync({});
  }

  // Start monitoring
  startMonitoring();

  // Schedule end of session
  setTimeout(() => {
    endFocusSession();
  }, durationMinutes * 60 * 1000);

  return session;
};

const startMonitoring = () => {
  // Monitor accelerometer for scrolling detection
  Accelerometer.setUpdateInterval(100);
  const accelerometerSubscription = Accelerometer.addListener((data) => {
    const totalAcceleration = Math.abs(data.x) + Math.abs(data.y) + Math.abs(data.z);
    
    // Detect rapid movement (scrolling)
    if (totalAcceleration > 1.5) {
      scrollEventCount++;
    }
  });

  // Check for violations every minute
  focusCheckInterval = setInterval(async () => {
    await checkForViolations();
  }, CHECK_INTERVAL);

  return accelerometerSubscription;
};

const checkForViolations = async () => {
  const sessionData = await AsyncStorage.getItem(FOCUS_SESSION_KEY);
  if (!sessionData) return;

  const session: FocusSession = JSON.parse(sessionData);
  if (!session.isActive) return;

  let violationType: 'no-movement' | 'scrolling' | null = null;

  // Check 1: Has user moved? (GPS check)
  try {
    const currentLocation = await Location.getCurrentPositionAsync({});
    if (lastLocation) {
      const distance = calculateDistance(
        lastLocation.coords.latitude,
        lastLocation.coords.longitude,
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );

      if (distance < MOVEMENT_THRESHOLD) {
        violationType = 'no-movement';
      }
    }
    lastLocation = currentLocation;
  } catch (error) {
    console.log('GPS check failed:', error);
  }

  // Check 2: Is user scrolling on phone?
  if (scrollEventCount > SCROLL_THRESHOLD) {
    violationType = 'scrolling';
  }

  // Reset scroll counter
  scrollEventCount = 0;

  // Trigger escalating alarm if violation detected
  if (violationType) {
    await triggerEscalatingAlarm(violationType);
  } else {
    // Reset alarm volume if user is compliant
    alarmVolume = 0.2;
  }
};

const triggerEscalatingAlarm = async (violationType: 'no-movement' | 'scrolling') => {
  const message =
    violationType === 'no-movement'
      ? '🚨 FOCUS VIOLATION: No movement detected! Get back to work!'
      : '🚨 FOCUS VIOLATION: Phone scrolling detected! Stop procrastinating!';

  // Send notification with increasing urgency
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚠️ Dead Man\'s Switch Triggered',
      body: message,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      vibrate: [0, 250, 250, 250], // Aggressive vibration pattern
      data: { volume: alarmVolume },
    },
    trigger: null, // Immediate
  });

  // Increase alarm volume for next violation
  alarmVolume = Math.min(1.0, alarmVolume + 0.15); // Max 100% volume

  // Log violation
  await logViolation(violationType);
};

const logViolation = async (type: string) => {
  const violations = await AsyncStorage.getItem('@aether_focus_violations');
  const violationList = violations ? JSON.parse(violations) : [];
  
  violationList.push({
    type,
    timestamp: new Date().toISOString(),
    volume: alarmVolume,
  });

  await AsyncStorage.setItem('@aether_focus_violations', JSON.stringify(violationList));
};

export const endFocusSession = async () => {
  const sessionData = await AsyncStorage.getItem(FOCUS_SESSION_KEY);
  if (sessionData) {
    const session: FocusSession = JSON.parse(sessionData);
    session.isActive = false;
    await AsyncStorage.setItem(FOCUS_SESSION_KEY, JSON.stringify(session));
  }

  // Stop monitoring
  if (focusCheckInterval) {
    clearInterval(focusCheckInterval);
    focusCheckInterval = null;
  }

  // Reset alarm volume
  alarmVolume = 0.2;

  // Send completion notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✅ Focus Session Complete!',
      body: 'Great work! Check your violation report.',
      sound: true,
    },
    trigger: null,
  });
};

export const getCurrentFocusSession = async (): Promise<FocusSession | null> => {
  const sessionData = await AsyncStorage.getItem(FOCUS_SESSION_KEY);
  return sessionData ? JSON.parse(sessionData) : null;
};

export const getFocusViolations = async () => {
  const violations = await AsyncStorage.getItem('@aether_focus_violations');
  return violations ? JSON.parse(violations) : [];
};

// Haversine formula to calculate distance between two GPS coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
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
