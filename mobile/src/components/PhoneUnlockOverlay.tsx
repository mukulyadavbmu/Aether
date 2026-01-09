import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

const PRIORITY_TASK_KEY = '@aether_priority_task';
const OVERLAY_SHOWN_KEY = '@aether_overlay_shown_today';

interface PhoneUnlockOverlayProps {
  visible: boolean;
  onDismiss: () => void;
}

const PhoneUnlockOverlay: React.FC<PhoneUnlockOverlayProps> = ({ visible, onDismiss }) => {
  const [priorityTask, setPriorityTask] = useState<string>('');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadPriorityTask();
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const loadPriorityTask = async () => {
    try {
      const task = await AsyncStorage.getItem(PRIORITY_TASK_KEY);
      if (task) {
        setPriorityTask(task);
      } else {
        setPriorityTask('Set your priority task in the app!');
      }
    } catch (error) {
      console.log('Error loading priority task:', error);
    }
  };

  const handleDismiss = async () => {
    const today = new Date().toDateString();
    await AsyncStorage.setItem(OVERLAY_SHOWN_KEY, today);
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  if (!visible || !priorityTask) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.container}>
          <Text style={styles.title}>⚡ YOUR PRIORITY TASK ⚡</Text>
          
          <View style={styles.taskContainer}>
            <Text style={styles.taskText}>{priorityTask}</Text>
          </View>

          <Text style={styles.reminderText}>
            This task is your FOCUS for today.
          </Text>
          <Text style={styles.subText}>
            Every distraction is a step away from your goal.
          </Text>

          <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
            <Text style={styles.dismissButtonText}>I UNDERSTAND - LET ME WORK</Text>
          </TouchableOpacity>

          <Text style={styles.warningText}>
            ⚠️ This reminder will show EVERY time you unlock your phone
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    borderWidth: 3,
    borderColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 25,
    letterSpacing: 2,
  },
  taskContainer: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  taskText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 28,
  },
  reminderText: {
    fontSize: 16,
    color: '#FF9500',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 25,
    fontStyle: 'italic',
  },
  dismissButton: {
    backgroundColor: '#FF3B30',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
  },
  dismissButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  warningText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PhoneUnlockOverlay;

// Hook to manage phone unlock detection
export const usePhoneUnlockDetection = () => {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        // Phone was unlocked
        const today = new Date().toDateString();
        const lastShown = await AsyncStorage.getItem(OVERLAY_SHOWN_KEY);
        
        // Show overlay if not shown today
        if (lastShown !== today) {
          setShowOverlay(true);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return { showOverlay, setShowOverlay };
};
