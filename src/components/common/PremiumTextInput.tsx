import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, TextInputProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, typography } from '../../theme';

interface PremiumTextInputProps extends TextInputProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  isPassword?: boolean;
}

export const PremiumTextInput: React.FC<PremiumTextInputProps> = ({ 
  icon, 
  isPassword, 
  style, 
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const containerStyle = useAnimatedStyle(() => {
    return {
      borderColor: withTiming(isFocused ? colors.primary : '#E5E7EB', { duration: 150 }),
      backgroundColor: withTiming(isFocused ? colors.surface : '#F9FAFB', { duration: 150 }),
    };
  }, [isFocused]);

  const iconColor = isFocused ? colors.primary : '#9CA3AF'; // Darker gray for icon

  return (
    <Animated.View style={[styles.container, containerStyle, style]}>
      <MaterialIcons name={icon} size={20} color={iconColor} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholderTextColor="#9CA3AF" // Darker placeholder for better visibility
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        secureTextEntry={isPassword && !showPassword}
        {...props}
      />
      {isPassword && (
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={showPassword ? "visibility" : "visibility-off"}
            size={20}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 56,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    ...typography.bodyLg,
    color: colors['on-surface'],
  },
  eyeIcon: {
    padding: 8,
    marginRight: -8,
  },
});
