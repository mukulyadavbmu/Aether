import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import squadService from '../../../services/squadService';

export default function JoinSquadScreen({ navigation }: any) {
  const [referralToken, setReferralToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!referralToken.trim()) {
      Alert.alert('Error', 'Please enter a referral code');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      const squad = await squadService.acceptInvite(referralToken.trim(), token);
      
      Alert.alert(
        'Success! 🎉',
        `You've joined "${squad.name}"!\n\nCheck the leaderboard and start crushing goals together!`,
        [
          {
            text: 'View Squad',
            onPress: () => navigation.navigate('SquadDetail', { squadId: squad.id }),
          },
        ],
      );
      
      setReferralToken('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Join Squad</Text>
        <Text style={styles.subtitle}>Enter your invitation code</Text>
      </View>

      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustration}>
          <Text style={styles.illustrationIcon}>🔗</Text>
          <Text style={styles.illustrationText}>
            Got an invitation from a friend?{'\n'}Enter the code below to join!
          </Text>
        </View>

        {/* Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Referral Code</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., clxxx1234abcd"
            placeholderTextColor="#666"
            value={referralToken}
            onChangeText={setReferralToken}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hint}>
            💡 Check your email or ask your friend for the code
          </Text>
        </View>

        {/* How it Works */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <Text style={styles.infoText}>
            ✅ You'll be added to the squad{'\n'}
            ✅ See everyone's progress on the leaderboard{'\n'}
            ✅ Contribute to the weekly goal{'\n'}
            ✅ Send and receive nudges
          </Text>
        </View>

        {/* Join Button */}
        <TouchableOpacity
          style={[styles.joinButton, loading && styles.joinButtonDisabled]}
          onPress={handleJoin}
          disabled={loading}
        >
          <Text style={styles.joinButtonText}>
            {loading ? 'Joining...' : '🚀 Join Squad'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
    padding: 20,
  },
  illustration: {
    alignItems: 'center',
    marginVertical: 40,
  },
  illustrationIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  illustrationText: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#FFF',
    fontFamily: 'monospace',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  infoBox: {
    backgroundColor: '#00FF4111',
    borderWidth: 1,
    borderColor: '#00FF4133',
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00FF41',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#AAA',
    lineHeight: 22,
  },
  joinButton: {
    backgroundColor: '#00FF41',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  joinButtonDisabled: {
    opacity: 0.5,
  },
  joinButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#121212',
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
});
