import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
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

interface Props {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}

export const AnimatedIconCircle: React.FC<Props> = ({ children, delay = 0, style }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.circle, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors['secondary-container'],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  }
});
