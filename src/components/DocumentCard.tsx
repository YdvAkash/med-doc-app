import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '../theme';
import { useHaptics } from '../hooks/useHaptics';

interface DocumentCardProps {
  id?: string | number;
  filename: string;
  title?: string;
  tags?: string[];
  date: string;
  category?: string;
  fileType?: string;
  onPress: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  filename,
  title,
  tags,
  date,
  category,
  fileType,
  onPress
}) => {
  const haptics = useHaptics();
  const scale = useRef(new Animated.Value(1)).current;

  const getIconForType = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf': return 'picture-as-pdf';
      case 'png':
      case 'jpg':
      case 'jpeg': return 'image';
      default: return 'description';
    }
  };

  return (
    <Pressable
      onPressIn={() => {
        Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
        haptics.light();
      }}
      onPressOut={() => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
      }}
      onPress={onPress}
    >
      <Animated.View style={[styles.reportCard, { transform: [{ scale }] }]}>
        <View style={styles.cardHeader}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name={getIconForType(fileType)} size={28} color={colors.primary} />
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={14} color={colors.success} />
            </View>
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
              {title || filename}
            </Text>
            <View style={styles.metaRow}>
              <MaterialIcons name="event" size={14} color={colors['on-surface-variant']} />
              <Text style={styles.cardDate}>{date}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.chipsScrollWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
              {category && category.toLowerCase() !== 'general' && (
                <View style={styles.chip}>
                  <Text style={styles.cardTags}>{category}</Text>
                </View>
              )}
              {tags && tags.map((tag, idx) => (
                <View key={idx} style={[styles.chip, { backgroundColor: colors['secondary-container'] }]}>
                  <Text style={[styles.cardTags, { color: colors['on-secondary-container'] }]}>{tag}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
          <View style={styles.viewAction}>
            <Text style={styles.viewText}>View</Text>
            <MaterialIcons name="arrow-forward" size={18} color={colors.primary} />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  reportCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.stackMd,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors['surface-variant'],
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackMd,
    marginBottom: spacing.stackMd,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 2,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    ...typography.titleMd,
    color: colors['on-surface'],
    marginBottom: 4,
  },
  cardSubtitle: {
    ...typography.bodySm,
    color: colors['on-surface-variant'],
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardDate: {
    ...typography.Caption1,
    color: colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.stackSm,
    gap: spacing.stackMd,
  },
  chipsScrollWrapper: {
    flex: 1,
    marginRight: spacing.stackSm,
  },
  chipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackXs,
  },
  chip: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  cardTags: {
    ...typography.Caption1,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    letterSpacing: 0.25,
  },
  viewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewText: {
    ...typography.Button,
    color: colors.primary,
  },
});
