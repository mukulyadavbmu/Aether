import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useAuthStore } from '../../auth/store/authStore';

interface Meal {
  id: string;
  mealType: string;
  description: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  timestamp: string;
}

const MealLogScreen = () => {
  const [mealType, setMealType] = useState('breakfast');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [meals, setMeals] = useState<Meal[]>([]);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    loadTodaysMeals();
  }, []);

  const loadTodaysMeals = async () => {
    try {
      const response = await axios.get(`${API_URL}/health/meal/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeals(response.data);
    } catch (error) {
      console.error('Failed to load meals:', error);
    }
  };

  const handleLogMeal = async () => {
    if (!description || !calories) {
      Alert.alert('Error', 'Please enter meal description and calories');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/health/meal/log`,
        {
          mealType,
          description,
          calories: parseInt(calories),
          protein: protein ? parseFloat(protein) : undefined,
          carbs: carbs ? parseFloat(carbs) : undefined,
          fat: fat ? parseFloat(fat) : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'Meal logged successfully!');
      setDescription('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      loadTodaysMeals();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to log meal');
    }
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Log Meal</Text>

      <View style={styles.mealTypeContainer}>
        {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.mealTypeButton, mealType === type && styles.mealTypeButtonActive]}
            onPress={() => setMealType(type)}
          >
            <Text style={[styles.mealTypeText, mealType === type && styles.mealTypeTextActive]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="What did you eat?"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Calories *</Text>
          <TextInput
            style={styles.input}
            placeholder="500"
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Protein (g)</Text>
          <TextInput
            style={styles.input}
            placeholder="30"
            value={protein}
            onChangeText={setProtein}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Carbs (g)</Text>
          <TextInput
            style={styles.input}
            placeholder="50"
            value={carbs}
            onChangeText={setCarbs}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Fat (g)</Text>
          <TextInput
            style={styles.input}
            placeholder="20"
            value={fat}
            onChangeText={setFat}
            keyboardType="numeric"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogMeal}>
        <Text style={styles.buttonText}>Log Meal</Text>
      </TouchableOpacity>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Today's Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Total Calories: {totalCalories}</Text>
          <Text style={styles.summaryText}>Protein: {totalProtein.toFixed(1)}g</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Today's Meals</Text>
      {meals.map((meal) => (
        <View key={meal.id} style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealType}>{meal.mealType.toUpperCase()}</Text>
            <Text style={styles.mealTime}>
              {new Date(meal.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <Text style={styles.mealDescription}>{meal.description}</Text>
          <Text style={styles.mealStats}>
            {meal.calories} cal • {meal.protein}g protein • {meal.carbs}g carbs • {meal.fat}g fat
          </Text>
        </View>
      ))}
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
  mealTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  mealTypeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  mealTypeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  mealTypeText: {
    color: '#666',
    fontSize: 12,
  },
  mealTypeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  mealCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mealType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  mealTime: {
    fontSize: 12,
    color: '#666',
  },
  mealDescription: {
    fontSize: 16,
    marginBottom: 5,
  },
  mealStats: {
    fontSize: 14,
    color: '#666',
  },
});

export default MealLogScreen;
