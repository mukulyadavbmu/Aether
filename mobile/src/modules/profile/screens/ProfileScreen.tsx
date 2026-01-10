import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuthStore } from '../../auth/store/authStore';
import api from '../../../services/api';
import { useTheme } from '../../../context/ThemeContext';

const ProfileScreen = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const { colors } = useTheme();
  
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('hypertrophy');
  const [loading, setLoading] = useState(false);

  const goals = [
    { value: 'hypertrophy', label: 'Muscle Growth' },
    { value: 'strength', label: 'Strength' },
    { value: 'endurance', label: 'Endurance' },
    { value: 'weight_loss', label: 'Weight Loss' },
  ];
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      
      if (response.data) {
        setAge(response.data.age?.toString() || '');
        setWeight(response.data.weight?.toString() || '');
        setHeight(response.data.height?.toString() || '');
        setDailyCalorieGoal(response.data.dailyCalorieGoal?.toString() || '');
        setFitnessGoal(response.data.fitnessGoal || 'hypertrophy');
      }
    } catch (error) {
      console.log('Failed to fetch profile');
    }
  };
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await api.post('/profile', {
        age: age ? parseInt(age) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        dailyCalorieGoal: dailyCalorieGoal ? parseInt(dailyCalorieGoal) : undefined,
        fitnessGoal,
      });

      Alert.alert('Success', 'Profile updated successfully!');
      fetchProfile();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Account</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
        <Text style={[styles.value, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
        <Text style={[styleheader, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Profile Settings</Text>
      </View>
      
      <View style={[styles.s.value, { color: colors.text }]}>{user?.email}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Body Stats</Text>
        
        <Text style={[styles.label, { color: colors.textSecondary }]}>Age</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          placeholder="E.g., 25"
          placeholderTextColor={colors.textSecondary}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Weight (kg)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          placeholder="E.g., 75"
          placeholderTextColor={colors.textSecondary}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Height (cm)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          placeholder="E.g., 175"
          placeholderTextColor={colors.textSecondary}
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Fitness Goals</Text>
        
        <Text style={[styles.label, { color: colors.textSecondary }]}>Primary Goal</Text>
        <View style={styles.goalContainer}>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.value}
              style={[
                styles.goalButton,
                { borderColor: colors.border },
                fitnessGoal === goal.value && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setFitnessGoal(goal.value)}
            >
              <Text style={[
                styles.goalText,
                { color: colors.text },
                fitnessGoal === goal.value && { color: '#fff' }
              ]}>
                {goal.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Daily Calorie Goal</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          placeholder="E.g., 2500"
          placeholderTextColor={colors.textSecondary}
          value={dailyCalorieGoal}
          onChangeText={setDailyCalorieGoal}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
        onPress={handleSaveProfile}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Profile'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

coheader: {
    padding: 20,
    paddingTop: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  nst styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  goalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  goalButton: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 24,
    borderWidth: 2,
  },
  goalButtonActive: {
  },
  goalText: {
    fontSize: 14,
    fontWeight: '600',
  },
  goalTextActive: {
  },
  button: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileScreen;
