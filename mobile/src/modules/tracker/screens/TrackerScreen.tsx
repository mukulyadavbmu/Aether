import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const TrackerScreen = () => {
  const [isTracking, setIsTracking] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>Map View</Text>
        <Text style={styles.mapSubtext}>GPS tracking will appear here</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Distance</Text>
          <Text style={styles.statValue}>0.0 km</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Speed</Text>
          <Text style={styles.statValue}>0.0 km/h</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>00:00</Text>
        </View>
      </View>

      <View style={styles.pacingCard}>
        <Text style={styles.pacingText}>Set target time to enable pacing coach</Text>
      </View>

      <TouchableOpacity
        style={[styles.trackButton, isTracking && styles.trackButtonActive]}
        onPress={() => setIsTracking(!isTracking)}
      >
        <Text style={styles.trackButtonText}>
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapPlaceholder: {
    height: 300,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#999',
  },
  mapSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  pacingCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  pacingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  trackButton: {
    backgroundColor: '#34C759',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  trackButtonActive: {
    backgroundColor: '#FF3B30',
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TrackerScreen;
