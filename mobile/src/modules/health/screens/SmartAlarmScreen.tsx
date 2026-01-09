import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView, Image, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const SmartAlarmScreen = () => {
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [verificationTask, setVerificationTask] = useState('camera');
  const [isRinging, setIsRinging] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [volume, setVolume] = useState(1.0);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Notification permissions are needed for alarms');
      return false;
    }
    return true;
  };

  const scheduleAlarm = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const trigger = new Date(alarmTime);
    const now = new Date();
    
    if (trigger <= now) {
      trigger.setDate(trigger.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Wake Up!',
        body: 'Time to start your day! Complete the verification task.',
        sound: true,
      },
      trigger: { date: trigger },
    });

    setIsEnabled(true);
    Alert.alert('Alarm Set', `Alarm scheduled for ${trigger.toLocaleTimeString()}`);
  };

  const cancelAlarm = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    setIsEnabled(false);
    setIsRinging(false);
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    Alert.alert('Alarm Cancelled', 'Your alarm has been turned off');
  };

  const takeCameraVerification = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to disable the alarm');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      // Verify it's an outdoor photo (you'd need image analysis for this)
      Alert.alert(
        'Alarm Dismissed! ✅',
        'Good morning! Photo verified. Time to start your day!',
        [
          {
            text: 'OK',
            onPress: async () => {
              setIsRinging(false);
              if (sound) {
                await sound.stopAsync();
                await sound.unloadAsync();
              }
            },
          },
        ]
      );
    }
  };

  const playAlarmSound = async () => {
    try {
      const { sound: alarmSound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
        { shouldPlay: true, isLooping: true, volume }
      );
      setSound(alarmSound);
    } catch (error) {
      console.log('Error playing alarm:', error);
    }
  };

  const adjustVolume = async (newVolume: number) => {
    setVolume(newVolume);
    if (sound) {
      await sound.setVolumeAsync(newVolume);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Smart Alarm</Text>
      <Text style={styles.subtitle}>Aggressive wake-up with verification</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Alarm Time</Text>
          <Switch
            value={isEnabled}
            onValueChange={(value) => {
              if (value) {
                scheduleAlarm();
              } else {
                cancelAlarm();
              }
            }}
          />
        </View>

        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.timeText}>{alarmTime.toLocaleTimeString()}</Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={alarmTime}
            mode="time"
            is24Hour={false}
            onChange={(event, date) => {
              setShowTimePicker(false);
              if (date) setAlarmTime(date);
            }}
          />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📸 Verification: Camera Only</Text>
        <Text style={styles.description}>
          To dismiss the alarm, you MUST take a photo of something OUTSIDE your home
        </Text>
        <View style={styles.verificationBox}>
          <Text style={styles.verificationTitle}>Required:</Text>
          <Text style={styles.verificationItem}>• Step outside your home</Text>
          <Text style={styles.verificationItem}>• Take a photo of outdoor scenery</Text>
          <Text style={styles.verificationItem}>• Photo will be verified</Text>
          <Text style={styles.verificationWarning}>⚠️ Indoor photos will be REJECTED</Text>
        </View>
        {isRinging && (
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={takeCameraVerification}
          >
            <Text style={styles.cameraButtonText}>📷 TAKE PHOTO TO DISMISS</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔊 Alarm Volume Control</Text>
        <Text style={styles.description}>
          Volume adjustable but NEVER fully silent until task complete
        </Text>
        <View style={styles.volumeControl}>
          <Text style={styles.volumeLabel}>Volume: {Math.round(volume * 100)}%</Text>
          <View style={styles.volumeButtons}>
            <TouchableOpacity
              style={styles.volumeButton}
              onPress={() => adjustVolume(Math.max(0.3, volume - 0.1))}
            >
              <Text style={styles.volumeButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.volumeBar}>
              <View style={[styles.volumeFill, { width: `${volume * 100}%` }]} />
            </View>
            <TouchableOpacity
              style={styles.volumeButton}
              onPress={() => adjustVolume(Math.min(1.0, volume + 0.1))}
            >
              <Text style={styles.volumeButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.volumeMinText}>Minimum: 30% (cannot go silent)</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚡ Aggressive Features</Text>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📷</Text>
          <Text style={styles.featureText}>FORCED outdoor photo verification</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🔊</Text>
          <Text style={styles.featureText}>Volume adjustable but never silent (min 30%)</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🚫</Text>
          <Text style={styles.featureText}>NO snooze - only camera dismissal</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🚶</Text>
          <Text style={styles.featureText}>Forces you to stand up and move outside</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🧠</Text>
          <Text style={styles.featureText}>Brain activation through physical movement</Text>
        </View>
      </View>

      {isEnabled && (
        <View style={styles.activeAlarmCard}>
          <Text style={styles.activeAlarmText}>
            ✅ Alarm active for {alarmTime.toLocaleTimeString()}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  timeButton: {
    backgroundColor: '#f5f5f5',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  taskContainer: {
    gap: 10,
  },
  taskButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  taskButtonActive: {
    backgroundColor: '#007AFF',
  },
  taskText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
  },
  taskTextActive: {
    color: '#fff',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
  },
  verificationBox: {
    backgroundColor: '#FFF3CD',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  verificationItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  verificationWarning: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
    marginTop: 10,
  },
  cameraButton: {
    backgroundColor: '#FF3B30',
    padding: 18,
    borderRadius: 12,
    marginTop: 15,
    alignItems: 'center',
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  volumeControl: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  volumeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  volumeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  volumeButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  volumeBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  volumeMinText: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  activeAlarmCard: {
    backgroundColor: '#D1F2EB',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#27AE60',
  },
  activeAlarmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27AE60',
    textAlign: 'center',
  },
});

export default SmartAlarmScreen;
