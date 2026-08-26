import React, { useRef } from 'react';
import { TouchableOpacityProps, StyleSheet, Animated, ViewStyle, TextStyle, Pressable } from 'react-native';
import { colors, typography, shadows } from '../../theme';
import { useHaptics } from '../../hooks/useHaptics';

interface Props extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const AnimatedButton: React.FC<Props> = ({ title, onPress, style, textStyle, icon, ...props }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const haptics = useHaptics();

  return (
    <Pressable
      onPressIn={() => {
        Animated.spring(scale, {
          toValue: 0.96,
          useNativeDriver: true,
        }).start();
        haptics.light();
      }}
      onPressOut={() => {
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }}
      onPress={onPress}
      {...props as any}
    >
      <Animated.View style={[{ transform: [{ scale }] }, styles.container, style]}>
        <Animated.Text style={[styles.text, textStyle]}>{title}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
    flexDirection: 'row',
    gap: 8,
  },
  text: {
    ...typography.labelLg,
    color: '#fff',
    fontWeight: 'bold',
  },
});
