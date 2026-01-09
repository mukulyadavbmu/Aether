import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import {
  startFocusSession,
  endFocusSession,
  getCurrentFocusSession,
  getFocusViolations,
} from '../../../services/deadMansSwitchService';

const DeadMansSwitchScreen = () => {
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionType, setSessionType] = useState<'deep-work' | 'study' | 'creative'>('deep-work');
  const [duration, setDuration] = useState(60); // minutes
  const [violations, setViolations] = useState<any[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    checkActiveSession();
    loadViolations();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sessionActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionActive, timeRemaining]);

  const checkActiveSession = async () => {
    const session = await getCurrentFocusSession();
    if (session && session.isActive) {
      setSessionActive(true);
      const elapsed = Date.now() - new Date(session.startTime).getTime();
      const remaining = Math.max(0, (session.duration * 60 * 1000 - elapsed) / 1000);
      setTimeRemaining(Math.floor(remaining));
    }
  };

  const loadViolations = async () => {
    const data = await getFocusViolations();
    setViolations(data.slice(-10)); // Last 10 violations
  };

  const handleStartSession = async () => {
    try {
      await startFocusSession(sessionType, duration);
      setSessionActive(true);
      setTimeRemaining(duration * 60);
      Alert.alert(
        '🎯 Focus Session Started',
        `Dead Man's Switch is monitoring you for ${duration} minutes. No scrolling, no slacking!`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to start focus session');
    }
  };

  const handleEndSession = async () => {
    Alert.alert(
      'End Session?',
      'Are you sure you want to end this focus session early?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: async () => {
            await endFocusSession();
            setSessionActive(false);
            setTimeRemaining(0);
            await loadViolations();
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚡ Dead Man's Switch</Text>
        <Text style={styles.subtitle}>Multi-Sensor Focus Enforcement</Text>
      </View>

      {sessionActive ? (
        <View style={styles.activeSession}>
          <Text style={styles.timerLabel}>Time Remaining</Text>
          <Text style={styles.timer}>{formatTime(timeRemaining)}</Text>
          
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              🚨 ACTIVE MONITORING 🚨{'\n'}
              GPS + Accelerometer Tracking{'\n'}
              Violations will trigger escalating alarms
            </Text>
          </View>

          <TouchableOpacity style={styles.endButton} onPress={handleEndSession}>
            <Text style={styles.endButtonText}>End Session</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.setupSession}>
          <Text style={styles.sectionTitle}>Session Type</Text>
          <View style={styles.typeButtons}>
            {(['deep-work', 'study', 'creative'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeButton, sessionType === type && styles.typeButtonActive]}
                onPress={() => setSessionType(type)}
              >
                <Text style={[styles.typeButtonText, sessionType === type && styles.typeButtonTextActive]}>
                  {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Duration (minutes)</Text>
          <View style={styles.durationButtons}>
            {[30, 60, 90, 120].map((mins) => (
              <TouchableOpacity
                key={mins}
                style={[styles.durationButton, duration === mins && styles.durationButtonActive]}
                onPress={() => setDuration(mins)}
              >
                <Text style={[styles.durationText, duration === mins && styles.durationTextActive]}>
                  {mins}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📍 How it works:</Text>
            <Text style={styles.infoText}>
              • GPS monitors if you've moved (desk → couch = violation){'\n'}
              • Accelerometer detects phone scrolling{'\n'}
              • Violations trigger escalating alarms (20% → 100%){'\n'}
              • All violations logged for AI analysis
            </Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
            <Text style={styles.startButtonText}>🔒 Start Locked Focus Session</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.violationsSection}>
        <Text style={styles.sectionTitle}>Recent Violations</Text>
        {violations.length === 0 ? (
          <Text style={styles.noViolations}>No violations yet! 🎉</Text>
        ) : (
          violations.reverse().map((v, index) => (
            <View key={index} style={styles.violationCard}>
              <View style={styles.violationHeader}>
                <Text style={styles.violationType}>
                  {v.type === 'no-movement' ? '📍 No Movement' : '📱 Phone Scrolling'}
                </Text>
                <Text style={styles.violationVolume}>Vol: {Math.round(v.volume * 100)}%</Text>
              </View>
              <Text style={styles.violationTime}>
                {new Date(v.timestamp).toLocaleString()}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    backgroundColor: '#1E1E1E',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#00F2FF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00F2FF',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  activeSession: {
    padding: 30,
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timer: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#00FF41',
    marginBottom: 30,
    textShadowColor: '#00FF41',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  warningBox: {
    backgroundColor: '#FF5F1F',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
  },
  warningText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
  },
  endButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  setupSession: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00F2FF',
    marginBottom: 15,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  typeButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  typeButtonActive: {
    borderColor: '#00F2FF',
    backgroundColor: '#00F2FF20',
  },
  typeButtonText: {
    color: '#888',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#00F2FF',
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  durationButton: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  durationButtonActive: {
    borderColor: '#00FF41',
    backgroundColor: '#00FF4120',
  },
  durationText: {
    color: '#888',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  durationTextActive: {
    color: '#00FF41',
  },
  infoBox: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00F2FF',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00F2FF',
    marginBottom: 10,
  },
  infoText: {
    color: '#888',
    fontSize: 14,
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: '#00FF41',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#00FF41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  startButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  violationsSection: {
    padding: 20,
  },
  noViolations: {
    color: '#888',
    textAlign: 'center',
    padding: 30,
    fontSize: 16,
  },
  violationCard: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5F1F',
  },
  violationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  violationType: {
    color: '#FF5F1F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  violationVolume: {
    color: '#888',
    fontSize: 14,
  },
  violationTime: {
    color: '#666',
    fontSize: 12,
  },
});

export default DeadMansSwitchScreen;
