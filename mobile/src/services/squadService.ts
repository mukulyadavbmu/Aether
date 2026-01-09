import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import * as Notifications from 'expo-notifications';

export interface Squad {
  id: string;
  name: string;
  description?: string;
  weeklyGoal?: string;
  weeklyGoalTarget?: any;
  inviteCode: string;
  members: SquadMember[];
}

export interface SquadMember {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: string;
  weeklyProgress?: SquadProgress[];
}

export interface SquadProgress {
  currentProgress: number;
  targetProgress: number;
  progressPercent: number;
  cameraAlarmCompleted: boolean;
  streakDays: number;
  lastActivityAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  progress: number;
  target: number;
  percentage: number;
  cameraAlarmDone: boolean;
  streak: number;
  lastActive?: string;
}

export interface Nudge {
  id: string;
  sender: {
    id: string;
    name: string;
  };
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

class SquadService {
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 60000; // 1 minute

  // ============ SQUAD MANAGEMENT ============

  async createSquad(
    name: string,
    description: string,
    weeklyGoalType: string = 'fitness',
    token: string,
  ): Promise<Squad> {
    try {
      const response = await axios.post(
        `${API_URL}/squad`,
        { name, description, weeklyGoalType },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create squad');
    }
  }

  async getUserSquads(token: string): Promise<Squad[]> {
    try {
      const response = await axios.get(`${API_URL}/squad`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch squads');
    }
  }

  async getSquad(squadId: string, token: string): Promise<Squad> {
    try {
      const response = await axios.get(`${API_URL}/squad/${squadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch squad');
    }
  }

  async updateSquadGoal(squadId: string, token: string): Promise<Squad> {
    try {
      const response = await axios.put(
        `${API_URL}/squad/${squadId}/goal`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update goal');
    }
  }

  // ============ LEADERBOARD & PROGRESS ============

  async getLeaderboard(squadId: string, token: string): Promise<LeaderboardEntry[]> {
    try {
      const response = await axios.get(`${API_URL}/squad/${squadId}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }

  async updateProgress(squadId: string, progress: number, token: string): Promise<void> {
    try {
      await axios.post(
        `${API_URL}/squad/${squadId}/progress`,
        { progress },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update progress');
    }
  }

  async markCameraAlarmCompleted(squadId: string, token: string): Promise<void> {
    try {
      await axios.post(
        `${API_URL}/squad/${squadId}/camera-alarm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error: any) {
      console.error('Failed to mark camera alarm completed:', error);
    }
  }

  // ============ INVITATION SYSTEM ============

  async inviteMember(squadId: string, email: string, token: string): Promise<void> {
    try {
      await axios.post(
        `${API_URL}/squad/${squadId}/invite`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send invitation');
    }
  }

  async acceptInvite(referralToken: string, token: string): Promise<Squad> {
    try {
      const response = await axios.post(
        `${API_URL}/squad/accept-invite`,
        { referralToken },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to accept invitation');
    }
  }

  // ============ NUDGING SYSTEM ============

  async sendNudge(
    receiverId: string,
    message: string,
    type: string = 'encourage',
    token: string,
  ): Promise<void> {
    try {
      await axios.post(
        `${API_URL}/squad/nudge`,
        { receiverId, message, type },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send nudge');
    }
  }

  async getNudges(token: string, unreadOnly: boolean = false): Promise<Nudge[]> {
    try {
      const response = await axios.get(`${API_URL}/squad/nudges/list`, {
        params: { unreadOnly },
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch nudges');
    }
  }

  async markNudgeRead(nudgeId: string, token: string): Promise<void> {
    try {
      await axios.put(
        `${API_URL}/squad/nudges/${nudgeId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error: any) {
      console.error('Failed to mark nudge as read:', error);
    }
  }

  // ============ REAL-TIME SYNC ============

  async startSquadSync(token: string): Promise<void> {
    // Stop any existing sync
    this.stopSquadSync();

    // Check for nudges every minute
    this.syncInterval = setInterval(async () => {
      try {
        const nudges = await this.getNudges(token, true);
        
        if (nudges.length > 0) {
          // Show notification for new nudges
          for (const nudge of nudges) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `💪 Nudge from ${nudge.sender.name}`,
                body: nudge.message,
                data: { type: 'squad_nudge', nudgeId: nudge.id },
                sound: true,
              },
              trigger: { seconds: 1 },
            });

            // Mark as read
            await this.markNudgeRead(nudge.id, token);
          }

          // Store nudge count
          await AsyncStorage.setItem('unread_nudges', nudges.length.toString());
        }
      } catch (error) {
        console.error('Squad sync error:', error);
      }
    }, this.SYNC_INTERVAL_MS);

    console.log('Squad sync started');
  }

  stopSquadSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Squad sync stopped');
    }
  }

  // ============ ACTIVITY TRACKING INTEGRATION ============

  async syncActivityToSquad(
    distance: number,
    activityType: string,
    token: string,
  ): Promise<void> {
    try {
      // Get user's squads
      const squads = await this.getUserSquads(token);

      // Update progress for each squad
      for (const squad of squads) {
        // Only sync if goal type matches activity
        const goalType = (squad.weeklyGoalTarget as any)?.type || 'run';
        
        if (goalType === activityType || goalType === 'any') {
          // Get current progress from local storage
          const progressKey = `squad_progress_${squad.id}`;
          const currentProgress = parseFloat(await AsyncStorage.getItem(progressKey) || '0');
          const newProgress = currentProgress + distance;

          // Update backend
          await this.updateProgress(squad.id, newProgress, token);

          // Update local cache
          await AsyncStorage.setItem(progressKey, newProgress.toString());
        }
      }
    } catch (error) {
      console.error('Failed to sync activity to squad:', error);
    }
  }

  // ============ UTILITY FUNCTIONS ============

  getProgressColor(percentage: number): string {
    if (percentage >= 100) return '#00FF41'; // Cyan green - complete
    if (percentage >= 70) return '#00F2FF'; // Cyan - on track
    if (percentage >= 40) return '#FFA500'; // Orange - behind
    return '#FF5F1F'; // Red-orange - lagging
  }

  getNudgeEmoji(type: string): string {
    switch (type) {
      case 'encourage':
        return '💪';
      case 'challenge':
        return '🔥';
      case 'celebrate':
        return '🎉';
      default:
        return '👋';
    }
  }
}

export default new SquadService();
