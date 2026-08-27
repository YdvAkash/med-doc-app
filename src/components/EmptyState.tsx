import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { FileX, LucideIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  style?: any;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = FileX,
  actionLabel,
  onAction,
  style,
}) => {
  const floatAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.9);
  const opacityAnim = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    scaleAnim.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) });
    opacityAnim.value = withTiming(1, { duration: 500 });

    // Floating animation loop
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1, // Infinite
      true // Reverse
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: floatAnim.value },
        { scale: scaleAnim.value }
      ],
      opacity: opacityAnim.value,
    };
  });

  const handlePressIn = () => {
    if (onAction) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        {/* Glow behind icon */}
        <View style={styles.glow} />

        <LinearGradient
          colors={[colors.primary + '20', colors.primary + '05']} // 20% to 5% opacity
          style={styles.iconCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon size={36} color={colors.primary} strokeWidth={1.5} />
        </LinearGradient>
      </Animated.View>

      <Animated.Text style={[styles.title, { opacity: opacityAnim }]}>
        {title}
      </Animated.Text>

      <Animated.Text style={[styles.description, { opacity: opacityAnim }]}>
        {description}
      </Animated.Text>

      {actionLabel && onAction && (
        <Animated.View style={{ opacity: opacityAnim, transform: [{ scale: scaleAnim }] }}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed
            ]}
            onPress={onAction}
            onPressIn={handlePressIn}
          >
            <LinearGradient
              colors={[colors.primary, '#00A3E0']} // Mediva Blue to Medical Accent
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.actionText}>{actionLabel}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 250,
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: colors.primary,
    borderRadius: 40,
    opacity: 0.15,
    transform: [{ scale: 1.2 }],
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '30',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: '80%',
    lineHeight: 20,
  },
  actionButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonPressed: {
    transform: [{ scale: 0.96 }],
    shadowOpacity: 0.1,
  },
  actionGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  }
});

export default EmptyState;
