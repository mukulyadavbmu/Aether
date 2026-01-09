import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import squadService, { Squad } from '../../../services/squadService';
import { useTheme } from '../../../context/ThemeContext';

export default function SquadsScreen({ navigation }: any) {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    loadSquads();
  }, []);

  const loadSquads = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const data = await squadService.getUserSquads(token);
      setSquads(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSquads();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {squads.length === 0 && !loading ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>No squads yet!</Text>
            <Text style={styles.emptySubtext}>
              Create a squad to achieve your goals with friends
            </Text>
          </View>
        ) : (
          squads.map(squad => (
            <TouchableOpacity
              key={squad.id}
              style={styles.squadCard}
              onPress={() => navigation.navigate('SquadDetail', { squadId: squad.id })}
            >
              <View style={styles.squadHeader}>
                <Text style={styles.squadName}>{squad.name}</Text>
                <View style={styles.memberBadge}>
                  <Text style={styles.memberCount}>{squad.members?.length || 0}</Text>
                  <Text style={styles.memberIcon}>👥</Text>
                </View>
              </View>

              {squad.description && (
                <Text style={styles.squadDescription}>{squad.description}</Text>
              )}

              {squad.weeklyGoal && (
                <View style={styles.goalContainer}>
                  <Text style={styles.goalLabel}>🎯 Weekly Goal:</Text>
                  <Text style={styles.goalText}>{squad.weeklyGoal}</Text>
                </View>
              )}

              <View style={styles.squadFooter}>
                <Text style={styles.inviteCode}>Code: {squad.inviteCode}</Text>
                <Text style={styles.viewDetail}>View Details →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={() => navigation.navigate('CreateSquad')}
        >
          <Text style={styles.buttonText}>➕ Create Squad</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.joinButton]}
          onPress={() => navigation.navigate('JoinSquad')}
        >
          <Text style={styles.buttonText}>🔗 Join Squad</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#00F2FF33',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00F2FF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    marginHorizontal: 20,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  squadCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#00F2FF33',
  },
  squadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  squadName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00F2FF',
    flex: 1,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F2FF22',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  memberCount: {
    color: '#00F2FF',
    fontWeight: 'bold',
    marginRight: 5,
  },
  memberIcon: {
    fontSize: 14,
  },
  squadDescription: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 10,
  },
  goalContainer: {
    backgroundColor: '#00FF4122',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  goalLabel: {
    fontSize: 12,
    color: '#00FF41',
    marginBottom: 5,
  },
  goalText: {
    fontSize: 14,
    color: '#FFF',
  },
  squadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  inviteCode: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  viewDetail: {
    fontSize: 14,
    color: '#00F2FF',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#00F2FF',
  },
  joinButton: {
    backgroundColor: '#00FF41',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121212',
  },
});
