import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

const SCREEN_W = Dimensions.get('window').width;
const DEMO_ANIMATION = require('../../../../assets/animation/trail_making_demo.json'); 

export default function TrailTaskDemo() {
  const [isFullVideo, setIsFullVideo] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const panY = useRef(new Animated.Value(0)).current;
  const collapseAnim = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 1,
      onPanResponderGrant: () => {
        panY.setOffset((panY as any).__getValue());
        panY.setValue(0);
      },
      onPanResponderMove: Animated.event([null, { dy: panY }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        panY.flattenOffset();
      },
    })
  ).current;

  const toggleCollapse = (toCollapsed: boolean) => {
    setIsCollapsed(toCollapsed);
    Animated.timing(collapseAnim, {
      toValue: toCollapsed ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const handleCloseFullVideo = () => {
    setIsFullVideo(false);
    toggleCollapse(true);
  };

  const boxWidth = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, SCREEN_W / 2.8]
  });

  const contentOpacity = collapseAnim;
  const stripOpacity = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0]
  });

  return (
    <>
      {/* 悬浮窗独立存在，不再嵌套在图片容器中 */}
      <Animated.View 
        style={[
          styles.floatingBox,
          {
            transform: [{ translateY: panY }],
            width: boxWidth,
          }
        ]}
        {...panResponder.panHandlers}
      >
        <Animated.View 
          style={[StyleSheet.absoluteFill, { opacity: contentOpacity, zIndex: isCollapsed ? -1 : 1 }]}
          pointerEvents={isCollapsed ? 'none' : 'auto'}
        >
          <Pressable style={styles.floatingPressable} onPress={() => setIsFullVideo(true)}>
            <LottieView source={DEMO_ANIMATION} style={styles.floatingLottie} progress={0.5} />
            <View style={styles.playButtonOverlay}>
              <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.8)" />
            </View>
          </Pressable>

          <TouchableOpacity style={styles.closeTinyButton} onPress={() => toggleCollapse(true)}>
            <Ionicons name="close-circle" size={24} color="#666" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View 
          style={[styles.collapsedStrip, { opacity: stripOpacity, zIndex: isCollapsed ? 1 : -1 }]}
          pointerEvents={!isCollapsed ? 'none' : 'auto'}
        >
          <TouchableOpacity style={styles.expandArea} onPress={() => toggleCollapse(false)}>
            <Ionicons name="chevron-back" size={24} color="#999" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      <Modal visible={isFullVideo} transparent={true} animationType="fade" onRequestClose={handleCloseFullVideo}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCloseFullVideo} />
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={handleCloseFullVideo}>
              <Ionicons name="close" size={28} color="rgba(0,0,0,0.3)" />
            </TouchableOpacity>
            <LottieView source={DEMO_ANIMATION} style={styles.fullLottie} autoPlay loop />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingBox: {
    position: 'absolute',
    bottom: 150, // 改为距离屏幕底部固定位置
    right: 20,  // 改为距离屏幕右侧固定位置
    height: SCREEN_W / 2.8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 1000, // 确保浮在最上层
  },
  floatingPressable: { width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden' },
  floatingLottie: { width: '100%', height: '100%' },
  playButtonOverlay: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center' },
  closeTinyButton: { position: 'absolute', top: -10, right: -10, backgroundColor: '#FFF', borderRadius: 12 },
  collapsedStrip: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  expandArea: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { 
    width: SCREEN_W * 0.85, 
    height: SCREEN_W * 0.85, 
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: { position: 'absolute', top: 10, right: 10, zIndex: 10 },
  fullLottie: { width: '100%', height: '100%' },
});