import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  interpolateColor,
  withDelay,
  withSpring
} from 'react-native-reanimated';
import { colors, typography } from '../../theme';

interface Props {
  title: string;
  subtitle: string;
}

export const AnimatedAuthHeading: React.FC<Props> = ({ title, subtitle }) => {
  const colorProgress = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);

  useEffect(() => {
    // Entrance animations
    titleOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(100, withSpring(0, { damping: 12 }));
    
    subtitleOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    subtitleTranslateY.value = withDelay(300, withSpring(0, { damping: 12 }));

    // Color shimmer animation
    colorProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500 }),
        withTiming(0, { duration: 2500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedTitleStyle = useAnimatedStyle(() => {
    const textColor = interpolateColor(
      colorProgress.value,
      [0, 1],
      [colors.primary, '#0056b3']
    );
    return {
      color: textColor,
      opacity: titleOpacity.value,
      transform: [{ translateY: titleTranslateY.value }]
    };
  });

  const animatedSubtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }]
  }));

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, animatedTitleStyle]}>
        {title}
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, animatedSubtitleStyle]}>
        {subtitle}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
    alignItems: 'center', // Center everything
  },
  title: {
    ...typography.headlineLg,
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 32,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors['on-surface-variant'],
    textAlign: 'center',
  }
});
