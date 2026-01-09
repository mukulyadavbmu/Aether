import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useAuthStore } from '../../auth/store/authStore';
import { 
  getInstalledApps, 
  setAppLimit, 
  getAppLimits, 
  getTodayUsageSummary,
  initializeUsageTracking,
  cleanupUsageTracking,
  requestGracePeriod,
  isGhostModeActive,
  activateGhostMode,
  deactivateGhostMode,
  requestUsagePermission
} from '../../../services/usageTrackingService';
import { useTheme } from '../../../context/ThemeContext';

const AppLimiterScreen = () => {
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [dailyLimit, setDailyLimit] = useState('');
  const [limits, setLimits] = useState<any[]>([]);
  const [usageSummary, setUsageSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAppList, setShowAppList] = useState(false);
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const token = useAuthStore((state) => state.token);
  const { colors } = useTheme();

  useEffect(() => {
    initializeUsageTracking();
    fetchLimitsAndUsage();
    checkPermission();
    
    // Refresh every minute
    const interval = setInterval(fetchLimitsAndUsage, 60000);
    
    return () => {
      cleanupUsageTracking();
      clearInterval(interval);
    };
  }, []);

  const checkPermission = async () => {
    if (Platform.OS === 'android') {
      // Check if we have usage permission
      // For now, this will always be false in Expo Go
      setHasPermission(false);
    }
  };

  const handleRequestPermission = async () => {
    Alert.alert(
      'App Usage Permission Required',
      Platform.OS === 'android'
        ? 'Real app usage tracking requires:\n\n' +
          '1. A development build (not Expo Go)\n' +
          '2. Native module for UsageStatsManager\n' +
          '3. PACKAGE_USAGE_STATS permission\n\n' +
          'For now, you can set limits on mock apps for testing.'
        : 'iOS does not allow tracking usage of other apps due to privacy restrictions.',
      [{ text: 'OK' }]
    );
  };

  const fetchLimitsAndUsage = async () => {
    const [limitsData, summaryData, ghostMode] = await Promise.all([
      getAppLimits(),
      getTodayUsageSummary(),
      isGhostModeActive(),
    ]);
    setLimits(limitsData);
    setUsageSummary(summaryData);
    setIsGhostMode(ghostMode);
  };

  const handleSetLimit = async () => {
    if (!selectedApp || !dailyLimit) {
      Alert.alert('Error', 'Please select an app and enter a limit');
      return;
    }

    setLoading(true);
    try {
      await setAppLimit(selectedApp.name, parseInt(dailyLimit));
      Alert.alert('Success', `Limit set for ${selectedApp.name}: ${dailyLimit} minutes/day`);
      setSelectedApp(null);
      setDailyLimit('');
      setShowAppList(false);
      await fetchLimitsAndUsage();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to set limit');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestGrace = async (appName: string) => {
    Alert.alert(
      '⏱️ Request 2-Minute Grace Period?',
      `This will give you EMERGENCY 2-minute access to ${appName}. Use it wisely - you only get ONE per day!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Access',
          onPress: async () => {
            const granted = await requestGracePeriod(appName);
            if (granted) {
              Alert.alert('✅ Access Granted', 'You have 2 minutes. Make it count!');
            }
          },
        },
      ]
    );
  };

  const handleToggleGhostMode = async () => {
    if (isGhostMode) {
      Alert.alert(
        'Deactivate Ghost Mode?',
        'This will restore 2-minute grace periods for blocked apps.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Deactivate',
            onPress: async () => {
              await deactivateGhostMode();
              await fetchLimitsAndUsage();
              Alert.alert('Ghost Mode Deactivated', 'Grace periods are now available again.');
            },
          },
        ]
      );
    } else {
      Alert.alert(
        '👻 Activate Ghost Mode?',
        'WARNING: This will COMPLETELY BLOCK all distracting apps with NO grace period until you complete your weekly goal. This is EXTREME discipline mode.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'ACTIVATE',
            style: 'destructive',
            onPress: async () => {
              await activateGhostMode();
              await fetchLimitsAndUsage();
            },
          },
        ]
      );
    }
  };

  const [installedApps, setInstalledApps] = useState<any[]>([]);

  useEffect(() => {
    const loadApps = async () => {
      const apps = await getInstalledApps();
      setInstalledApps(apps);
    };
    loadApps();
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>App Usage Limiter</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Set daily time limits for distracting apps</Text>

      {Platform.OS === 'android' && (
        <TouchableOpacity 
          style={[styles.permissionCard, { backgroundColor: colors.card, borderColor: colors.warning }]}
          onPress={handleRequestPermission}
        >
          <Text style={[styles.permissionIcon]}>⚠️</Text>
          <Text style={[styles.permissionTitle, { color: colors.warning }]}>
            Permission Required
          </Text>
          <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
            Tap to learn about app usage tracking requirements
          </Text>
        </TouchableOpacity>
      )}

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>📊 Today's Usage Summary</Text>
        {usageSummary.length > 0 ? (
          usageSummary.map((item, index) => (
            <View key={index} style={styles.usageItem}>
              <View style={styles.usageHeader}>
                <Text style={[styles.usageAppName, { color: colors.text }]}>{item.appName}</Text>
                <Text style={[styles.usageStatus, item.isBlocked && styles.blockedStatus]}>
                  {item.isBlocked ? '🚫 BLOCKED' : '✅ Active'}
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min(item.percentageUsed, 100)}%`, backgroundColor: colors.primary },
                    item.isBlocked && styles.blockedProgress
                  ]} 
                />
              </View>
              <Text style={styles.usageText}>
                {item.usedMinutes} / {item.limitMinutes} minutes ({item.percentageUsed}%)
              </Text>
              {item.isBlocked && (
                <TouchableOpacity 
                  style={styles.graceButton}
                  onPress={() => handleRequestGrace(item.appName)}
                >
                  <Text style={styles.graceButtonText}>⏱️ Request 2-Min Access</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No usage data yet. Set limits to start tracking.</Text>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.ghostModeHeader}>
          <View>
            <Text style={styles.cardTitle}>👻 Ghost Mode</Text>
            <Text style={styles.ghostModeSubtext}>
              {isGhostMode ? 'ACTIVE - No mercy mode' : 'Inactive - Grace periods allowed'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.ghostModeButton, isGhostMode && styles.ghostModeActive]}
            onPress={handleToggleGhostMode}
          >
            <Text style={styles.ghostModeButtonText}>
              {isGhostMode ? 'DEACTIVATE' : 'ACTIVATE'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.ghostModeDescription}>
          {isGhostMode 
            ? '🔥 All distracting apps are HARD BLOCKED. Complete your weekly goal to unlock.' 
            : 'When activated, removes all 2-minute grace periods. Use when you need EXTREME discipline.'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>➕ Add New Limit</Text>
        
        <TouchableOpacity 
          style={styles.appSelector}
          onPress={() => setShowAppList(!showAppList)}
        >
          <Text style={styles.appSelectorText}>
            {selectedApp ? `${selectedApp.icon} ${selectedApp.name}` : 'Select an app...'}
          </Text>
          <Text style={styles.arrow}>{showAppList ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showAppList && (
          <View style={styles.appList}>
            {installedApps.map((app, index) => (
              <TouchableOpacity
                key={index}
                style={styles.appListItem}
                onPress={() => {
                  setSelectedApp(app);
                  setShowAppList(false);
                }}
              >
                <Text style={styles.appListIcon}>{app.icon}</Text>
                <Text style={styles.appListText}>{app.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Daily Limit (minutes)</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g., 30"
          value={dailyLimit}
          onChangeText={setDailyLimit}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSetLimit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Setting...' : 'Set Limit'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚙️ Active Limits</Text>
        {limits.length === 0 ? (
          <Text style={styles.emptyText}>No limits set yet</Text>
        ) : (
          limits.map((limit, index) => (
            <View key={index} style={styles.limitCard}>
              <Text style={styles.limitAppName}>{limit.appName}</Text>
              <Text style={styles.limitTime}>{limit.dailyLimit} min/day</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ How it works</Text>
        <Text style={styles.infoText}>
          • Usage tracked automatically{'\n'}
          • 2-minute grace period (ONE per app per day){'\n'}
          • Ghost Mode = HARD BLOCK (no grace){'\n'}
          • Daily reset at midnight{'\n'}
          • 🚫 status = app is blocked
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    padding: 20,
    paddingBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  permissionCard: {
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  permissionIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  usageItem: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  usageAppName: {
    fontSize: 16,
    fontWeight: '600',
  },
  usageStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
  },
  blockedStatus: {
    color: '#FF3B30',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  blockedProgress: {
    backgroundColor: '#FF3B30',
  },
  usageText: {
    fontSize: 14,
    color: '#666',
  },
  appSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  appSelectorText: {
    fontSize: 16,
  },
  arrow: {
    fontSize: 16,
    color: '#666',
  },
  appList: {
    maxHeight: 200,
    marginBottom: 15,
  },
  appListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  appListIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  appListText: {
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
  limitCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitAppName: {
    fontSize: 16,
    fontWeight: '600',
  },
  limitTime: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  graceButton: {
    backgroundColor: '#FF9500',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  graceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  ghostModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ghostModeSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  ghostModeButton: {
    backgroundColor: '#666',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  ghostModeActive: {
    backgroundColor: '#FF3B30',
  },
  ghostModeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  ghostModeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default AppLimiterScreen;
