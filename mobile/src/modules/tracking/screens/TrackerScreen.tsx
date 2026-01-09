import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useAuthStore } from '../../auth/store/authStore';
import { API_URL } from '../../../config/api';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import squadService from '../../../services/squadService';
import { useTheme } from '../../../context/ThemeContext';

const TrackerScreen = () => {
  const navigation = useNavigation<any>();
  const [tracking, setTracking] = useState(false);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [locationSubscription, setLocationSubscription] = useState<any>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [lastLocation, setLastLocation] = useState<any>(null);
  const token = useAuthStore((state) => state.token);
  const { colors } = useTheme();

  useEffect(() => {
    let interval: any;
    if (tracking && startTime) {
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [tracking, startTime, locationSubscription]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const startTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for tracking');
        return;
      }

      const response = await axios.post(
        `${API_URL}/tracking/activity/start`,
        {
          startTime: new Date().toISOString(),
          activityType: 'run',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setActivityId(response.data.id);
      setStartTime(Date.now());
      setTracking(true);

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 10,
        },
        (location) => {
          setSpeed(location.coords.speed || 0);
          
          if (lastLocation) {
            const dist = calculateDistance(
              lastLocation.latitude,
              lastLocation.longitude,
              location.coords.latitude,
              location.coords.longitude
            );
            setDistance((prev) => prev + dist);
          }
          
          setLastLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );

      setLocationSubscription(subscription);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to start tracking');
    }
  };

  const stopTracking = async () => {
    try {
      if (locationSubscription) {
        locationSubscription.remove();
      }

      if (activityId) {
        const distanceKm = distance / 1000;
        
        await axios.post(
          `${API_URL}/tracking/activity/end`,
          {
            activityId,
            endTime: new Date().toISOString(),
            distance: distanceKm,
            duration,
            avgSpeed: speed * 3.6,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Sync to Squad progress
        try {
          await squadService.syncActivityToSquad(distanceKm, 'run', token!);
        } catch (error) {
          console.log('Squad sync skipped (not in a squad or network issue)');
        }

        Alert.alert('Success', `Activity saved! Distance: ${distanceKm.toFixed(2)} km`);
      }

      setTracking(false);
      setActivityId(null);
      setDistance(0);
      setDuration(0);
      setSpeed(0);
      setStartTime(null);
      setLastLocation(null);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to stop tracking');
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Distance</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>{(distance / 1000).toFixed(2)}</Text>
          <Text style={[styles.statUnit, { color: colors.textSecondary }]}>km</Text>
        </View>

        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Duration</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>{formatTime(duration)}</Text>
        </View>

        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Speed</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>{(speed * 3.6).toFixed(1)}</Text>
          <Text style={[styles.statUnit, { color: colors.textSecondary }]}>km/h</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          tracking 
            ? { backgroundColor: colors.error } 
            : { backgroundColor: colors.success }
        ]}
        onPress={tracking ? stopTracking : startTracking}
      >
        <Text style={styles.buttonText}>{tracking ? '⬛ Stop' : '▶ Start Tracking'}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Activities')}
      >
        <Text style={styles.buttonText}>View Activity History</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.secondary }]}
        onPress={() => navigation.navigate('LiveGPSCoach')}
      >
        <Text style={styles.buttonText}>🎯 Live GPS Coach</Text>
      </TouchableOpacity>

      {tracking && (
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.trackingStatus, { color: colors.success }]}>Tracking active...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 32,
    paddingVertical: 24,
    borderRadius: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 42,
    fontWeight: '800',
  },
  statUnit: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.6,
  },
  button: {
    padding: 18,
    borderRadius: 14,
    marginTop: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonStart: {
    backgroundColor: '#34C759',
  },
  buttonStop: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  historyButton: {
    backgroundColor: '#666',
    marginTop: 10,
  },
  coachButton: {
    backgroundColor: '#FF9500',
    marginTop: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34C759',
    marginRight: 8,
  },
  trackingStatus: {
    fontSize: 16,
    color: '#34C759',
  },
});

export default TrackerScreen;
