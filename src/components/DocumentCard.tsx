import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { FileText, Activity, Image as ImageIcon, MoreVertical, Pill, FlaskConical } from 'lucide-react-native';
import { useHaptics } from '../hooks/useHaptics';

interface DocumentCardProps {
  id?: string | number;
  filename: string;
  title?: string;
  tags?: string[];
  providerName?: string;
  date: string;
  category?: string;
  fileType?: string;
  onPress: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  filename,
  title,
  date,
  providerName,
  category,
  fileType,
  onPress
}) => {
  const haptics = useHaptics();
  const scale = useRef(new Animated.Value(1)).current;

  const getCategoryConfig = () => {
    const c = (category || '').toUpperCase();
    const t = (title || filename || '').toLowerCase();
    
    if (c === 'PRESCRIPTION' || t.includes('prescription')) {
      return { Icon: Pill, color: '#A855F7', bg: '#F3E8FF', tagText: 'Prescription', tagColor: '#A855F7', tagBg: '#F3E8FF' };
    }
    if (c === 'LAB_TEST' || t.includes('blood count') || t.includes('cbc') || t.includes('test')) {
      return { Icon: FlaskConical, color: '#F59E0B', bg: '#FFF7ED', tagText: 'Lab Test', tagColor: '#F59E0B', tagBg: '#FFF7ED' };
    }
    if (c === 'IMAGING' || t.includes('x-ray') || t.includes('scan') || t.includes('mri')) {
      return { Icon: ImageIcon, color: '#1E293B', bg: '#F1F5F9', tagText: 'Imaging', tagColor: '#8B5CF6', tagBg: '#F3E8FF' };
    }
    if (t.includes('ecg') || t.includes('heart') || t.includes('pulse')) {
      return { Icon: Activity, color: '#EF4444', bg: '#FEF2F2', tagText: 'Report', tagColor: '#EF4444', tagBg: '#FEF2F2' };
    }
    return { Icon: FileText, color: '#3B82F6', bg: '#EFF6FF', tagText: 'Report', tagColor: '#3B82F6', tagBg: '#EFF6FF' };
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const config = getCategoryConfig();
  const Icon = config.Icon;

  const formatFallbackTitle = () => {
    const c = (category || '').toUpperCase();
    if (c === 'PRESCRIPTION') return 'Prescription';
    if (c === 'LAB_TEST') return 'Lab Test';
    if (c === 'IMAGING') return 'Medical Imaging';
    if (c === 'REPORT') return 'Medical Report';
    return 'Medical Document';
  };

  const isUglyFilename = (name: string) => {
    if (!name) return true;
    if (name.length > 20 && !name.includes(' ')) return true;
    if (name.match(/[0-9a-f]{8}-[0-9a-f]{4}/i)) return true;
    if (name.toUpperCase().startsWith('IMG_') || name.toUpperCase().startsWith('IMAGE_')) return true;
    if (name.toUpperCase().startsWith('RN_IMAGE_PICKER')) return true;
    return false;
  };

  const displayTitle = title 
    ? title 
    : (filename && !isUglyFilename(filename)) 
      ? filename 
      : formatFallbackTitle();
  
  // Format file extension for badge
  const ext = (fileType || filename?.split('.').pop() || 'PDF').toUpperCase();
  const badgeText = ext === 'APPLICATION/PDF' ? 'PDF' : ext.substring(0, 4);

  const formattedDate = formatDate(date);
  const subtitle = providerName ? `${formattedDate} • ${providerName}` : formattedDate;

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
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
          <Icon size={24} color={config.color} strokeWidth={2} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.titleText} numberOfLines={1}>{displayTitle}</Text>
          <Text style={styles.subtitleText} numberOfLines={1}>{subtitle}</Text>
          
          <View style={[styles.tag, { backgroundColor: config.tagBg }]}>
            <Text style={[styles.tagText, { color: config.tagColor }]}>{config.tagText}</Text>
          </View>
        </View>
        
        <View style={styles.rightContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
          <MoreVertical size={20} color="#94A3B8" />
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  }
});
