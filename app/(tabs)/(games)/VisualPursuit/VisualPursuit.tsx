import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';

const { width } = Dimensions.get('window');
const BALL_SIZE = 40;
const CANVAS_WIDTH = width - 40;
const CANVAS_HEIGHT = 400;
const HORIZONTAL_DURATION = 10; // 10 seconds horizontal
const PAUSE_DURATION = 5; // 5 seconds pause
const VERTICAL_DURATION = 10; // 10 seconds vertical

type TestPhase = 'camera-horizontal' | 'horizontal' | 'pause' | 'camera-vertical' | 'vertical' | 'complete';

export default function VisualPursuit() {
  const [gameStart, setGameStart] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraOrientation, setCameraOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [testPhase, setTestPhase] = useState<TestPhase>('camera-horizontal');
  
  // Ball animation state
  const [ballPosition, setBallPosition] = useState({ x: 50, y: CANVAS_HEIGHT / 2 });
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [movingRight, setMovingRight] = useState(true);
  const [movingDown, setMovingDown] = useState(true);
  
  // Hardcoded results
  const [nystagmusScore] = useState(85); // 0-100
  const [pupilResponse] = useState(92); // 0-100
  const [eyeRedness] = useState(15); // 0-100 (lower is better)

  const animationRef = useRef<any>(null);
  const router = useRouter();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  const handleBackToDashboard = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    router.replace('/(tabs)/dashboard');
  };

  const startBallAnimation = () => {
    animationRef.current = setInterval(() => {
      setBallPosition(prev => {
        if (direction === 'horizontal') {
          let newX = prev.x;
          
          if (movingRight) {
            newX += 4;
            if (newX >= CANVAS_WIDTH - BALL_SIZE) {
              newX = CANVAS_WIDTH - BALL_SIZE; // Clamp to edge
              setMovingRight(false);
            }
          } else {
            newX -= 4;
            if (newX <= 0) {
              newX = 0; // Clamp to edge
              setMovingRight(true);
            }
          }
          
          return { x: newX, y: prev.y };
        } else {
          // Vertical movement
          let newY = prev.y;
          
          if (movingDown) {
            newY += 4;
            if (newY >= CANVAS_HEIGHT - BALL_SIZE) {
              newY = CANVAS_HEIGHT - BALL_SIZE; // Clamp to edge
              setMovingDown(false);
            }
          } else {
            newY -= 4;
            if (newY <= 0) {
              newY = 0; // Clamp to edge
              setMovingDown(true);
            }
          }
          
          return { x: prev.x, y: newY };
        }
      });
    }, 30);
  };

  const gameStartState = () => {
    setShowCamera(true);
    setCameraOrientation('horizontal');
    setTestPhase('camera-horizontal');
    
    // Phase 1: Horizontal camera alignment (2 seconds)
    setTimeout(() => {
      setShowCamera(false);
      setGameStart(true);
      setGameCompleted(false);
      setTestPhase('horizontal');
      
      // Start horizontal ball movement
      setDirection('horizontal');
      setBallPosition({ x: 50, y: CANVAS_HEIGHT / 2 });
      setMovingRight(true);
      
      startBallAnimation();
      
      // Phase 2: After 10 seconds, pause for realignment
      setTimeout(() => {
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
        setTestPhase('pause');
        
        // Phase 3: After 5 second pause, show vertical camera alignment
        setTimeout(() => {
          setShowCamera(true);
          setCameraOrientation('vertical');
          setTestPhase('camera-vertical');
          
          // Phase 4: After 2 seconds, start vertical test
          setTimeout(() => {
            setShowCamera(false);
            setTestPhase('vertical');
            
            // Start vertical ball movement
            setDirection('vertical');
            setBallPosition({ x: CANVAS_WIDTH / 2, y: 50 });
            setMovingDown(true);
            
            startBallAnimation();
            
            // Phase 5: After 10 seconds, complete
            setTimeout(() => {
              handleGameOver();
            }, VERTICAL_DURATION * 1000);
          }, 2000);
        }, PAUSE_DURATION * 1000);
      }, HORIZONTAL_DURATION * 1000);
    }, 2000);
  };

  const handleGameOver = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    setGameStart(false);
    setGameCompleted(true);
  };

  const overallScore = Math.round((nystagmusScore + pupilResponse + (100 - eyeRedness)) / 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* INSTRUCTIONS SCREEN */}
      {!gameStart && !gameCompleted && !showCamera && (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToDashboard} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Visual Pursuit</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="eye-outline" size={64} color="#6366F1" />
            </View>

            <Text style={styles.instructionTitle}>Visual Pursuit Test</Text>
            
            <Text style={styles.instructionText}>
              Follow the moving ball with your eyes only. Do not move your head! The camera will record your eye movements.
            </Text>

            {/* Example Section */}
            <View style={styles.exampleBox}>
              <Text style={styles.exampleLabel}>How it works:</Text>

              <View style={styles.stepContainer}>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>Position your face in front of camera (horizontal)</Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>Follow the yellow ball horizontally (10 seconds)</Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>Rotate phone to vertical (5 second pause)</Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <Text style={styles.stepText}>Follow the ball vertically (10 seconds)</Text>
                </View>
              </View>

              <View style={styles.exampleNote}>
                <Ionicons name="information-circle" size={20} color="#6366F1" />
                <Text style={styles.exampleNoteText}>
                  We measure nystagmus, pupil response, and eye redness
                </Text>
              </View>
            </View>

            {/* Rules */}
            <View style={styles.rulesBox}>
              <Text style={styles.rulesTitle}>Test Rules:</Text>
              <View style={styles.rule}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ruleText}>Total duration: ~27 seconds</Text>
              </View>
              <View style={styles.rule}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ruleText}>Keep head completely still</Text>
              </View>
              <View style={styles.rule}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ruleText}>Only move your eyes to follow the ball</Text>
              </View>
              <View style={styles.rule}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ruleText}>Camera records for analysis</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={gameStartState}>
              <Text style={styles.startButtonText}>Begin Test</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </ScrollView>
        </>
      )}

      {/* CAMERA OPENING SCREEN */}
      {showCamera && (
        <View style={styles.cameraScreen}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToDashboard} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Visual Pursuit</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.cameraContainer}>
            <View style={[
              styles.faceOutline,
              cameraOrientation === 'vertical' && styles.faceOutlineVertical
            ]}>
              <Ionicons name="happy-outline" size={120} color="#6366F1" />
            </View>
            <Text style={styles.cameraText}>
              {cameraOrientation === 'horizontal' 
                ? 'Hold phone horizontally (landscape)' 
                : 'Hold phone vertically (portrait)'}
            </Text>
            <Text style={styles.cameraSubtext}>Position your face in the frame</Text>
            <View style={styles.orientationIndicator}>
              <Ionicons 
                name={cameraOrientation === 'horizontal' ? 'phone-landscape-outline' : 'phone-portrait-outline'} 
                size={48} 
                color="#6366F1" 
              />
            </View>
          </View>
        </View>
      )}

      {/* GAME SCREEN */}
      {gameStart && !gameCompleted && !showCamera && (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToDashboard} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Visual Pursuit</Text>
            <View style={styles.placeholder} />
          </View>

          {/* PAUSE SCREEN */}
          {testPhase === 'pause' && (
            <View style={styles.pauseScreen}>
              <View style={styles.pauseCard}>
                <Ionicons name="sync-outline" size={80} color="#6366F1" />
                <Text style={styles.pauseTitle}>Rotate Your Phone</Text>
                <Text style={styles.pauseSubtitle}>
                  Please rotate your phone to vertical (portrait) orientation
                </Text>
                <View style={styles.pauseTimer}>
                  <Ionicons name="time-outline" size={24} color="#6366F1" />
                  <Text style={styles.pauseTimerText}>Resuming in {PAUSE_DURATION} seconds...</Text>
                </View>
                <Ionicons name="phone-portrait-outline" size={64} color="#6366F1" style={{ marginTop: 20 }} />
              </View>
            </View>
          )}

          {/* ACTIVE TEST SCREEN */}
          {(testPhase === 'horizontal' || testPhase === 'vertical') && (
            <View style={styles.gameScreen}>
              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.directionCard}>
                  <Ionicons 
                    name={direction === 'horizontal' ? 'resize-outline' : 'swap-vertical-outline'} 
                    size={20} 
                    color="#6366F1" 
                  />
                  <Text style={styles.directionText}>
                    {direction === 'horizontal' ? 'Horizontal Test' : 'Vertical Test'}
                  </Text>
                </View>
              </View>

              {/* Instructions */}
              <View style={styles.instructionCard}>
                <Ionicons name="eye-outline" size={24} color="#6366F1" />
                <Text style={styles.gameInstruction}>
                  Follow the ball with your eyes only. Keep your head still!
                </Text>
              </View>

              {/* Ball Animation Canvas */}
              <View style={styles.canvas}>
                <View 
                  style={[
                    styles.ball,
                    {
                      left: ballPosition.x,
                      top: ballPosition.y,
                    }
                  ]} 
                />
              </View>

              {/* Camera indicator */}
              <View style={styles.cameraIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Recording</Text>
              </View>
            </View>
          )}
        </>
      )}

      {/* RESULT SCREEN */}
      {gameCompleted && (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToDashboard} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Visual Pursuit - Results</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView contentContainerStyle={styles.resultScreen}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: overallScore >= 70 ? '#EEF2FF' : '#FEE2E2' }
            ]}>
              <Ionicons 
                name={overallScore >= 70 ? "checkmark-circle" : "close-circle"} 
                size={64} 
                color={overallScore >= 70 ? "#6366F1" : "#EF4444"} 
              />
            </View>

            <Text style={styles.resultTitle}>
              {overallScore >= 70 ? 'Excellent Eye Tracking!' : 'Test Complete'}
            </Text>
            <Text style={styles.resultSubtitle}>
              {overallScore >= 70 
                ? 'Your eye movements are very good!' 
                : 'Practice to improve eye coordination'}
            </Text>

            {/* Overall Score */}
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Overall Score</Text>
              <Text style={styles.scoreValue}>{overallScore}</Text>
              <Text style={styles.scoreSubtext}>out of 100</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statItemLabel}>Duration</Text>
                  <Text style={styles.statItemValue}>27s</Text>
                </View>
                <View style={styles.statItemDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statItemLabel}>Status</Text>
                  <Text style={[
                    styles.statItemValue,
                    { color: overallScore >= 70 ? '#6366F1' : '#EF4444' }
                  ]}>
                    {overallScore >= 70 ? 'Pass' : 'Fail'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Detailed Metrics */}
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Detailed Analysis</Text>
              
              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Nystagmus Control</Text>
                  <Text style={styles.metricValue}>{nystagmusScore}/100</Text>
                </View>
                <View style={styles.metricBar}>
                  <View style={[styles.metricBarFill, { width: `${nystagmusScore}%`, backgroundColor: '#6366F1' }]} />
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Pupil Response</Text>
                  <Text style={styles.metricValue}>{pupilResponse}/100</Text>
                </View>
                <View style={styles.metricBar}>
                  <View style={[styles.metricBarFill, { width: `${pupilResponse}%`, backgroundColor: '#10B981' }]} />
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Eye Redness</Text>
                  <Text style={styles.metricValue}>{eyeRedness}/100</Text>
                </View>
                <View style={styles.metricBar}>
                  <View style={[styles.metricBarFill, { width: `${eyeRedness}%`, backgroundColor: '#EF4444' }]} />
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
    backgroundColor: '#EEF2FF',
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
    backgroundColor: '#6366F1',
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
    backgroundColor: '#EEF2FF',
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
    backgroundColor: '#6366F1',
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
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },

  // CAMERA SCREEN
  cameraScreen: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  faceOutline: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  faceOutlineVertical: {
    transform: [{ rotate: '90deg' }],
  },
  cameraText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  cameraSubtext: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  orientationIndicator: {
    marginTop: 30,
    padding: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 12,
  },

  // PAUSE SCREEN
  pauseScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FAFAFA',
  },
  pauseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#6366F1',
    maxWidth: 400,
  },
  pauseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
  },
  pauseSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  pauseTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  pauseTimerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA',
  },

  // GAME SCREEN
  gameScreen: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  directionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  directionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA',
    marginLeft: 8,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  gameInstruction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA',
    marginLeft: 12,
    flex: 1,
  },
  canvas: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6366F1',
    position: 'relative',
    marginBottom: 20,
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: '#EAB308',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cameraIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
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
    color: '#6366F1',
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
    backgroundColor: '#6366F1',
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
    color: '#6366F1',
  },
});