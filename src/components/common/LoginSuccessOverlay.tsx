import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  withSequence,
  withDelay,
  withSpring,
  runOnJS,
  withRepeat
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuth';

const { width, height } = Dimensions.get('window');

const Particle = ({ delay, angle, distance, duration }: any) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const endX = Math.cos(angle) * distance;
    const endY = Math.sin(angle) * distance;

    translateX.value = withDelay(delay, withTiming(endX, { duration, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(endY, { duration, easing: Easing.out(Easing.cubic) }));
    scale.value = withDelay(delay, withSequence(
      withTiming(1, { duration: duration * 0.2 }),
      withTiming(0, { duration: duration * 0.8 })
    ));
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: duration * 0.2 }),
      withTiming(0, { duration: duration * 0.8 })
    ));
  }, [delay, angle, distance, duration]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.particle, style]} />;
};

export const LoginSuccessOverlay = () => {
  const { token } = useAuthStore();
  const [prevToken, setPrevToken] = useState<string | null>(token);
  const [isVisible, setIsVisible] = useState(false);

  // Animation values
  const overlayOpacity = useSharedValue(0);
  const circleScale = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const bgScale1 = useSharedValue(0);
  const bgScale2 = useSharedValue(0);

  useEffect(() => {
    if (prevToken === null && token !== null) {
      // User just logged in!
      setIsVisible(true);
      
      // Start heavy dense green animation
      overlayOpacity.value = withTiming(1, { duration: 300 });
      
      // Expanding dense green background blobs
      bgScale1.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.exp) });
      bgScale2.value = withDelay(200, withTiming(1, { duration: 1500, easing: Easing.out(Easing.exp) }));

      // Checkmark circle springs in
      circleScale.value = withDelay(400, withSpring(1, { damping: 12, stiffness: 100 }));
      iconScale.value = withDelay(600, withSpring(1, { damping: 10, stiffness: 100 }));

      // Hide after 3 seconds
      setTimeout(() => {
        overlayOpacity.value = withTiming(0, { duration: 500 }, () => {
          runOnJS(setIsVisible)(false);
        });
      }, 3000);
    }
    setPrevToken(token);
  }, [token]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const bg1Style = useAnimatedStyle(() => ({
    transform: [{ scale: bgScale1.value }],
  }));

  const bg2Style = useAnimatedStyle(() => ({
    transform: [{ scale: bgScale2.value }],
  }));

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  if (!isVisible) return null;

  // Generate random particles
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    delay: 400 + Math.random() * 200,
    angle: Math.random() * Math.PI * 2,
    distance: 100 + Math.random() * 300,
    duration: 1000 + Math.random() * 1000,
  }));

  return (
    <Animated.View style={[styles.container, overlayStyle]} pointerEvents="none">
      <Animated.View style={[styles.bgBlob, styles.bgBlob1, bg1Style]} />
      <Animated.View style={[styles.bgBlob, styles.bgBlob2, bg2Style]} />

      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}

      <Animated.View style={[styles.checkCircle, circleStyle]}>
        <Animated.View style={iconStyle}>
          <MaterialIcons name="check" size={80} color="#FFFFFF" />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  bgBlob: {
    position: 'absolute',
    borderRadius: 999,
  },
  bgBlob1: {
    width: width * 1.5,
    height: width * 1.5,
    backgroundColor: '#dcfce7', // Very light green
    opacity: 0.6,
  },
  bgBlob2: {
    width: width,
    height: width,
    backgroundColor: '#86efac', // Light green
    opacity: 0.4,
  },
  checkCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#22c55e', // Vibrant green
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
  }
});
