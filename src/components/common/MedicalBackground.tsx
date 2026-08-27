import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing,
  withDelay
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme';

const { width, height } = Dimensions.get('window');

const FloatingCross = ({ delay = 0, size = 30, startX = 0, duration = 10000, opacity = 0.1 }) => {
  const translateY = useSharedValue(height);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-100, { duration, easing: Easing.linear }),
        -1,
        false
      )
    );
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, { duration: duration * 1.5, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` }
    ],
  }));

  return (
    <Animated.View style={[styles.cross, { left: startX, opacity }, animatedStyle]}>
      <MaterialIcons name="local-hospital" size={size} color={colors.primary} />
    </Animated.View>
  );
};

export const MedicalBackground = () => {
  return (
    <View style={StyleSheet.absoluteFillObject}>
      <LinearGradient
        colors={['#E8F5E9', '#E3F2FD', '#FFFFFF']} // Soft mint green to soft blue to white
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Background Orbs */}
      <View style={[styles.orb, { top: -100, left: -50, backgroundColor: '#81D4FA40' }]} />
      <View style={[styles.orb, { top: height * 0.4, right: -100, backgroundColor: '#A5D6A740' }]} />

      {/* Floating Medical Crosses */}
      <FloatingCross startX={width * 0.1} delay={0} size={40} duration={12000} opacity={0.15} />
      <FloatingCross startX={width * 0.4} delay={3000} size={25} duration={15000} opacity={0.1} />
      <FloatingCross startX={width * 0.7} delay={1000} size={60} duration={18000} opacity={0.08} />
      <FloatingCross startX={width * 0.85} delay={5000} size={35} duration={10000} opacity={0.12} />
      <FloatingCross startX={width * 0.25} delay={7000} size={50} duration={14000} opacity={0.1} />
    </View>
  );
};

const styles = StyleSheet.create({
  cross: {
    position: 'absolute',
  },
  orb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  }
});
