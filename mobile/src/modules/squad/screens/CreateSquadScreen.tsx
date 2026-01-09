import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import squadService from '../../../services/squadService';

export default function CreateSquadScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState('fitness');
  const [loading, setLoading] = useState(false);

  const goalTypes = [
    { id: 'fitness', label: '🏃 Fitness', color: '#00F2FF' },
    { id: 'study', label: '📚 Study', color: '#00FF41' },
    { id: 'productivity', label: '💼 Productivity', color: '#FF5F1F' },
  ];

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a squad name');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      const squad = await squadService.createSquad(name, description, goalType, token);
      
      Alert.alert(
        'Success! 🎉',
        `Squad "${squad.name}" created!\n\nInvite Code: ${squad.inviteCode}\n\nShare this code with friends to invite them.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('SquadDetail', { squadId: squad.id }),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Squad</Text>
        <Text style={styles.subtitle}>Build your accountability team</Text>
      </View>

      <View style={styles.form}>
        {/* Squad Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Squad Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Delhi Police Aspirants"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
            maxLength={50}
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What's this squad about?"
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {/* Goal Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Goal Type</Text>
          <View style={styles.goalTypes}>
            {goalTypes.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.goalTypeCard,
                  goalType === type.id && { borderColor: type.color, backgroundColor: type.color + '22' },
                ]}
                onPress={() => setGoalType(type.id)}
              >
                <Text style={[styles.goalTypeText, goalType === type.id && { color: type.color }]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How it works:</Text>
            <Text style={styles.infoText}>
              • AI generates a weekly goal for your squad{'\n'}
              • Track everyone's progress on the leaderboard{'\n'}
              • Send nudges to encourage squad mates{'\n'}
              • Complete camera alarms to stay accountable
            </Text>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : '🚀 Create Squad'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
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
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  goalTypes: {
    flexDirection: 'row',
    gap: 10,
  },
  goalTypeCard: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  goalTypeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#00F2FF11',
    borderWidth: 1,
    borderColor: '#00F2FF33',
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00F2FF',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 13,
    color: '#AAA',
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#00F2FF',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
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
