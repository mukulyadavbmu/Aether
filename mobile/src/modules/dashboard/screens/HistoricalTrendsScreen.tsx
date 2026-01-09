import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAuthStore } from '../../auth/store/authStore';
import { API_URL } from '../../../config/api';
import axios from 'axios';

const screenWidth = Dimensions.get('window').width;

const HistoricalTrendsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [ratingsData, setRatingsData] = useState<number[]>([]);
  const [weightData, setWeightData] = useState<number[]>([]);
  const [caloriesData, setCaloriesData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchHistoricalData();
  }, []);

  const fetchHistoricalData = async () => {
    try {
      const [ratingsRes, profileRes, mealsRes] = await Promise.all([
        axios.get(`${API_URL}/journal/ratings?days=30`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/profile/weight-history`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/health/meals/history?days=30`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
      ]);

      // Process ratings (last 30 days)
      const ratings = ratingsRes.data.slice(0, 10).reverse();
      const ratingValues = ratings.map((r: any) => r.aiRating || 0);
      
      // Process weight data
      const weights = profileRes.data.slice(0, 10).reverse();
      const weightValues = weights.map((w: any) => w.weight || 0);
      
      // Process calories
      const meals = mealsRes.data.slice(0, 10).reverse();
      const calorieValues = meals.map((m: any) => m.calories || 0);

      // Generate labels (dates)
      const dateLabels = ratings.map((r: any, idx: number) => {
        const date = new Date(r.createdAt);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });

      setRatingsData(ratingValues.length ? ratingValues : [0, 0, 0, 0, 0]);
      setWeightData(weightValues.length ? weightValues : [0, 0, 0, 0, 0]);
      setCaloriesData(calorieValues.length ? calorieValues : [0, 0, 0, 0, 0]);
      setLabels(dateLabels.length ? dateLabels : ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5']);
    } catch (error) {
      console.log('Failed to fetch historical data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📈 Historical Trends</Text>
      <Text style={styles.subtitle}>Track your long-term progress</Text>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Daily AI Ratings</Text>
        <LineChart
          data={{
            labels,
            datasets: [{ data: ratingsData }],
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
        <Text style={styles.chartDescription}>
          Average: {ratingsData.length ? (ratingsData.reduce((a, b) => a + b, 0) / ratingsData.length).toFixed(1) : 0}/10
        </Text>
      </View>

      {weightData.some(w => w > 0) && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weight Progress (kg)</Text>
          <LineChart
            data={{
              labels,
              datasets: [{ data: weightData }],
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            }}
            bezier
            style={styles.chart}
          />
          <Text style={styles.chartDescription}>
            Change: {weightData.length >= 2 ? (weightData[weightData.length - 1] - weightData[0]).toFixed(1) : 0} kg
          </Text>
        </View>
      )}

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Daily Calories</Text>
        <LineChart
          data={{
            labels,
            datasets: [{ data: caloriesData }],
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
        <Text style={styles.chartDescription}>
          Average: {caloriesData.length ? Math.round(caloriesData.reduce((a, b) => a + b, 0) / caloriesData.length) : 0} cal/day
        </Text>
      </View>

      <View style={styles.insightsCard}>
        <Text style={styles.insightsTitle}>📊 Insights</Text>
        <Text style={styles.insightText}>
          • Your AI rating trend shows {ratingsData[ratingsData.length - 1] > ratingsData[0] ? 'improvement 📈' : 'room for growth 📊'}
        </Text>
        <Text style={styles.insightText}>
          • Keep logging daily summaries to track progress
        </Text>
        <Text style={styles.insightText}>
          • Consistency is key - aim for daily check-ins
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  chartCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  insightsCard: {
    backgroundColor: '#E3F2FD',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  insightText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default HistoricalTrendsScreen;
