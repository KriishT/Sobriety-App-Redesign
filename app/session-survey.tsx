import { useSession } from '@/lib/SessionContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SessionSurvey() {
  const router = useRouter();
  const { startSession } = useSession();
  const [drinkCount, setDrinkCount] = useState(0);
  const [bac, setBac] = useState('');

  const handleStart = () => {
    startSession({
      drinkCount,
      breathalyzerScore: bac.trim() || null,
    });
    router.replace('/session-start' as any);
  };

  const handleBack = () => {
    router.replace('/(tabs)/dashboard');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Before We Start</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            Please provide the following information before beginning your session.
          </Text>

          {/* Drink count */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="wine-outline" size={22} color="#6366F1" />
              <Text style={styles.cardTitle}>Drinks Consumed</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              How many alcoholic drinks have you had today?
            </Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={[styles.stepperBtn, drinkCount === 0 && styles.stepperBtnDisabled]}
                onPress={() => setDrinkCount(c => Math.max(0, c - 1))}
                disabled={drinkCount === 0}
              >
                <Ionicons name="remove" size={26} color={drinkCount === 0 ? '#D1D5DB' : '#6366F1'} />
              </TouchableOpacity>
              <Text style={styles.stepperCount}>{drinkCount}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setDrinkCount(c => c + 1)}
              >
                <Ionicons name="add" size={26} color="#6366F1" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Breathalyzer */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="fitness-outline" size={22} color="#6366F1" />
              <Text style={styles.cardTitle}>Breathalyzer Reading</Text>
              <View style={styles.optionalBadge}>
                <Text style={styles.optionalText}>Optional</Text>
              </View>
            </View>
            <Text style={styles.cardSubtitle}>
              Enter your BAC reading if a breathalyzer is available.
            </Text>
            <TextInput
              style={styles.input}
              value={bac}
              onChangeText={setBac}
              placeholder="e.g. 0.08"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              maxLength={6}
              returnKeyType="done"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Ionicons name="play-circle-outline" size={22} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start Session</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { padding: 4, width: 32 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937', flex: 1, textAlign: 'center' },
  placeholder: { width: 32 },

  content: { padding: 24, paddingBottom: 48 },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  optionalBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  optionalText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  stepperBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    backgroundColor: '#F3F4F6',
  },
  stepperCount: {
    fontSize: 44,
    fontWeight: '700',
    color: '#1F2937',
    minWidth: 64,
    textAlign: 'center',
  },

  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: 2,
  },

  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 10,
  },
  startButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
