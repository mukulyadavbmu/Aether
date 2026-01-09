import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useAuthStore } from '../../auth/store/authStore';

const LiveTrackingScreen = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [avgSpeed, setAvgSpeed] = useState(0);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required for tracking');
      return false;
    }
    return true;
  };

  const startTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    try {
      const response = await axios.post(
        `${API_URL}/tracking/activity/start`,
        { activityType: 'run' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setActivityId(response.data.id);
      setIsTracking(true);
      setDistance(0);
      setDuration(0);
      setAvgSpeed(0);

      // Start location tracking
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 10,
        },
        (location) => {
          // Update distance calculation here
          // For demo, incrementing by 0.01 km per update
          setDistance((prev) => prev + 0.01);
          setAvgSpeed(location.coords.speed || 0);
        }
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to start tracking');
    }
  };

  const stopTracking = async () => {
    if (!activityId) return;

    try {
      await axios.post(
        `${API_URL}/tracking/activity/end`,
        {
          activityId,
          distance: parseFloat(distance.toFixed(2)),
          duration,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', `Activity saved!\nDistance: ${distance.toFixed(2)} km\nTime: ${formatDuration(duration)}`);
      setIsTracking(false);
      setActivityId(null);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to stop tracking');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GPS Tracking</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{distance.toFixed(2)}</Text>
          <Text style={styles.statLabel}>KM</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{formatDuration(duration)}</Text>
          <Text style={styles.statLabel}>TIME</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{(avgSpeed * 3.6).toFixed(1)}</Text>
          <Text style={styles.statLabel}>KM/H</Text>
        </View>
      </View>

      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>🗺️ Map View</Text>
        <Text style={styles.mapSubtext}>Route will be displayed here</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isTracking ? styles.stopButton : styles.startButton]}
        onPress={isTracking ? stopTracking : startTracking}
      >
        <Text style={styles.buttonText}>{isTracking ? 'STOP' : 'START'}</Text>
      </TouchableOpacity>

      {isTracking && (
        <Text style={styles.trackingText}>📍 Tracking in progress...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  mapPlaceholder: {
    height: 300,
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  mapText: {
    fontSize: 32,
    marginBottom: 10,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    padding: 20,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#28a745',
  },
  stopButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  trackingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#28a745',
  },
});

export default LiveTrackingScreen;
