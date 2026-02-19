import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GameDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const gameName = params.name as string || 'Game Title';
  const gameCategory = params.category as string || 'CATEGORY';
  const gameTime = params.time as string || '1-2 min';
  const gameIcon = params.icon as string || 'game-controller-outline';
  const gameColor = params.color as string || '#4F46E5';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Protocol Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconSection}>
          <View style={[styles.iconContainer, { backgroundColor: `${gameColor}15` }]}>
            <Ionicons name={gameIcon as any} size={48} color={gameColor} />
          </View>
        </View>

        <Text style={styles.gameTitle}>{gameName}</Text>
        <Text style={styles.gameCategory}>{gameCategory}</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>EST. DURATION</Text>
            <View style={styles.infoValue}>
              <Ionicons name="time-outline" size={18} color="#4F46E5" />
              <Text style={styles.infoText}>{gameTime}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>COMPLIANCE</Text>
            <View style={styles.infoValue}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
              <Text style={styles.infoText}>Validated</Text>
            </View>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Description</Text>
          </View>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              High-precision stimulus response tracking to measure processing speed and cognitive performance.
            </Text>
          </View>
        </View>

        {/* Requirements Section */}
        <View style={styles.section}>
          <Text style={styles.requirementsTitle}>Requirements</Text>
          
          <View style={styles.requirement}>
            <View style={styles.bulletPoint} />
            <Text style={styles.requirementText}>Stable horizontal surface</Text>
          </View>

          <View style={styles.requirement}>
            <View style={styles.bulletPoint} />
            <Text style={styles.requirementText}>Proper lighting conditions</Text>
          </View>

          <View style={styles.requirement}>
            <View style={styles.bulletPoint} />
            <Text style={styles.requirementText}>Minimal audio distractions</Text>
          </View>

          <View style={styles.requirement}>
            <View style={styles.bulletPoint} />
            <Text style={styles.requirementText}>Participant consent recorded</Text>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity style={[styles.startButton, { backgroundColor: gameColor }]}   onPress={() => {
  if (gameName === 'Typing Challenge') {
    router.push('/(tabs)/(games)/TypingGame/TypingGame');
  } else if (gameName === 'Stroop Naming') {
    router.push('/(tabs)/(games)/StroopNaming/StroopNaming');
  }
  else if (gameName === 'DSST') {
    router.push('/(tabs)/(games)/DSST/DSST');
  }
}}

>
          <Text style={styles.startButtonText}>Start Protocol</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  gameCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    textAlign: 'center',
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  infoValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  descriptionBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4F46E5',
    marginTop: 7,
    marginRight: 12,
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
});