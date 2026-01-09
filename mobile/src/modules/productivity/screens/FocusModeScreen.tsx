import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const FocusModeScreen = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (mode === 'work') {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      Alert.alert(
        'Work Session Complete! 🎉',
        `Take a ${newSessions % 4 === 0 ? '15' : '5'} minute break`,
        [
          {
            text: 'Start Break',
            onPress: () => {
              setMode('break');
              setTimeLeft((newSessions % 4 === 0 ? 15 : 5) * 60);
              setIsActive(true);
            },
          },
        ]
      );
    } else {
      Alert.alert('Break Complete!', 'Ready for another focus session?', [
        {
          text: 'Start Work',
          onPress: () => {
            setMode('work');
            setTimeLeft(25 * 60);
            setIsActive(true);
          },
        },
      ]);
    }
  };

  const startTimer = () => {
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Focus Mode</Text>
      <Text style={styles.subtitle}>Pomodoro Technique</Text>

      <View style={styles.modeContainer}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'work' && styles.modeButtonActive]}
          onPress={() => {
            setMode('work');
            setTimeLeft(25 * 60);
            setIsActive(false);
          }}
        >
          <Text style={[styles.modeText, mode === 'work' && styles.modeTextActive]}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'break' && styles.modeButtonActive]}
          onPress={() => {
            setMode('break');
            setTimeLeft(5 * 60);
            setIsActive(false);
          }}
        >
          <Text style={[styles.modeText, mode === 'break' && styles.modeTextActive]}>Break</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.sessionText}>Session #{sessions + 1}</Text>
      </View>

      <View style={styles.controls}>
        {!isActive ? (
          <TouchableOpacity style={styles.startButton} onPress={startTimer}>
            <Text style={styles.buttonText}>▶ Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.pauseButton} onPress={pauseTimer}>
            <Text style={styles.buttonText}>⏸ Pause</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
          <Text style={styles.buttonText}>↻ Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Today's Focus</Text>
        <Text style={styles.statsValue}>{sessions} sessions completed</Text>
        <Text style={styles.statsSubtext}>{sessions * 25} minutes of deep work</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🧠 Pomodoro Technique</Text>
        <Text style={styles.infoText}>• Work for 25 minutes</Text>
        <Text style={styles.infoText}>• Take 5 minute break</Text>
        <Text style={styles.infoText}>• After 4 sessions, take 15 minute break</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  modeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 40,
  },
  modeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#007AFF',
  },
  modeText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#fff',
  },
  timerContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  sessionText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  controls: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  startButton: {
    flex: 1,
    backgroundColor: '#34C759',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  pauseButton: {
    flex: 1,
    backgroundColor: '#FF9500',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#666',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  statsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statsSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default FocusModeScreen;
