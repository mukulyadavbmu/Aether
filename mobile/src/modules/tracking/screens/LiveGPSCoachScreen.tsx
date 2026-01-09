import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';

const LiveGPSCoachScreen = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [speed, setSpeed] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [coaching, setCoaching] = useState<string>('Ready to start');

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required');
      setIsTracking(false);
      return;
    }

    setIsTracking(true);
    setCoaching('GPS tracking active! Start moving...');
    
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 5,
      },
      (location) => {
        setCurrentLocation(location.coords);
        const speedKmh = (location.coords.speed || 0) * 3.6;
        setSpeed(speedKmh);
        
        if (speedKmh < 5) {
          setCoaching('🐢 Speed up! You\'re moving too slow');
        } else if (speedKmh >= 5 && speedKmh < 10) {
          setCoaching('✅ Good pace! Keep it up');
        } else {
          setCoaching('🔥 Excellent speed! You\'re crushing it!');
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Live GPS Coach</Text>
        <Text style={styles.subtitle}>Real-time pacing feedback</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Current Speed</Text>
          <Text style={styles.statValue}>{speed.toFixed(1)}</Text>
          <Text style={styles.statUnit}>km/h</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Distance</Text>
          <Text style={styles.statValue}>{(distance / 1000).toFixed(2)}</Text>
          <Text style={styles.statUnit}>km</Text>
        </View>
      </View>

      <View style={styles.coachingContainer}>
        <Text style={styles.coachingLabel}>Live Coaching</Text>
        <Text style={styles.coachingText}>{coaching}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isTracking && styles.buttonActive]}
        onPress={() => {
          if (isTracking) {
            setIsTracking(false);
            setCoaching('Tracking stopped');
          } else {
            startTracking();
          }
        }}
      >
        <Text style={styles.buttonText}>
          {isTracking ? '⏸ Stop Tracking' : '▶ Start Tracking'}
        </Text>
      </TouchableOpacity>

      <View style={styles.noteContainer}>
        <Text style={styles.note}>
          📍 Note: Map view requires custom development build.{'\n'}
          GPS tracking and coaching work in Expo Go!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statUnit: {
    fontSize: 16,
    color: '#999',
    marginTop: 5,
  },
  coachingContainer: {
    margin: 20,
    padding: 25,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coachingLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontWeight: '600',
  },
  coachingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonActive: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  noteContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  note: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LiveGPSCoachScreen;
