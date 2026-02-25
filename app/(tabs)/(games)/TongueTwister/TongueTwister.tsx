import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { GameTimer } from '@/components/GameTimer';

const TONGUE_TWISTERS = [
  "She sells seashells by the seashore",
  "Peter Piper picked a peck of pickled peppers",
  "How much wood would a woodchuck chuck if a woodchuck could chuck wood",
  "Fuzzy Wuzzy was a bear, Fuzzy Wuzzy had no hair",
  "I scream, you scream, we all scream for ice cream",
  "Red leather, yellow leather",
  "Unique New York, unique New York",
  "Irish wristwatch, Swiss wristwatch",
  "Toy boat, toy boat, toy boat",
  "Six sleek swans swam swiftly southwards",
];

export default function TongueTwisters() {
  const [gameStart, setGameStart] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  
  // Game state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phrasesCompleted, setPhrasesCompleted] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  
  // Hardcoded results
  const [clarityScore] = useState(78); // 0-100
  const [articulationScore] = useState(82); // 0-100
  const [speedScore] = useState(85); // 0-100

  const router = useRouter();

  const handleBackToDashboard = () => {
  setGameStart(false);
  setGameCompleted(false);
  setCurrentIndex(0);
  setPhrasesCompleted(0);
  setIsRecording(false);

    router.replace('/(tabs)/dashboard')
  };

  const gameStartState = () => {
    setGameStart(true);
    setGameCompleted(false);
    setCurrentIndex(0);
    setPhrasesCompleted(0);
    setIsRecording(true);
  };

  const handleNext = () => {
    setPhrasesCompleted(prev => prev + 1);
    
    if (currentIndex < TONGUE_TWISTERS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Loop back to start
      setCurrentIndex(0);
    }
  };

  const handleGameOver = () => {
    setIsRecording(false);
    setGameStart(false);
    setGameCompleted(true);
  };

  const overallScore = Math.round((clarityScore + articulationScore + speedScore) / 3);

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
            <Text style={styles.headerTitle}>Tongue Twisters</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="mic-outline" size={64} color="#F59E0B" />
            </View>

            <Text style={styles.instructionTitle}>Tongue Twister Test</Text>
            
            <Text style={styles.instructionText}>
              Read the tongue twisters aloud as clearly as you can. We'll analyze your speech for clarity and articulation.
            </Text>

            {/* Example Section */}
            <View style={styles.exampleBox}>
              <Text style={styles.exampleLabel}>How it works:</Text>

              <View style={styles.stepContainer}>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>A tongue twister will appear on screen</Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>Read it aloud clearly into the microphone</Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>Press "NEXT" to move to the next phrase</Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <Text style={styles.stepText}>Continue for 30 seconds</Text>
                </View>
              </View>

              <View style={styles.examplePhrase}>
                <Ionicons name="chatbox-outline" size={24} color="#F59E0B" />
                <Text style={styles.examplePhraseText}>
                  "She sells seashells by the seashore"
                </Text>
              </View>

              <View style={styles.exampleNote}>
                <Ionicons name="information-circle" size={20} color="#F59E0B" />
                <Text style={styles.exampleNoteText}>
                  Speak clearly and at a normal pace
                </Text>
              </View>
            </View>

            {/* Rules */}
            <View style={styles.rulesBox}>
              <Text style={styles.rulesTitle}>Test Rules:</Text>
              <View style={styles.rule}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ruleText}>30 seconds total duration</Text>
              </View>
              <View style={styles.rule}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ruleText}>Read as many phrases as possible</Text>
              </View>
              <View style={styles.rule}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ruleText}>Press NEXT after each phrase</Text>
              </View>
              <View style={styles.rule}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ruleText}>Clarity and speed both count</Text>
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
            <Text style={styles.headerTitle}>Tongue Twisters</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.gameScreen}>
            {/* Timer & Count */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Ionicons name="time-outline" size={20} color="#F59E0B" />
                <GameTimer time={30} onTimeUp={handleGameOver} />
              </View>
              <View style={styles.statCard}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                <Text style={styles.statText}>{phrasesCompleted}</Text>
              </View>
            </View>

            {/* Recording Indicator */}
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Recording</Text>
              </View>
            )}

            {/* Tongue Twister Display */}
            <View style={styles.twisterCard}>
              <Ionicons name="chatbox-ellipses-outline" size={48} color="#F59E0B" />
              <Text style={styles.twisterText}>
                {TONGUE_TWISTERS[currentIndex]}
              </Text>
            </View>

            {/* Microphone Visual */}
            <View style={styles.microphoneContainer}>
              <View style={[styles.microphoneRing, isRecording && styles.microphoneRingActive]} />
              <View style={[styles.microphoneRing2, isRecording && styles.microphoneRing2Active]} />
              <View style={styles.microphoneIcon}>
                <Ionicons name="mic" size={48} color={isRecording ? "#EF4444" : "#9CA3AF"} />
              </View>
            </View>

            {/* Next Button */}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>NEXT</Text>
              <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Tongue Twisters - Results</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView contentContainerStyle={styles.resultScreen}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: overallScore >= 70 ? '#FEF3C7' : '#FEE2E2' }
            ]}>
              <Ionicons 
                name={overallScore >= 70 ? "checkmark-circle" : "close-circle"} 
                size={64} 
                color={overallScore >= 70 ? "#F59E0B" : "#EF4444"} 
              />
            </View>

            <Text style={styles.resultTitle}>
              {overallScore >= 70 ? 'Excellent Speech!' : 'Test Complete'}
            </Text>
            <Text style={styles.resultSubtitle}>
              {overallScore >= 70 
                ? 'Your speech clarity is very good!' 
                : 'Practice to improve articulation'}
            </Text>

            {/* Overall Score */}
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Overall Score</Text>
              <Text style={styles.scoreValue}>{overallScore}</Text>
              <Text style={styles.scoreSubtext}>out of 100</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statItemLabel}>Phrases</Text>
                  <Text style={styles.statItemValue}>{phrasesCompleted}</Text>
                </View>
                <View style={styles.statItemDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statItemLabel}>Status</Text>
                  <Text style={[
                    styles.statItemValue,
                    { color: overallScore >= 70 ? '#F59E0B' : '#EF4444' }
                  ]}>
                    {overallScore >= 70 ? 'Pass' : 'Fail'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Detailed Metrics */}
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Speech Analysis</Text>
              
              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Clarity</Text>
                  <Text style={styles.metricValue}>{clarityScore}/100</Text>
                </View>
                <View style={styles.metricBar}>
                  <View style={[styles.metricBarFill, { width: `${clarityScore}%`, backgroundColor: '#F59E0B' }]} />
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Articulation</Text>
                  <Text style={styles.metricValue}>{articulationScore}/100</Text>
                </View>
                <View style={styles.metricBar}>
                  <View style={[styles.metricBarFill, { width: `${articulationScore}%`, backgroundColor: '#10B981' }]} />
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Speed</Text>
                  <Text style={styles.metricValue}>{speedScore}/100</Text>
                </View>
                <View style={styles.metricBar}>
                  <View style={[styles.metricBarFill, { width: `${speedScore}%`, backgroundColor: '#3B82F6' }]} />
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
    backgroundColor: '#FEF3C7',
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
    backgroundColor: '#F59E0B',
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
  examplePhrase: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginBottom: 16,
  },
  examplePhraseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 12,
    flex: 1,
  },
  exampleNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
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
    backgroundColor: '#F59E0B',
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
    backgroundColor: '#F59E0B',
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
    justifyContent: 'space-between',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
  },
  twisterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F59E0B',
    marginBottom: 30,
  },
  twisterText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 32,
  },
  microphoneContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  microphoneRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
  },
  microphoneRingActive: {
    backgroundColor: '#FEE2E2',
  },
  microphoneRing2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F9FAFB',
  },
  microphoneRing2Active: {
    backgroundColor: '#FEF2F2',
  },
  microphoneIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#E5E7EB',
    zIndex: 10,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 18,
    borderRadius: 12,
    gap: 12,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
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
    color: '#F59E0B',
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
  metricRow: {
    width: '100%',
    marginBottom: 20,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  metricBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
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
    color: '#F59E0B',
  },
});