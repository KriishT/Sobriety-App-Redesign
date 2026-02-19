import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import StroopBrick from '@/components/StroopBricks';
import { StroopGameGen } from '@/logic/StroopGameGen';
import { GameTimer } from '@/components/GameTimer';

export default function StroopNaming() {
  const router = useRouter();
  const [color, setColor] = useState("");
  const [colorWord, setColorWord] = useState("");
  const [options, setGameOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const parseGameGen = () => {
    const gameInfo = StroopGameGen();
    setColor(gameInfo.word_color);
    setColorWord(gameInfo.word);
    setGameOptions(gameInfo.options);
  };

  const checkIfCorrect = (option: string) => {
    if (option.toLowerCase() === color) {
      setScore(score + 1);
    }
    setTotalAttempts(totalAttempts + 1);
    parseGameGen();
  };

  const startGame = () => {
    setScore(0);
    setTotalAttempts(0);
    setGameOver(false);
    setGameStarted(true);
    parseGameGen();
  };

  const handleGameOver = () => {
    setGameOver(true);
    setGameStarted(false);
  };

  const handleBackToDashboard = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToDashboard} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stroop Naming</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {/* START SCREEN */}
        {!gameStarted && !gameOver && (
          <View style={styles.startScreen}>
            <View style={styles.iconContainer}>
              <Ionicons name="text-outline" size={64} color="#3B82F6" />
            </View>
            <Text style={styles.instructionTitle}>Stroop Test</Text>
            <Text style={styles.instructionText}>
              A word will appear at the top. Choose the answer that matches the{' '}
              <Text style={styles.boldText}>COLOR</Text> of the word, not what the text says.
            </Text>
            
            {/* Example */}
            <View style={styles.exampleBox}>
              <Text style={styles.exampleLabel}>Example:</Text>
              <StroopBrick color="#F3F4F6" text="GREEN" textColor="red" />
              <Text style={styles.exampleText}>
                Correct answer: <Text style={styles.boldText}>Red</Text> (the color of the text)
              </Text>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <Text style={styles.startButtonText}>Begin Test</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* PLAY SCREEN */}
        {gameStarted && !gameOver && (
          <View style={styles.playScreen}>
            {/* Timer & Score */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Ionicons name="time-outline" size={20} color="#4F46E5" />
                <GameTimer time={30} onTimeUp={handleGameOver} />
              </View>
              <View style={styles.statCard}>
                <Ionicons name="trophy-outline" size={20} color="#10B981" />
                <Text style={styles.statText}>{score}</Text>
              </View>
            </View>

            {/* Instruction reminder */}
            <Text style={styles.reminderText}>Select the COLOR of the word</Text>

            {/* Main Brick */}
            <View style={styles.mainBrickContainer}>
              <StroopBrick color="#F3F4F6" text={colorWord} textColor={color} />
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {options.map((opt, i) => (
                <TouchableOpacity 
                  key={i} 
                  onPress={() => checkIfCorrect(opt)}
                  activeOpacity={0.7}
                >
                  <StroopBrick color={opt.toLowerCase()} text={opt} textColor="white" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* RESULT SCREEN */}
        {gameOver && (
          <View style={styles.resultScreen}>
            <View style={[styles.iconContainer, { backgroundColor: score >= 20 ? '#D1FAE5' : '#FEE2E2' }]}>
              <Ionicons 
                name={score >= 20 ? "checkmark-circle" : "close-circle"} 
                size={64} 
                color={score >= 20 ? "#10B981" : "#EF4444"} 
              />
            </View>
            <Text style={styles.resultTitle}>
              {score >= 20 ? 'Great Job!' : 'Test Complete'}
            </Text>
            <Text style={styles.resultSubtitle}>
              {score >= 20 
                ? 'You passed the Stroop test!' 
                : 'Keep practicing to improve your score'}
            </Text>

            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Final Score</Text>
              <Text style={styles.scoreValue}>{score}</Text>
              <Text style={styles.scoreSubtext}>correct answers out of {totalAttempts}</Text>
              <View style={styles.accuracyContainer}>
                <Text style={styles.accuracyLabel}>Accuracy:</Text>
                <Text style={styles.accuracyValue}>
                  {totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0}%
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity style={styles.retryButton} onPress={startGame}>
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.homeButton} onPress={handleBackToDashboard}>
              <Text style={styles.homeButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // START SCREEN
  startScreen: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  boldText: {
    fontWeight: '700',
    color: '#4F46E5',
  },
  exampleBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 30,
    width: '100%',
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
  },
  exampleText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },

  // PLAY SCREEN
  playScreen: {
    width: '100%',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
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
  reminderText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  mainBrickContainer: {
    marginVertical: 30,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 20,
  },

  // RESULT SCREEN
  resultScreen: {
    alignItems: 'center',
    paddingHorizontal: 40,
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
    marginBottom: 30,
    minWidth: 220,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 4,
  },
  scoreSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  accuracyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  accuracyLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  accuracyValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
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
    color: '#4F46E5',
  },
});