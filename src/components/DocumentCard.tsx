import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

interface DocumentCardProps {
  id?: string | number;
  filename: string;
  date: string;
  category?: string;
  fileType?: string;
  onPress: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ 
  filename, 
  date, 
  category, 
  fileType, 
  onPress 
}) => {
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
    <TouchableOpacity
      style={styles.reportCard}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={[styles.cardAccent, { backgroundColor: colors.primary }]} />
      <View style={styles.cardHeader}>
        <View style={styles.iconWrapper}>
          <MaterialIcons name={getIconForType(fileType)} size={24} color={colors.primary} />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">{filename}</Text>
          <Text style={styles.cardDate}>{date}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={colors['on-surface-variant']} />
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardTags}>{category || 'general'}</Text>
        <View style={styles.viewAction}>
          <Text style={styles.viewText}>View</Text>
          <MaterialIcons name="arrow-forward" size={16} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  reportCard: {
    backgroundColor: colors['surface-container-lowest'],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    padding: spacing.gutter,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 12,
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gutter,
    marginBottom: 12,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors['surface-container-low'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    ...typography.headlineSm,
    color: colors['on-surface'],
  },
  cardDate: {
    ...typography.bodyMd,
    color: colors['on-surface-variant'],
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors['outline-variant'],
    paddingTop: 12,
  },
  cardTags: {
    ...typography.labelMd,
    color: colors.outline,
    flex: 1,
    marginRight: 16,
    textTransform: 'lowercase',
  },
  viewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewText: {
    ...typography.labelLg,
    color: colors.primary,
  },
});
