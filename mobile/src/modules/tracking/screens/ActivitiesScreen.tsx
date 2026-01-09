import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../../auth/store/authStore';import { useNavigation } from '@react-navigation/native';import { API_URL } from '../../../config/api';
import axios from 'axios';

interface Activity {
  id: string;
  activityType: string;
  distance: number;
  duration: number;
  avgSpeed: number;
  startTime: string;
  endTime: string;
  route?: any; // Optional route data for map display
}

const ActivitiesScreen = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore((state) => state.token);  const navigation = useNavigation<any>();
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/tracking/activities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivities(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity History</Text>
        <TouchableOpacity onPress={fetchActivities}>
          <Text style={styles.refreshButton}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : activities.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No activities yet</Text>
          <Text style={styles.emptySubtext}>Start tracking to see your activities here</Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityType}>
                  {item.activityType === 'run' ? '🏃' : item.activityType === 'walk' ? '🚶' : '🚴'} {item.activityType.toUpperCase()}
                </Text>
                <Text style={styles.date}>{formatDate(item.startTime)}</Text>
              </View>
              
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Distance</Text>
                  <Text style={styles.statValue}>{(item.distance / 1000).toFixed(2)} km</Text>
                </View>
                
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Duration</Text>
                  <Text style={styles.statValue}>{formatDuration(item.duration)}</Text>
                </View>
                
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Avg Speed</Text>
                  <Text style={styles.statValue}>{item.avgSpeed.toFixed(1)} km/h</Text>
                </View>
              </View>

              {item.route && (
                <TouchableOpacity 
                  style={styles.viewMapButton}
                  onPress={() => navigation.navigate('RouteMap' as any, { activity: item })}
                >
                  <Text style={styles.viewMapText}>🗺️ View on Map</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  refreshButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 15,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  activityType: {
    fontSize: 18,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  viewMapButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    alignItems: 'center',
  },
  viewMapText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default ActivitiesScreen;
