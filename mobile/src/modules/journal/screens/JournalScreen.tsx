import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../auth/store/authStore';
import { API_URL } from '../../../config/api';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../../context/ThemeContext';

const JournalScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dailyRating, setDailyRating] = useState<any>(null);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [mainGoal, setMainGoal] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [goalContext, setGoalContext] = useState('');
  const [generatedGoals, setGeneratedGoals] = useState<any>(null);
  const [generatingGoals, setGeneratingGoals] = useState(false);
  const [weeklyReviewModal, setWeeklyReviewModal] = useState(false);
  const [weeklyReview, setWeeklyReview] = useState<any>(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const token = useAuthStore((state) => state.token);
  const { colors } = useTheme();

  const handleGenerateGoals = async () => {
    if (!mainGoal.trim()) {
      Alert.alert('Required', 'Please enter your main goal');
      return;
    }

    setGeneratingGoals(true);
    try {
      const response = await axios.post(
        `${API_URL}/journal/goals/generate`,
        {
          mainGoal,
          deadline: deadline.toISOString(),
          context: goalContext,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setGeneratedGoals(response.data);
      setGoalModalVisible(false);
      Alert.alert('Success', 'AI has generated your goal hierarchy!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to generate goals');
    } finally {
      setGeneratingGoals(false);
    }
  };

  const handleGetWeeklyReview = async () => {
    setLoadingReview(true);
    try {
      const response = await axios.get(`${API_URL}/journal/weekly-review`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWeeklyReview(response.data);
      setWeeklyReviewModal(true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to get weekly review');
    } finally {
      setLoadingReview(false);
    }
  };

  const handleSubmitSummary = async () => {
    if (!summaryText.trim()) {
      Alert.alert('Error', 'Please enter your daily summary');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/journal/daily-summary`,
        {
          rawInput: summaryText,
          date: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Success', 'Your summary has been processed by AI!');
      setModalVisible(false);
      setSummaryText('');
      fetchTodayRating();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit summary');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayRating = async () => {
    try {
      const response = await axios.get(`${API_URL}/journal/rating/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDailyRating(response.data);
    } catch (error) {
      console.error('Failed to fetch rating:', error);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${API_URL}/journal/goals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.length > 0) {
        setGeneratedGoals(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    }
  };

  React.useEffect(() => {
    fetchTodayRating();
    fetchGoals();
  }, []);
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Today's Summary</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>✍️ Write Daily Summary</Text>
        </TouchableOpacity>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          AI will structure your day into an hourly table and rate your performance
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Daily Rating</Text>
        <Text style={[styles.rating, { color: colors.success }]}>
          {dailyRating ? `${dailyRating.aiRating}/10` : '--/10'}
        </Text>
        {dailyRating?.aiFeedback && (
          <Text style={[styles.feedback, { color: colors.text }]}>{dailyRating.aiFeedback}</Text>
        )}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {dailyRating ? 'Great work today!' : 'Complete your summary to get AI rating'}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Goals</Text>
        {generatedGoals ? (
          <>
            <View style={[styles.goalItem, { borderColor: colors.border }]}>
              <Text style={[styles.goalText, { color: colors.text }]}>📍 Main: {generatedGoals.mainGoal}</Text>
            </View>
            {generatedGoals.weeklyGoals?.map((goal: string, idx: number) => (
              <View key={idx} style={[styles.goalItem, { borderColor: colors.border }]}>
                <Text style={[styles.goalText, { color: colors.text }]}>📅 Week {idx + 1}: {goal}</Text>
              </View>
            ))}
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton, { backgroundColor: colors.secondary }]}
              onPress={() => setGoalModalVisible(true)}
            >
              <Text style={styles.buttonText}>Update Goals</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={[styles.goalItem, { borderColor: colors.border }]}>
              <Text style={[styles.goalText, { color: colors.textSecondary }]}>📍 Main Goal: Not set</Text>
            </View>
            <View style={[styles.goalItem, { borderColor: colors.border }]}>
              <Text style={[styles.goalText, { color: colors.textSecondary }]}>📅 Weekly Goals: Not set</Text>
            </View>
            <View style={[styles.goalItem, { borderColor: colors.border }]}>
              <Text style={[styles.goalText, { color: colors.textSecondary }]}>✅ Daily Goals: Not set</Text>
            </View>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => setGoalModalVisible(true)}
            >
              <Text style={styles.buttonText}>Generate Goals with AI</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>📊 Weekly Review</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Get AI-powered insights on your week's performance
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleGetWeeklyReview}
          disabled={loadingReview}
        >
          <Text style={styles.buttonText}>
            {loadingReview ? 'Generating Review...' : 'Get Weekly Review'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Daily Summary</Text>
            <Text style={styles.modalSubtitle}>
              Describe what you did today (meals, activities, work, etc.)
            </Text>
            
            <TextInput
              style={styles.textArea}
              placeholder="Example: 7am - Woke up and had breakfast (eggs, toast). 9am - Work meeting. 12pm - Lunch (salad). 3pm - Gym workout..."
              value={summaryText}
              onChangeText={setSummaryText}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, loading && styles.buttonDisabled]}
                onPress={handleSubmitSummary}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Processing...' : 'Submit to AI'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={goalModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>AI Goal Generation</Text>
            <Text style={styles.modalSubtitle}>Let AI create a SMART goal hierarchy for you</Text>

            <Text style={styles.label}>Main Goal *</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., Lose 10kg and get fit"
              value={mainGoal}
              onChangeText={setMainGoal}
              multiline
            />

            <Text style={styles.label}>Deadline</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{deadline.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={deadline}
                mode="date"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setDeadline(date);
                }}
              />
            )}

            <Text style={styles.label}>Context (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Current fitness level, constraints, preferences..."
              value={goalContext}
              onChangeText={setGoalContext}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setGoalModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, generatingGoals && styles.buttonDisabled]}
                onPress={handleGenerateGoals}
                disabled={generatingGoals}
              >
                {generatingGoals ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Generate</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={weeklyReviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setWeeklyReviewModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📊 Weekly Review</Text>
            {weeklyReview ? (
              <ScrollView style={{ maxHeight: 400 }}>
                <Text style={styles.reviewText}>{weeklyReview.review}</Text>
              </ScrollView>
            ) : (
              <Text>No data available</Text>
            )}
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={() => setWeeklyReviewModal(false)}
            >
              <Text style={styles.saveButtonText}>Close</Text>
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
  button: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  rating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginVertical: 15,
  },
  description: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  goalItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  goalText: {
    fontSize: 14,
    color: '#333',
  },
  feedback: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
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
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 15,
  },
  secondaryButton: {
    backgroundColor: '#666',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
  },
});

export default JournalScreen;
