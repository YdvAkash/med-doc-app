import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
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

const FloatingIcon = ({ icon: Icon, delay, startX, startY, endY, scale, opacity }: any) => {
  const translateY = useSharedValue(startY);
  const rotate = useSharedValue(0);
  const scaleAnim = useSharedValue(scale);

  useEffect(() => {
    translateY.value = withDelay(delay, 
      withRepeat(
        withSequence(
          withTiming(endY, { duration: 8000 + Math.random() * 4000, easing: Easing.linear }),
          withTiming(startY, { duration: 0 })
        ),
        -1,
        false
      )
    );

    rotate.value = withRepeat(
      withTiming(360, { duration: 10000 + Math.random() * 5000, easing: Easing.linear }),
      -1,
      false
    );
    
    scaleAnim.value = withRepeat(
      withSequence(
        withTiming(scale * 1.3, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(scale * 0.8, { duration: 3000, easing: Easing.inOut(Easing.ease) })
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
      <Icon size={40} color={colors.primary} strokeWidth={2} />
    </Animated.View>
  );
};

export const AnimatedHeaderBackground = () => {
  const blob1Scale = useSharedValue(1);
  const blob2Scale = useSharedValue(1);
  const blob3Scale = useSharedValue(1);
  const blob4Scale = useSharedValue(1);

  useEffect(() => {
    blob1Scale.value = withRepeat(
      withSequence(
        withTiming(1.8, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    blob2Scale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.8, { duration: 4000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    
    blob3Scale.value = withRepeat(
      withSequence(
        withTiming(1.7, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.9, { duration: 3500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    
    blob4Scale.value = withRepeat(
      withSequence(
        withTiming(2, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const blob1Style = useAnimatedStyle(() => ({ transform: [{ scale: blob1Scale.value }] }));
  const blob2Style = useAnimatedStyle(() => ({ transform: [{ scale: blob2Scale.value }] }));
  const blob3Style = useAnimatedStyle(() => ({ transform: [{ scale: blob3Scale.value }] }));
  const blob4Style = useAnimatedStyle(() => ({ transform: [{ scale: blob4Scale.value }] }));

  return (
    <View style={styles.container}>
      {/* Dense Animated Gradient Blobs */}
      <Animated.View style={[styles.blob, styles.blob1, blob1Style]} />
      <Animated.View style={[styles.blob, styles.blob2, blob2Style]} />
      <Animated.View style={[styles.blob, styles.blob3, blob3Style]} />
      <Animated.View style={[styles.blob, styles.blob4, blob4Style]} />
      
      {/* Dense Floating Medical Icons */}
      <FloatingIcon icon={Stethoscope} delay={0} startX="5%" startY={180} endY={-80} scale={0.8} opacity={0.3} />
      <FloatingIcon icon={Heart} delay={2000} startX="20%" startY={180} endY={-80} scale={0.7} opacity={0.35} />
      <FloatingIcon icon={Activity} delay={1000} startX="45%" startY={180} endY={-80} scale={1} opacity={0.25} />
      <FloatingIcon icon={Plus} delay={3000} startX="65%" startY={180} endY={-80} scale={0.9} opacity={0.3} />
      <FloatingIcon icon={Pill} delay={1500} startX="85%" startY={180} endY={-80} scale={0.8} opacity={0.4} />
      <FloatingIcon icon={Heart} delay={4500} startX="15%" startY={180} endY={-80} scale={0.5} opacity={0.2} />
      <FloatingIcon icon={Stethoscope} delay={3500} startX="55%" startY={180} endY={-80} scale={0.6} opacity={0.3} />
      <FloatingIcon icon={Plus} delay={5000} startX="75%" startY={180} endY={-80} scale={0.6} opacity={0.3} />
      <FloatingIcon icon={Activity} delay={6000} startX="35%" startY={180} endY={-80} scale={0.7} opacity={0.3} />
      <FloatingIcon icon={Pill} delay={7000} startX="95%" startY={180} endY={-80} scale={0.5} opacity={0.4} />

      {/* Very light overlay to let the heavy background show clearly */}
      <View style={styles.overlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#D4E6F1', // Darker shade of light blue
  },
  blob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.6,
  },
  blob1: {
    top: -50,
    right: -50,
    backgroundColor: colors.primary + '40',
  },
  blob2: {
    bottom: -80,
    left: 0,
    backgroundColor: '#00A3E0' + '40',
  },
  blob3: {
    top: 20,
    left: -40,
    backgroundColor: '#4ade80' + '30', // Mint green accent
  },
  blob4: {
    bottom: -20,
    right: -20,
    backgroundColor: '#c084fc' + '30', // Purple accent
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  }
});
