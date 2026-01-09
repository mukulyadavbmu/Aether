import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../auth/store/authStore';
import { API_URL } from '../../../config/api';
import axios from 'axios';
import StatsChart from '../components/StatsChart';
import { useTheme } from '../../../context/ThemeContext';

const DashboardScreen = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const navigation = useNavigation<any>();
  const { theme, toggleTheme, colors } = useTheme();
  const [dailyRating, setDailyRating] = useState<any>(null);
  const [todayStats, setTodayStats] = useState({
    meals: 0,
    calories: 0,
    tasksCompleted: 0,
    totalTasks: 0,
  });
  const [weeklyData, setWeeklyData] = useState({
    calories: [0, 0, 0, 0, 0, 0, 0],
    activities: [0, 0, 0, 0, 0, 0, 0],
    taskCompletion: [0, 0, 0, 0, 0, 0, 0],
  });
  const [streaks, setStreaks] = useState({
    journal: 0,
    workout: 0,
    tasks: 0,
  });

  useEffect(() => {
    fetchTodayRating();
    fetchTodayStats();
    fetchWeeklyData();
    fetchStreaks();
  }, []);

  const fetchTodayRating = async () => {
    try {
      const response = await axios.get(`${API_URL}/journal/rating/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDailyRating(response.data);
    } catch (error) {
      // No rating yet
    }
  };

  const fetchTodayStats = async () => {
    try {
      const [mealsRes, tasksRes] = await Promise.all([
        axios.get(`${API_URL}/health/meals/today`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/productivity/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const meals = mealsRes.data || [];
      const tasks = tasksRes.data || [];

      setTodayStats({
        meals: meals.length,
        calories: meals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0),
        tasksCompleted: tasks.filter((t: any) => t.completed).length,
        totalTasks: tasks.length,
      });
    } catch (error) {
      console.log('Failed to fetch stats');
    }
  };

  const fetchWeeklyData = async () => {
    try {
      // Simplified - in real app, fetch historical data from backend
      const daysLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      // Mock data - replace with actual API calls
      setWeeklyData({
        calories: [2100, 2300, 1900, 2200, 2400, 2000, todayStats.calories],
        activities: [5, 3, 7, 4, 6, 2, 0],
        taskCompletion: [80, 90, 75, 85, 95, 70, todayStats.totalTasks > 0 
          ? Math.round((todayStats.tasksCompleted / todayStats.totalTasks) * 100) 
          : 0
        ],
      });
    } catch (error) {
      console.log('Failed to fetch weekly data');
    }
  };

  const fetchStreaks = async () => {
    try {
      // Calculate streaks from backend data
      const [journalRes, workoutRes, tasksRes] = await Promise.all([
        axios.get(`${API_URL}/journal/ratings`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/health/workouts`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/productivity/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
      ]);

      // Simple streak calculation - consecutive days
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const calculateStreak = (items: any[], dateField: string) => {
        if (!items || items.length === 0) return 0;
        
        const sortedDates = items
          .map(item => new Date(item[dateField]))
          .sort((a, b) => b.getTime() - a.getTime());
        
        let streak = 0;
        let checkDate = new Date(today);
        
        for (const date of sortedDates) {
          date.setHours(0, 0, 0, 0);
          if (date.getTime() === checkDate.getTime()) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (date.getTime() < checkDate.getTime()) {
            break;
          }
        }
        
        return streak;
      };

      setStreaks({
        journal: calculateStreak(journalRes.data, 'createdAt'),
        workout: calculateStreak(workoutRes.data, 'date'),
        tasks: Math.min(3, tasksRes.data?.filter((t: any) => t.completed).length || 0),
      });
    } catch (error) {
      console.log('Failed to fetch streaks');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.text }]}>Hello, {user?.name}!</Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <Ionicons 
            name={theme === 'dark' ? 'sunny' : 'moon'} 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Today's Progress</Text>
        <Text style={[styles.rating, { color: colors.success }]}>
          Rating: {dailyRating ? `${dailyRating.aiRating}/10` : '--/10'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {dailyRating ? 'Great job today!' : 'Complete your daily summary to see your rating'}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{todayStats.meals}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Meals Logged</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{todayStats.calories}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Calories</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {todayStats.totalTasks > 0 
              ? `${Math.round((todayStats.tasksCompleted / todayStats.totalTasks) * 100)}%`
              : '0%'
            }
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tasks Done</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>🔥 Streaks</Text>
        <View style={styles.streakContainer}>
          <View style={styles.streakItem}>
            <Text style={[styles.streakNumber, { color: colors.warning }]}>{streaks.journal}</Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>📔 Journal Days</Text>
          </View>
          <View style={styles.streakItem}>
            <Text style={[styles.streakNumber, { color: colors.warning }]}>{streaks.workout}</Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>💪 Workout Days</Text>
          </View>
          <View style={styles.streakItem}>
            <Text style={[styles.streakNumber, { color: colors.warning }]}>{streaks.tasks}</Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>✅ Tasks Today</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>📱 Features</Text>
        <View style={styles.featuresGrid}>
          <TouchableOpacity 
            style={[styles.featureButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Health' as never)}
          >
            <Text style={styles.featureIcon}>🏥</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>Health Coach</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.featureButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Journal' as never)}
          >
            <Text style={styles.featureIcon}>📔</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>AI Journal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.featureButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Limiter' as never)}
          >
            <Text style={styles.featureIcon}>⏱️</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>Limiter</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.featureButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Trends' as never)}
          >
            <Text style={styles.featureIcon}>📈</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>Trends</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.featureButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Settings' as never)}
          >
            <Text style={styles.featureIcon}>⚙️</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Quick Actions</Text>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.primary }]}
          onPress={() => navigation.navigate('Health', { screen: 'MealLogging' } as never)}
        >
          <Text style={styles.actionIcon}>🍽️</Text>
          <Text style={[styles.actionText, { color: colors.primary }]}>Log Meal</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.primary }]}
          onPress={() => navigation.navigate('Tracker' as never)}
        >
          <Text style={styles.actionIcon}>🏃</Text>
          <Text style={[styles.actionText, { color: colors.primary }]}>Start Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.primary }]}
          onPress={() => navigation.navigate('Tasks' as never)}
        >
          <Text style={styles.actionIcon}>✅</Text>
          <Text style={[styles.actionText, { color: colors.primary }]}>Add Task</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.primary }]}
          onPress={() => navigation.navigate('Journal' as never)}
        >
          <Text style={styles.actionIcon}>📝</Text>
          <Text style={[styles.actionText, { color: colors.primary }]}>Write Journal</Text>
        </TouchableOpacity>
      </View>

      <StatsChart 
        title="Weekly Calories"
        data={weeklyData.calories}
        labels={['M', 'T', 'W', 'T', 'F', 'S', 'S']}
        color="#FF9500"
      />

      <StatsChart 
        title="Weekly Activities (km)"
        data={weeklyData.activities}
        labels={['M', 'T', 'W', 'T', 'F', 'S', 'S']}
        color="#34C759"
      />

      <StatsChart 
        title="Task Completion %"
        data={weeklyData.taskCompletion}
        labels={['M', 'T', 'W', 'T', 'F', 'S', 'S']}
        color="#007AFF"
      />

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Upcoming</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>No upcoming reminders</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  themeToggle: {
    padding: 8,
  },
  card: {
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#00F2FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rating: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textShadowColor: '#00FF41',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 15,
    marginBottom: 15,
  },
  statCard: {
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    shadowColor: '#00F2FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
    textTransform: 'uppercase',
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  streakItem: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: '#FF5F1F',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  streakLabel: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureButton: {
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '500',
  },
  actionButton: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  actionIcon: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 5,
  },
  actionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#00F2FF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default DashboardScreen;
