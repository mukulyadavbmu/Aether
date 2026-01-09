import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';

const RouteMapScreen = () => {
  const route = useRoute<any>();
  const { activity } = route.params;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [activity]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.placeholderContainer}>
        <Text style={styles.title}>📍 Route Map</Text>
        <Text style={styles.subtitle}>Map Feature</Text>
        <Text style={styles.note}>
          This feature requires a custom development build.{'\n\n'}
          Expo Go doesn't support native map libraries.{'\n\n'}
          Route data is still being tracked in the background.
        </Text>
        
        {activity && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Activity Stats</Text>
            <Text style={styles.stat}>Distance: {activity.distance || 'N/A'} km</Text>
            <Text style={styles.stat}>Duration: {activity.duration || 'N/A'} min</Text>
            <Text style={styles.stat}>Type: {activity.type || 'Unknown'}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 48,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  note: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  statsContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  stat: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RouteMapScreen;
