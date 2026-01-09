import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../auth/store/authStore';
import { API_URL } from '../../../config/api';
import axios from 'axios';
import { useTheme } from '../../../context/ThemeContext';

const CoachScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [nutritionStats, setNutritionStats] = useState<any>(null);
  const token = useAuthStore((state) => state.token);
  const { colors } = useTheme();

  React.useEffect(() => {
    fetchNutritionStats();
  }, []);

  const fetchNutritionStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/health/meals/weekly-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNutritionStats(response.data);
    } catch (error) {
      console.log('Failed to fetch nutrition stats');
    }
  };

  const generateWorkout = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/health/workout/generate`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkout(response.data);
      setModalVisible(true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to generate workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🍽️ Nutrition</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('MealLogging')}
        >
          <Text style={styles.buttonText}>Log Meal</Text>
        </TouchableOpacity>
        
        {nutritionStats ? (
          <View style={styles.nutritionStatsCard}>
            <Text style={styles.nutritionTitle}>This Week's Nutrition</Text>
            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{nutritionStats.totalCalories || 0}</Text>
                <Text style={styles.macroLabel}>Calories</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{nutritionStats.totalProtein || 0}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{nutritionStats.totalCarbs || 0}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{nutritionStats.totalFat || 0}g</Text>
                <Text style={styles.macroLabel}>Fat</Text>
              </View>
            </View>
            <View style={styles.averageRow}>
              <Text style={styles.averageText}>
                Daily Average: {Math.round((nutritionStats.totalCalories || 0) / 7)} cal
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.statsCard}>
            <Text style={styles.statsText}>Log meals to see nutrition stats</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💪 Workout Generator</Text>
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={generateWorkout}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Generating...' : 'Generate AI Workout Plan'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.description}>
          Get personalized workout based on your fitness goals
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏰ Smart Alarm</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('SmartAlarm')}
        >
          <Text style={styles.buttonText}>Set Wake-Up Alarm</Text>
        </TouchableOpacity>
        <Text style={styles.description}>
          Aggressive alarm with verification to ensure you wake up
        </Text>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Today's Workout Plan</Text>
            {workout && (
              <ScrollView style={styles.workoutScroll}>
                <Text style={styles.workoutText}>{JSON.stringify(workout, null, 2)}</Text>
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  nutritionStatsCard: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  averageRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  averageText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  workoutScroll: {
    maxHeight: 400,
  },
  workoutText: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
});

export default CoachScreen;
