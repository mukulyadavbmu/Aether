import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import squadService, { Squad, LeaderboardEntry } from '../../../services/squadService';

export default function SquadDetailScreen({ route, navigation }: any) {
  const { squadId } = route.params;
  const [squad, setSquad] = useState<Squad | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    loadSquadData();
    loadUserId();
  }, []);

  const loadUserId = async () => {
    const userId = await AsyncStorage.getItem('userId');
    setCurrentUserId(userId || '');
  };

  const loadSquadData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const [squadData, leaderboardData] = await Promise.all([
        squadService.getSquad(squadId, token),
        squadService.getLeaderboard(squadId, token),
      ]);

      setSquad(squadData);
      setLeaderboard(leaderboardData);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSquadData();
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      await squadService.inviteMember(squadId, inviteEmail, token);
      Alert.alert('Success', `Invitation sent to ${inviteEmail}`);
      setShowInviteModal(false);
      setInviteEmail('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSendNudge = async (memberId: string, memberName: string) => {
    const messages = [
      `Come on ${memberName}! The squad needs you! 💪`,
      `Don't let the squad down! You got this! 🔥`,
      `${memberName}, time to catch up! Let's go! 🚀`,
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      await squadService.sendNudge(memberId, randomMessage, 'encourage', token);
      Alert.alert('Success', `Nudge sent to ${memberName}!`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#666';
  };

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Squad Header */}
        {squad && (
          <View style={styles.header}>
            <Text style={styles.title}>{squad.name}</Text>
            {squad.description && <Text style={styles.description}>{squad.description}</Text>}

            {/* Weekly Goal */}
            {squad.weeklyGoal && (
              <View style={styles.goalCard}>
                <Text style={styles.goalTitle}>🎯 This Week's Goal</Text>
                <Text style={styles.goalText}>{squad.weeklyGoal}</Text>
                {squad.weeklyGoalTarget && (
                  <Text style={styles.goalTarget}>
                    Target: {(squad.weeklyGoalTarget as any).distance}{' '}
                    {(squad.weeklyGoalTarget as any).unit}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Leaderboard */}
        <View style={styles.leaderboardSection}>
          <Text style={styles.sectionTitle}>🏆 Leaderboard</Text>

          {leaderboard.length === 0 ? (
            <Text style={styles.emptyText}>No progress yet this week</Text>
          ) : (
            leaderboard.map(entry => (
              <View
                key={entry.userId}
                style={[
                  styles.leaderboardCard,
                  entry.userId === currentUserId && styles.currentUserCard,
                ]}
              >
                <View style={styles.rankContainer}>
                  <Text style={[styles.rankText, { color: getRankColor(entry.rank) }]}>
                    {getRankMedal(entry.rank)}
                  </Text>
                </View>

                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {entry.userName}
                    {entry.userId === currentUserId && ' (You)'}
                  </Text>
                  <View style={styles.statsRow}>
                    <Text style={styles.stat}>
                      {entry.progress.toFixed(1)} / {entry.target} km
                    </Text>
                    <Text style={styles.stat}>• {entry.streak} day streak 🔥</Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <Text
                    style={[
                      styles.percentage,
                      { color: squadService.getProgressColor(entry.percentage) },
                    ]}
                  >
                    {entry.percentage.toFixed(0)}%
                  </Text>
                  {entry.cameraAlarmDone && <Text style={styles.alarmBadge}>📸</Text>}
                </View>

                {entry.userId !== currentUserId && entry.percentage < 50 && (
                  <TouchableOpacity
                    style={styles.nudgeButton}
                    onPress={() => handleSendNudge(entry.userId, entry.userName)}
                  >
                    <Text style={styles.nudgeText}>💪 Nudge</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        {/* Invite Button */}
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => setShowInviteModal(true)}
        >
          <Text style={styles.inviteButtonText}>➕ Invite Member</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Invite Modal */}
      <Modal visible={showInviteModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invite to Squad</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              placeholderTextColor="#666"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={handleInvite}
              >
                <Text style={styles.sendButtonText}>Send Invite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00F2FF',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
  },
  goalCard: {
    backgroundColor: '#00FF4122',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00FF4144',
  },
  goalTitle: {
    fontSize: 14,
    color: '#00FF41',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  goalText: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 5,
  },
  goalTarget: {
    fontSize: 12,
    color: '#AAA',
  },
  leaderboardSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  currentUserCard: {
    borderColor: '#00F2FF',
    backgroundColor: '#00F2FF11',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    fontSize: 12,
    color: '#888',
  },
  progressContainer: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  percentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  alarmBadge: {
    fontSize: 16,
    marginTop: 5,
  },
  nudgeButton: {
    backgroundColor: '#FF5F1F33',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF5F1F',
  },
  nudgeText: {
    fontSize: 12,
    color: '#FF5F1F',
    fontWeight: 'bold',
  },
  inviteButton: {
    margin: 15,
    padding: 15,
    backgroundColor: '#00F2FF',
    borderRadius: 8,
    alignItems: 'center',
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121212',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 12,
    width: '85%',
    borderWidth: 1,
    borderColor: '#00F2FF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00F2FF',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#121212',
    color: '#FFF',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  sendButton: {
    backgroundColor: '#00F2FF',
  },
  sendButtonText: {
    color: '#121212',
    fontWeight: 'bold',
  },
});
