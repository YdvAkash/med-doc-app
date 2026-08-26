import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, typography, shadows, spacing } from '../../theme';

interface TimelineEventProps {
  title: string;
  description: string;
  date: string;
  index?: number;
  icon?: React.ReactNode;
}

export const TimelineEvent: React.FC<TimelineEventProps> = ({ title, description, date, index = 0, icon }) => {
  const dotScale = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotScale, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(dotScale, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();

    // Fade and slide in
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        })
      ]).start();
    }, index * 100);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateX }] }]}>
      <View style={styles.timelineLine} />
      <Animated.View style={[styles.dot, { transform: [{ scale: dotScale }] }]} />
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
        </View>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.stackLg,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 24,
    bottom: -spacing.stackLg,
    width: 2,
    backgroundColor: colors.outline,
    opacity: 0.3,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: 4,
    marginRight: spacing.stackMd,
    zIndex: 2,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.stackMd,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors['surface-variant'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    ...typography.labelLg,
    color: colors['on-surface'],
    flex: 1,
  },
  iconContainer: {
    marginLeft: 8,
  },
  description: {
    ...typography.bodyMd,
    color: colors['on-surface-variant'],
    marginTop: 4,
  },
  date: {
    ...typography.labelMd,
    color: colors.primary,
    marginTop: 8,
    fontWeight: '600',
  },
});
