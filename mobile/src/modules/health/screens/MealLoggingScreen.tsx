import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../auth/store/authStore';
import { API_URL } from '../../../config/api';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

const MealLoggingScreen = () => {
  const [mealType, setMealType] = useState('breakfast');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const token = useAuthStore((state) => state.token);

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  const analyzeFood = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera roll permission is needed to analyze food');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setAnalyzing(true);
      try {
        const response = await axios.post(
          `${API_URL}/health/meal/analyze-image`,
          { imageBase64: result.assets[0].base64 },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { foodName, calories: cal, protein: prot, carbs: carb, fat: f } = response.data;
        setDescription(foodName);
        setCalories(cal.toString());
        setProtein(prot.toString());
        setCarbs(carb.toString());
        setFat(f.toString());
        Alert.alert('Success', `Detected: ${foodName}. Review and adjust if needed.`);
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to analyze image');
      } finally {
        setAnalyzing(false);
      }
    }
  };

  const handleLogMeal = async () => {
    if (!description || !calories) {
      Alert.alert('Error', 'Please enter meal description and calories');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/health/meal/log`,
        {
          timestamp: new Date().toISOString(),
          mealType,
          description,
          calories: parseInt(calories),
          protein: protein ? parseFloat(protein) : undefined,
          carbs: carbs ? parseFloat(carbs) : undefined,
          fat: fat ? parseFloat(fat) : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Success', 'Meal logged successfully!');
      setDescription('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to log meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Log Your Meal</Text>

      <TouchableOpacity 
        style={[styles.cameraButton, analyzing && styles.buttonDisabled]}
        onPress={analyzeFood}
        disabled={analyzing}
      >
        {analyzing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.cameraIcon}>📸</Text>
            <Text style={styles.cameraText}>Analyze Food with AI Camera</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Meal Type</Text>
      <View style={styles.mealTypeContainer}>
        {mealTypes.map((type) => (
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

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={styles.input}
        placeholder="E.g., Grilled chicken with rice and vegetables"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Calories *</Text>
      <TextInput
        style={styles.input}
        placeholder="E.g., 450"
        value={calories}
        onChangeText={setCalories}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Protein (g)</Text>
      <TextInput
        style={styles.input}
        placeholder="E.g., 30"
        value={protein}
        onChangeText={setProtein}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Carbs (g)</Text>
      <TextInput
        style={styles.input}
        placeholder="E.g., 45"
        value={carbs}
        onChangeText={setCarbs}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Fat (g)</Text>
      <TextInput
        style={styles.input}
        placeholder="E.g., 12"
        value={fat}
        onChangeText={setFat}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogMeal}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Logging...' : 'Log Meal'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  mealTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  mealTypeButtonActive: {
    backgroundColor: '#007AFF',
  },
  mealTypeText: {
    color: '#007AFF',
    fontSize: 14,
  },
  mealTypeTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    marginBottom: 30,
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
  cameraButton: {
    backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  cameraText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MealLoggingScreen;
