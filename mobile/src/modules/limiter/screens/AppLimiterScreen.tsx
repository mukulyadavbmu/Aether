import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useAuthStore } from '../../auth/store/authStore';

interface AppUsage {
  packageName: string;
  appName: string;
  usageTime: number;
}

const AppLimiterScreen = () => {
  const [usage, setUsage] = useState<AppUsage[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const response = await axios.get(`${API_URL}/limiter/usage`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsage(response.data);
      const total = response.data.reduce((sum: number, app: AppUsage) => sum + app.usageTime, 0);
      setTotalTime(total);
    } catch (error) {
      console.error('Failed to load usage:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const setLimit = async (packageName: string) => {
    Alert.prompt(
      'Set Time Limit',
      'Enter daily limit in minutes:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set',
          onPress: async (value?: string) => {
            if (!value) return;
            try {
              await axios.post(
                `${API_URL}/limiter/limits`,
                {
                  packageName,
                  dailyLimitMinutes: parseInt(value),
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              Alert.alert('Success', `Limit set to ${value} minutes`);
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to set limit');
            }
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>App Usage</Text>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Screen Time Today</Text>
        <Text style={styles.totalValue}>{formatTime(totalTime)}</Text>
      </View>

      <Text style={styles.sectionTitle}>App Breakdown</Text>

      {usage.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>📱</Text>
          <Text style={styles.emptySubtext}>No usage data yet</Text>
          <Text style={styles.emptySubtext}>Usage tracking coming soon</Text>
        </View>
      ) : (
        usage.map((app, index) => {
          const percentage = totalTime > 0 ? (app.usageTime / totalTime) * 100 : 0;
          return (
            <View key={index} style={styles.appCard}>
              <View style={styles.appHeader}>
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{app.appName}</Text>
                  <Text style={styles.packageName}>{app.packageName}</Text>
                </View>
                <Text style={styles.appTime}>{formatTime(app.usageTime)}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${percentage}%` }]} />
              </View>
              <TouchableOpacity 
                style={styles.limitButton}
                onPress={() => setLimit(app.packageName)}
              >
                <Text style={styles.limitButtonText}>Set Limit</Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ About App Limiter</Text>
        <Text style={styles.infoText}>
          This feature tracks your app usage and helps you set daily limits. 
          Usage tracking requires special permissions and will be enabled in a future update.
        </Text>
      </View>
    </ScrollView>
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
    marginBottom: 20,
  },
  totalCard: {
    backgroundColor: '#007AFF',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  totalLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  totalValue: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  appCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  packageName: {
    fontSize: 12,
    color: '#666',
  },
  appTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  limitButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  limitButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});

export default AppLimiterScreen;
