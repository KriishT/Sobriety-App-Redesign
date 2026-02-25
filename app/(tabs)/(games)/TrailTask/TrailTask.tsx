import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Svg, { Line, Circle as SvgCircle, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CANVAS_WIDTH = width - 40;
const CANVAS_HEIGHT = 500;

// Simple sequence array
const TRAIL_SEQUENCE = ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E'];

type CircleItem = {
  id: string;
  label: string;
  x: number;
  y: number;
  sequenceIndex: number;
};

type LineItem = {
  from: CircleItem;
  to: CircleItem;
};

export default function TrailMaking() {
  const [gameStart, setGameStart] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  
  const [circles, setCircles] = useState<CircleItem[]>([]);
  const [connectedLines, setConnectedLines] = useState<LineItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [completionTime, setCompletionTime] = useState<number>(0);
  const [isFailed, setIsFailed] = useState(false);

  const router = useRouter();

  const handleBackToDashboard = () => {
  setGameStart(false);
  setGameCompleted(false);
  setCircles([]);
  setConnectedLines([]);
  setCurrentIndex(0);
  setIsFailed(false);

    router.replace('/(tabs)/dashboard')
  };

  // Generate random positions for circles
  const generateCircles = (): CircleItem[] => {
    const newCircles: CircleItem[] = [];
    const minDistance = 70;
    const margin = 50;
    
    TRAIL_SEQUENCE.forEach((label, index) => {
      let x, y;
      let attempts = 0;
      
      do {
        x = Math.random() * (CANVAS_WIDTH - 2 * margin) + margin;
        y = Math.random() * (CANVAS_HEIGHT - 2 * margin) + margin;
        attempts++;
        
        const tooClose = newCircles.some(circle => {
          const distance = Math.sqrt(
            Math.pow(circle.x - x, 2) + Math.pow(circle.y - y, 2)
          );
          return distance < minDistance;
        });
        
        if (!tooClose || attempts >= 100) break;
      } while (true);
      
      newCircles.push({
        id: `circle-${index}`,
        label,
        x,
        y,
        sequenceIndex: index,
      });
    });
    
    return newCircles;
  };

  const handleCirclePress = (circle: CircleItem) => {
    if (circle.sequenceIndex === currentIndex) {
      // ✅ CORRECT
      if (currentIndex > 0) {
        const previousCircle = circles.find(c => c.sequenceIndex === currentIndex - 1);
        if (previousCircle) {
          setConnectedLines(prev => [...prev, { from: previousCircle, to: circle }]);
        }
      }
      
      setCurrentIndex(currentIndex + 1);
      
      // Check if completed
      if (currentIndex === circles.length - 1) {
        const endTime = Date.now();
        setCompletionTime(Math.round((endTime - startTime) / 1000));
        setGameCompleted(true);
        setGameStart(false);
        setIsFailed(false);
      }
    } else {
      // ❌ WRONG - INSTANT FAIL
      const endTime = Date.now();
      setCompletionTime(Math.round((endTime - startTime) / 1000));
      setGameCompleted(true);
      setGameStart(false);
      setIsFailed(true);
    }
  };

  const gameStartState = () => {
    const newCircles = generateCircles();
    setCircles(newCircles);
    setConnectedLines([]);
    setCurrentIndex(0);
    setStartTime(Date.now());
    setGameStart(true);
    setGameCompleted(false);
    setIsFailed(false);
  };

  const getNextLabel = () => {
    if (currentIndex < circles.length) {
      return TRAIL_SEQUENCE[currentIndex];
    }
    return '';
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
            <Text style={styles.headerTitle}>Trail Making</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="git-branch-outline" size={64} color="#F59E0B" />
            </View>

            <Text style={styles.instructionTitle}>Trail Making Task</Text>
            
            <Text style={styles.instructionText}>
              Connect the circles in order, alternating between numbers and letters: 1 → A → 2 → B → 3 → C...
            </Text>

            {/* Example Section */}
            <View style={styles.exampleBox}>
              <Text style={styles.exampleLabel}>How it works:</Text>

              <Text style={styles.stepTitle}>Sequence Pattern:</Text>
              <View style={styles.sequenceContainer}>
                <View style={styles.sequenceItem}>
                  <Text style={styles.sequenceText}>1</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#F59E0B" />
                <View style={styles.sequenceItem}>
                  <Text style={styles.sequenceText}>A</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#F59E0B" />
                <View style={styles.sequenceItem}>
                  <Text style={styles.sequenceText}>2</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#F59E0B" />
                <View style={styles.sequenceItem}>
                  <Text style={styles.sequenceText}>B</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#F59E0B" />
                <View style={styles.sequenceItem}>
                  <Text style={styles.sequenceText}>3</Text>
                </View>
              </View>

              <View style={styles.exampleNote}>
                <Ionicons name="information-circle" size={20} color="#F59E0B" />
                <Text style={styles.exampleNoteText}>
                  Tap circles in order. A yellow trail will show your path.
                </Text>
              </View>
            </View>

            {/* Rules */}
            <View style={styles.rulesBox}>
              <Text style={styles.rulesTitle}>Test Rules:</Text>
              <View style={styles.rule}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ruleText}>Complete the sequence: 1→A→2→B→3→C→4→D→5→E</Text>
              </View>
              <View style={styles.rule}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ruleText}>Alternate between numbers and letters</Text>
              </View>
              <View style={styles.rule}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ruleText}>⚠️ ONE WRONG TAP = TEST FAILS IMMEDIATELY</Text>
              </View>
              <View style={styles.rule}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ruleText}>Complete as fast as possible for best results</Text>
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
            <Text style={styles.headerTitle}>Trail Making</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.gameScreen}>
            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#F59E0B" />
                <Text style={styles.statText}>{currentIndex} / {circles.length}</Text>
              </View>
              <View style={styles.instructionCard}>
                <Text style={styles.nextLabel}>Next: <Text style={styles.nextValue}>{getNextLabel()}</Text></Text>
              </View>
            </View>

            {/* Canvas */}
            <View style={styles.canvasContainer}>
              <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={styles.svg}>
                {/* Draw lines */}
                {connectedLines.map((line, index) => (
                  <Line
                    key={`line-${index}`}
                    x1={line.from.x}
                    y1={line.from.y}
                    x2={line.to.x}
                    y2={line.to.y}
                    stroke="#EAB308"
                    strokeWidth={6}
                  />
                ))}

                {/* Draw circles */}
                {circles.map((circle) => {
                  const isCompleted = circle.sequenceIndex < currentIndex;
                  const isCurrent = circle.sequenceIndex === currentIndex;
                  
                  return (
                    <SvgCircle
                      key={circle.id}
                      cx={circle.x}
                      cy={circle.y}
                      r={30}
                      fill={isCompleted ? '#EAB308' : '#FFFFFF'}
                      stroke={isCurrent ? '#F59E0B' : '#D1D5DB'}
                      strokeWidth={isCurrent ? 4 : 2}
                    />
                  );
                })}

                {/* Draw text */}
                {circles.map((circle) => {
                  const isCompleted = circle.sequenceIndex < currentIndex;
                  
                  return (
                    <SvgText
                      key={`text-${circle.id}`}
                      x={circle.x}
                      y={circle.y + 8}
                      fontSize="20"
                      fontWeight="700"
                      fill={isCompleted ? '#FFFFFF' : '#1F2937'}
                      textAnchor="middle"
                    >
                      {circle.label}
                    </SvgText>
                  );
                })}
              </Svg>

              {/* Invisible touchable layer */}
              <View style={styles.touchableLayer}>
                {circles.map((circle) => (
                  <TouchableOpacity
                    key={`touch-${circle.id}`}
                    style={[
                      styles.touchableCircle,
                      {
                        left: circle.x - 30,
                        top: circle.y - 30,
                      },
                    ]}
                    onPress={() => handleCirclePress(circle)}
                    activeOpacity={0.7}
                  />
                ))}
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
            <Text style={styles.headerTitle}>Trail Making - Results</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView contentContainerStyle={styles.resultScreen}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: !isFailed ? '#FEF3C7' : '#FEE2E2' }
            ]}>
              <Ionicons 
                name={!isFailed ? "checkmark-circle" : "close-circle"} 
                size={64} 
                color={!isFailed ? "#F59E0B" : "#EF4444"} 
              />
            </View>

            <Text style={styles.resultTitle}>
              {!isFailed ? 'Perfect!' : 'Test Failed'}
            </Text>
            <Text style={styles.resultSubtitle}>
              {!isFailed 
                ? 'You completed the trail without errors!' 
                : 'You tapped the wrong circle'}
            </Text>

            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Completion Time</Text>
              <Text style={styles.scoreValue}>{completionTime}</Text>
              <Text style={styles.scoreSubtext}>seconds</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statItemLabel}>Status</Text>
                  <Text style={[
                    styles.statItemValue,
                    { color: !isFailed ? '#F59E0B' : '#EF4444' }
                  ]}>
                    {!isFailed ? 'Pass' : 'Fail'}
                  </Text>
                </View>
                <View style={styles.statItemDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statItemLabel}>Progress</Text>
                  <Text style={styles.statItemValue}>{currentIndex}/{circles.length}</Text>
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
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  sequenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  sequenceItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sequenceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
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
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 6,
  },
  instructionCard: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  nextLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  nextValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F59E0B',
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  svg: {
    backgroundColor: '#FAFAFA',
  },
  touchableLayer: {
    position: 'absolute',
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
  touchableCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
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