import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { Gyroscope } from 'expo-sensors';
import { GameTimer } from '@/components/GameTimer';
import * as Haptics from 'expo-haptics';

export default function SingleLegStand() {
  const [gameStart, setGameStart] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  
  // Game state
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroSum, setGyroSum] = useState({ x: 0, y: 0, z: 0 });
  const [sampleCount, setSampleCount] = useState(0);
  
  // Results
  const [averageGyro, setAverageGyro] = useState({ x: 0, y: 0, z: 0 });
  const [stabilityScore, setStabilityScore] = useState(0);

  const gyroSubscription = useRef<any>(null);
  const router = useRouter();

  const handleBackToDashboard = () => {
    // Clean up gyroscope if still running
    if (gyroSubscription.current) {
      gyroSubscription.current.remove();
      Gyroscope.removeAllListeners();
    }
  setGameStart(false);
  setGameCompleted(false);
  setGyroData({ x: 0, y: 0, z: 0 });
  setGyroSum({ x: 0, y: 0, z: 0 });
  setSampleCount(0);

   router.replace('/(tabs)/dashboard')
  };

  const gameStartState = () => {
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Reset state
    setGyroData({ x: 0, y: 0, z: 0 });
    setGyroSum({ x: 0, y: 0, z: 0 });
    setSampleCount(0);
    setGameStart(true);
    setGameCompleted(false);
    
    // Start gyroscope
    Gyroscope.setUpdateInterval(100); // 100ms = 0.1 seconds
    gyroSubscription.current = Gyroscope.addListener(data => {
      setGyroData(data);
      setGyroSum(prev => ({
        x: prev.x + Math.abs(data.x),
        y: prev.y + Math.abs(data.y),
        z: prev.z + Math.abs(data.z),
      }));
      setSampleCount(prev => prev + 1);
    });
  };

  const handleGameOver = () => {
    setGameStart(false);
    
    // Stop gyroscope
    if (gyroSubscription.current) {
      gyroSubscription.current.remove();
      Gyroscope.removeAllListeners();
    }
    
    // Calculate averages
    const avgX = gyroSum.x / sampleCount;
    const avgY = gyroSum.y / sampleCount;
    const avgZ = gyroSum.z / sampleCount;
    
    setAverageGyro({ x: avgX, y: avgY, z: avgZ });
    
    // Calculate stability score (lower average movement = better)
    // Range: 0-100, where 100 is perfect stability
    const totalMovement = avgX + avgY + avgZ;
    const score = Math.max(0, Math.min(100, 100 - (totalMovement * 100)));
    setStabilityScore(Math.round(score));
    
    // Haptic feedback
    Haptics.notificationAsync(
      score >= 70 
        ? Haptics.NotificationFeedbackType.Success 
        : Haptics.NotificationFeedbackType.Warning
    );
    
    setGameCompleted(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* INSTRUCTIONS SCREEN */}
      {!gameStart && !gameCompleted && (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToDashboard} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Single Leg Stand</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="body-outline" size={64} color="#EC4899" />
            </View>

            <Text style={styles.instructionTitle}>Single Leg Stand Test</Text>
            
            <Text style={styles.instructionText}>
              Stand on one leg with your phone in your one of your hands. Hold your balance for 10 seconds while we measure your stability.
            </Text>

            {/* Example Section */}
            <View style={styles.exampleBox}>
              <Text style={styles.exampleLabel}>How it works:</Text>

              <View style={styles.stepContainer}>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>Hold your phone in your one of your hands with the arm extended straight out</Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>Stand on one leg (choose your preferred leg)</Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>Hold your balance for 10 seconds</Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <Text style={styles.stepText}>We measure your body movement via gyroscope</Text>
                </View>
              </View>

              <View style={styles.exampleNote}>
                <Ionicons name="information-circle" size={20} color="#EC4899" />
                <Text style={styles.exampleNoteText}>
                  Less movement = better balance = higher score
                </Text>
              </View>
            </View>

            {/* Rules */}
            <View style={styles.rulesBox}>
              <Text style={styles.rulesTitle}>Test Rules:</Text>
              <View style={styles.rule}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ruleText}>Put phone in your pocket before starting</Text>
              </View>
              <View style={styles.rule}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ruleText}>Stand on one leg for 10 seconds</Text>
              </View>
              <View style={styles.rule}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ruleText}>Try to minimize body movement</Text>
              </View>
              <View style={styles.rule}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ruleText}>Score based on stability (0-100)</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={gameStartState}>
              <Text style={styles.startButtonText}>Begin Test</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </ScrollView>
        </>
      )}

      {/* GAME SCREEN */}
      {gameStart && !gameCompleted && (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToDashboard} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Single Leg Stand</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.gameScreen}>
            {/* Timer */}
            <View style={styles.timerCard}>
              <Ionicons name="time-outline" size={48} color="#EC4899" />
              <GameTimer time={10} onTimeUp={handleGameOver} />
            </View>

            {/* Instructions */}
            <View style={styles.gameInstructionCard}>
              <Ionicons name="body-outline" size={32} color="#EC4899" />
              <Text style={styles.gameInstruction}>
                Stand on one leg and hold your balance!
              </Text>
            </View>

            {/* Live Data Display */}
            <View style={styles.dataCard}>
              <Text style={styles.dataLabel}>Live Movement Data</Text>
              
              <View style={styles.dataRow}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataAxis}>X</Text>
                  <Text style={styles.dataValue}>{gyroData.x.toFixed(2)}</Text>
                </View>
                <View style={styles.dataItem}>
                  <Text style={styles.dataAxis}>Y</Text>
                  <Text style={styles.dataValue}>{gyroData.y.toFixed(2)}</Text>
                </View>
                <View style={styles.dataItem}>
                  <Text style={styles.dataAxis}>Z</Text>
                  <Text style={styles.dataValue}>{gyroData.z.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.sampleInfo}>
                <Ionicons name="pulse-outline" size={16} color="#6B7280" />
                <Text style={styles.sampleText}>Samples: {sampleCount}</Text>
              </View>
            </View>
          </View>
        </>
      )}

      {/* RESULT SCREEN */}
      {gameCompleted && (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToDashboard} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Single Leg Stand - Results</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView contentContainerStyle={styles.resultScreen}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: stabilityScore >= 70 ? '#FCE7F3' : '#FEE2E2' }
            ]}>
              <Ionicons 
                name={stabilityScore >= 70 ? "checkmark-circle" : "close-circle"} 
                size={64} 
                color={stabilityScore >= 70 ? "#EC4899" : "#EF4444"} 
              />
            </View>

            <Text style={styles.resultTitle}>
              {stabilityScore >= 70 ? 'Excellent Balance!' : 'Test Complete'}
            </Text>
            <Text style={styles.resultSubtitle}>
              {stabilityScore >= 70 
                ? 'Your balance is very good!' 
                : 'Practice to improve your balance'}
            </Text>

            {/* Stability Score */}
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Stability Score</Text>
              <Text style={styles.scoreValue}>{stabilityScore}</Text>
              <Text style={styles.scoreSubtext}>out of 100</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statItemLabel}>Samples</Text>
                  <Text style={styles.statItemValue}>{sampleCount}</Text>
                </View>
                <View style={styles.statItemDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statItemLabel}>Status</Text>
                  <Text style={[
                    styles.statItemValue,
                    { color: stabilityScore >= 70 ? '#EC4899' : '#EF4444' }
                  ]}>
                    {stabilityScore >= 70 ? 'Pass' : 'Fail'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Average Movement Data */}
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Average Movement</Text>
              
              <View style={styles.gyroDataRow}>
                <View style={styles.gyroDataItem}>
                  <Text style={styles.gyroAxisLabel}>X-Axis</Text>
                  <Text style={styles.gyroAxisValue}>{averageGyro.x.toFixed(4)}</Text>
                </View>
                <View style={styles.gyroDataItem}>
                  <Text style={styles.gyroAxisLabel}>Y-Axis</Text>
                  <Text style={styles.gyroAxisValue}>{averageGyro.y.toFixed(4)}</Text>
                </View>
                <View style={styles.gyroDataItem}>
                  <Text style={styles.gyroAxisLabel}>Z-Axis</Text>
                  <Text style={styles.gyroAxisValue}>{averageGyro.z.toFixed(4)}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.retryButton} onPress={gameStartState}>
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.homeButton} onPress={handleBackToDashboard}>
              <Text style={styles.homeButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </ScrollView>
        </>
      )}
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 30,
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },

  // Example Box
  exampleBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 30,
  },
  exampleLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  stepContainer: {
    marginBottom: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EC4899',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  exampleNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE7F3',
    padding: 12,
    borderRadius: 8,
  },
  exampleNoteText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },

  // Rules
  rulesBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 30,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EC4899',
    marginTop: 7,
    marginRight: 12,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Start Button
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EC4899',
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },

  // GAME SCREEN
  gameScreen: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#EC4899',
    marginBottom: 30,
    minWidth: 200,
  },
  gameInstructionCard: {
    backgroundColor: '#FCE7F3',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#F9A8D4',
  },
  gameInstruction: {
    fontSize: 18,
    fontWeight: '600',
    color: '#831843',
    textAlign: 'center',
    marginTop: 12,
  },
  dataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
  },
  dataLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  dataItem: {
    alignItems: 'center',
  },
  dataAxis: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  dataValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EC4899',
  },
  sampleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sampleText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },

  // RESULT SCREEN
  resultScreen: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
    width: '100%',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '700',
    color: '#EC4899',
  },
  scoreSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  statItemLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  statItemValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  gyroDataRow: {
    width: '100%',
    gap: 16,
  },
  gyroDataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  gyroAxisLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  gyroAxisValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EC4899',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  homeButton: {
    paddingVertical: 12,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EC4899',
  },
});