import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {getSymbol} from '@/logic/SymbolMap';
import { useState, useEffect } from 'react';
import { GameTimer } from '@/components/GameTimer';


export default function DSST() {
const [gameStart, setgameStart] = useState(false) 
const [gameCompleted, setgameCompleted] = useState(false)
const [score, setScore] = useState(0);
const [toChoose, setToChoose] = useState(3); // this is the number that user will match based on the grid
const [totalAttempts, setTotalAttempts] = useState(0);


// this page consists of 3 main screens/states of the game -> intro screen/instructions , the main game screen, and the final score/scorecard


  const router = useRouter();

  const handleBackToDashboard = () => {
  setgameStart(false);
  setgameCompleted(false);
  setScore(0);
  setTotalAttempts(0);
  setToChoose(3);
  
 router.replace('/(tabs)/dashboard')
  };

  const array = [1, 2, 3, 4, 5, 6]

//again here we use fisher-yates to randomize the option grid
//   const arrayShuffle = (array: number[]) => {
//     for (let i = array.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [array[i], array[j]] = [array[j], array[i]];
//   }
//   return array;
// }

// when the option is clicked, the number is updated

const toChooseupdate = () => { // randomize the number to choose
  const randomNum = Math.floor(Math.random() * 6) + 1;
  setToChoose(randomNum); 
};

const handleAnswerSelect = (selectedNum: number) => {
  const isCorrect = getSymbol(selectedNum) === getSymbol(toChoose); 
  
  if (isCorrect) {
    setScore(score + 1);
  }
  
  setTotalAttempts(totalAttempts + 1);
  toChooseupdate(); // to move to the next question
};

const handleGameOver = () => { // when time is up, the game scoreboard is shown through conditionals
  setgameCompleted(true);
  setgameStart(false);
};

const gameStartState = () => { // initial game state
  setgameStart(true);
  setScore(0);
  setTotalAttempts(0);
  toChooseupdate(); 
};

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {!gameStart && !gameCompleted && ( //if the gamestart and gamecompleted are  false, then game intro screen is shown
    <>
     {/*back button*/}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToDashboard} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DSST</Text>
        <View style={styles.placeholder} />
      </View>


      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="grid-outline" size={64} color="#8B5CF6" />
        </View>

        <Text style={styles.instructionTitle}>Digit Symbol Substitution Test</Text>
        
        <Text style={styles.instructionText}>
          Match the number to its corresponding symbol as quickly and accurately as possible.
        </Text>

        <View style={styles.exampleBox}>
          <Text style={styles.exampleLabel}>How it works:</Text>

          <Text style={styles.stepTitle}>1. Reference Grid (Top)</Text>
          <View style={styles.referenceGrid}>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <View key={num} style={styles.referenceCell}>
                <Text style={styles.numberText}>{num}</Text>
                <Text style={styles.symbolText}>{getSymbol(num)}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.stepTitle}>2. Match This Number (Middle)</Text>
          <View style={styles.stimulusContainer}>
            <View style={styles.stimulusBox}>
              <Text style={styles.stimulusNumber}>3</Text>
            </View>
          </View>

          <Text style={styles.stepTitle}>3. Select the Correct Symbol (Bottom)</Text>
          <View style={styles.answerGrid}>
            {['&', '@', '#', '$', '%', '^'].map((symbol, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[
                  styles.answerCell,
                  symbol === '$' && styles.correctAnswer
                ]}
                disabled
              >
                <Text style={[
                  styles.answerSymbol,
                  symbol === '$' && styles.correctAnswerText
                ]}>
                  {symbol}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.exampleNote}>
            <Ionicons name="information-circle" size={20} color="#8B5CF6" />
            <Text style={styles.exampleNoteText}>
              For <Text style={styles.boldText}>3</Text>, you would tap <Text style={styles.boldText}>$</Text>
            </Text>
          </View>
        </View>

        <View style={styles.rulesBox}>
          <Text style={styles.rulesTitle}>Test Rules:</Text>
          <View style={styles.rule}>
            <View style={styles.bulletPoint} />
            <Text style={styles.ruleText}>60 seconds to complete as many as possible</Text>
          </View>
          <View style={styles.rule}>
            <View style={styles.bulletPoint} />
            <Text style={styles.ruleText}>Grid and answers randomize each round</Text>
          </View>
          <View style={styles.rule}>
            <View style={styles.bulletPoint} />
            <Text style={styles.ruleText}>Speed and accuracy both matter</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={gameStartState}>          
          <Text style={styles.startButtonText}>Begin Test</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
      </>)}
      
      
      {gameStart && !gameCompleted && //if the gamestart is true and gamecompleted is false, then the main gamescreen is shown
      <>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToDashboard} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>DSST</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.gameScreen}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={20} color="#8B5CF6" />
              <GameTimer time={60} onTimeUp={handleGameOver} />
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
              <Text style={styles.statText}>{score}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Reference:</Text>
          <View style={styles.referenceGrid}>
            {array.map((num) => (
              <View key={num} style={styles.referenceCell}>
                <Text style={styles.numberText}>{num}</Text>
                <Text style={styles.symbolText}>{getSymbol(num)}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Match this number:</Text>
          <View style={styles.stimulusContainer}>
            <View style={styles.stimulusBox}>
              <Text style={styles.stimulusNumber}>{toChoose}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Select the symbol:</Text>
          <View style={styles.referenceGrid}>
            {array.map((num) => (
              <TouchableOpacity 
                key={num} 
                style={styles.referenceCell}
                onPress={()=>{
                    handleAnswerSelect(num)
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.symbolText}>{getSymbol(num)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </>}

      {gameCompleted && ( // finally, if the gameCompleted is true, then the final result/scorecard is shown
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToDashboard} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>DSST - Results</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView contentContainerStyle={styles.resultScreen}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: score >= 25 ? '#D1FAE5' : '#FEE2E2' }
            ]}>
              <Ionicons 
                name={score >= 25 ? "checkmark-circle" : "close-circle"} 
                size={64} 
                color={score >= 25 ? "#10B981" : "#EF4444"} 
              />
            </View>

            <Text style={styles.resultTitle}>
              {score >= 25 ? 'Excellent!' : 'Test Complete'}
            </Text>
            <Text style={styles.resultSubtitle}>
              {score >= 25 
                ? 'You passed the DSST!' 
                : 'Keep practicing to improve your speed'}
            </Text>

            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Final Score</Text>
              <Text style={styles.scoreValue}>{score}</Text>
              <Text style={styles.scoreSubtext}>correct matches</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statItemLabel}>Accuracy</Text>
                  <Text style={styles.statItemValue}>
                    {totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0}%
                  </Text>
                </View>
                <View style={styles.statItemDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statItemLabel}>Total</Text>
                  <Text style={styles.statItemValue}>{totalAttempts}</Text>
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
    backgroundColor: '#F5F3FF',
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
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    marginTop: 16,
  },

  // Reference Grid
  referenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  referenceCell: {
    width: '30%',
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  numberText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  symbolText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3B82F6',
  },

  // Stimulus
  stimulusContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  stimulusBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderRadius: 12,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stimulusNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F2937',
  },

  // Answer Grid
  answerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  answerCell: {
    width: '30%',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  correctAnswer: {
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  answerSymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#EF4444',
  },
  correctAnswerText: {
    color: '#10B981',
  },

  // Example Note
  exampleNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  exampleNoteText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
    color: '#8B5CF6',
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
    backgroundColor: '#8B5CF6',
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
    backgroundColor: '#8B5CF6',
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
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
    marginBottom: 30,
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
    color: '#8B5CF6',
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
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
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
    color: '#8B5CF6',
  },
});