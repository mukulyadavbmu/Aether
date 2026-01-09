import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useAuthStore } from '../../auth/store/authStore';

const DailySummaryScreen = () => {
  const [rawInput, setRawInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [rating, setRating] = useState<any>(null);
  const token = useAuthStore((state) => state.token);

  const handleSubmit = async () => {
    if (!rawInput.trim()) {
      Alert.alert('Error', 'Please describe your day');
      return;
    }

    setLoading(true);
    try {
      // Submit daily summary
      const summaryResponse = await axios.post(
        `${API_URL}/journal/daily-summary`,
        { rawInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSummary(summaryResponse.data);

      // Get AI rating
      const ratingResponse = await axios.get(
        `${API_URL}/journal/rating/today`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setRating(ratingResponse.data);
      Alert.alert('Success', 'Your daily summary has been processed by AI!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to process summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Daily Journal</Text>
      <Text style={styles.subtitle}>Tell me about your day...</Text>

      <TextInput
        style={styles.textArea}
        placeholder="What did you do today? What did you eat? How did you feel?"
        value={rawInput}
        onChangeText={setRawInput}
        multiline
        numberOfLines={10}
        textAlignVertical="top"
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '🤖 AI Processing...' : '✨ Generate AI Summary'}
        </Text>
      </TouchableOpacity>

      {rating && (
        <View style={styles.ratingCard}>
          <View style={styles.ratingHeader}>
            <Text style={styles.ratingTitle}>AI Performance Rating</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingScore}>{rating.rating}/10</Text>
            </View>
          </View>
          
          {rating.achievements?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Achievements</Text>
              {rating.achievements.map((achievement: string, index: number) => (
                <Text key={index} style={styles.listItem}>• {achievement}</Text>
              ))}
            </View>
          )}

          {rating.improvements?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Areas to Improve</Text>
              {rating.improvements.map((improvement: string, index: number) => (
                <Text key={index} style={styles.listItem}>• {improvement}</Text>
              ))}
            </View>
          )}

          {rating.feedback && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🗣️ AI Feedback</Text>
              <Text style={styles.feedback}>{rating.feedback}</Text>
            </View>
          )}
        </View>
      )}

      {summary?.structuredData && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📊 Structured Summary</Text>
          <Text style={styles.summaryText}>
            {JSON.stringify(summary.structuredData, null, 2)}
          </Text>
        </View>
      )}
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 200,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: '#adb5bd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  ratingCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  ratingBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ratingScore: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  listItem: {
    fontSize: 15,
    color: '#495057',
    marginBottom: 5,
    lineHeight: 22,
  },
  feedback: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  summaryCard: {
    backgroundColor: '#e9ecef',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#495057',
  },
});

export default DailySummaryScreen;
