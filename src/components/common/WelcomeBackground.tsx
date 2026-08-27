import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { colors } from '../../theme';
import { Activity, Heart, Stethoscope, Plus, Pill } from 'lucide-react-native';

const { height, width } = Dimensions.get('window');

const FloatingIcon = ({ icon: Icon, delay, startX, startY, endY, scale, opacity }: any) => {
  const translateY = useSharedValue(startY);
  const rotate = useSharedValue(0);
  const scaleAnim = useSharedValue(scale);

  useEffect(() => {
    translateY.value = withDelay(delay, 
      withRepeat(
        withSequence(
          withTiming(endY, { duration: 15000 + Math.random() * 8000, easing: Easing.linear }),
          withTiming(startY, { duration: 0 })
        ),
        -1,
        false
      )
    );

    rotate.value = withRepeat(
      withTiming(360, { duration: 12000 + Math.random() * 6000, easing: Easing.linear }),
      -1,
      false
    );
    
    scaleAnim.value = withRepeat(
      withSequence(
        withTiming(scale * 1.4, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(scale * 0.8, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { scale: scaleAnim.value }
      ],
      opacity,
      position: 'absolute',
      left: startX,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Icon size={45} color={colors.primary} strokeWidth={2.5} />
    </Animated.View>
  );
};

export const WelcomeBackground = () => {
  const blob1Scale = useSharedValue(1);
  const blob2Scale = useSharedValue(1);
  const blob3Scale = useSharedValue(1);

  useEffect(() => {
    blob1Scale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    blob2Scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.8, { duration: 8000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    
    blob3Scale.value = withRepeat(
      withSequence(
        withTiming(1.8, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const blob1Style = useAnimatedStyle(() => ({ transform: [{ scale: blob1Scale.value }] }));
  const blob2Style = useAnimatedStyle(() => ({ transform: [{ scale: blob2Scale.value }] }));
  const blob3Style = useAnimatedStyle(() => ({ transform: [{ scale: blob3Scale.value }] }));

  const startY = height + 100;
  const endY = -150;

  return (
    <View style={styles.container}>
      {/* Huge Animated Background Blobs */}
      <Animated.View style={[styles.blob, styles.blob1, blob1Style]} />
      <Animated.View style={[styles.blob, styles.blob2, blob2Style]} />
      <Animated.View style={[styles.blob, styles.blob3, blob3Style]} />
      
      {/* Dense Floating Medical Icons across the entire screen height */}
      <FloatingIcon icon={Stethoscope} delay={0} startX="5%" startY={startY} endY={endY} scale={0.8} opacity={0.12} />
      <FloatingIcon icon={Heart} delay={2000} startX="20%" startY={startY} endY={endY} scale={0.7} opacity={0.15} />
      <FloatingIcon icon={Activity} delay={1000} startX="40%" startY={startY} endY={endY} scale={1} opacity={0.1} />
      <FloatingIcon icon={Plus} delay={4000} startX="60%" startY={startY} endY={endY} scale={0.9} opacity={0.12} />
      <FloatingIcon icon={Pill} delay={1500} startX="85%" startY={startY} endY={endY} scale={0.8} opacity={0.15} />
      
      <FloatingIcon icon={Heart} delay={6000} startX="12%" startY={startY} endY={endY} scale={0.6} opacity={0.1} />
      <FloatingIcon icon={Stethoscope} delay={3500} startX="55%" startY={startY} endY={endY} scale={0.7} opacity={0.12} />
      <FloatingIcon icon={Plus} delay={7000} startX="75%" startY={startY} endY={endY} scale={0.5} opacity={0.1} />
      <FloatingIcon icon={Activity} delay={8000} startX="35%" startY={startY} endY={endY} scale={0.7} opacity={0.12} />
      <FloatingIcon icon={Pill} delay={5000} startX="92%" startY={startY} endY={endY} scale={0.6} opacity={0.15} />

      <FloatingIcon icon={Activity} delay={9000} startX="25%" startY={startY} endY={endY} scale={0.8} opacity={0.1} />
      <FloatingIcon icon={Heart} delay={11000} startX="65%" startY={startY} endY={endY} scale={0.9} opacity={0.12} />
      <FloatingIcon icon={Stethoscope} delay={10000} startX="80%" startY={startY} endY={endY} scale={0.5} opacity={0.1} />

      {/* A subtle gradient/overlay to ensure text remains highly readable */}
      <View style={styles.overlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#F4FDFF', // matches the new logo soft background
  },
  blob: {
    position: 'absolute',
    borderRadius: 300,
    opacity: 0.5,
  },
  blob1: {
    width: 400,
    height: 400,
    top: -100,
    left: -100,
    backgroundColor: colors.primary + '20', // extremely light primary
  },
  blob2: {
    width: 500,
    height: 500,
    bottom: -150,
    right: -100,
    backgroundColor: '#0aa8c6' + '20', // cyan tint
  },
  blob3: {
    width: 350,
    height: 350,
    top: '30%',
    left: '20%',
    backgroundColor: '#4ade80' + '15', // subtle mint
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // glass effect to ensure text stands out
  }
});
