import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SectionList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import { getTimeline } from '../services/api';
import { useNavigation } from '@react-navigation/native';

interface Props {
  ListHeaderComponent?: React.ReactElement | null;
}

export const TimelineView: React.FC<Props> = ({ ListHeaderComponent }) => {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    try {
      const res = await getTimeline();
      const data = res.data || [];
      
      const grouped = data.reduce((acc: any, item: any) => {
        const dateStr = item.eventDate || item.uploadDate || '';
        if (!dateStr) return acc;
        
        const date = new Date(dateStr);
        const monthYear = date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
        
        if (!acc[monthYear]) {
          acc[monthYear] = [];
        }
        acc[monthYear].push(item);
        return acc;
      }, {});

      const sectionsData = Object.keys(grouped).map(key => ({
        title: key,
        data: grouped[key].sort((a: any, b: any) => new Date(b.eventDate || b.uploadDate).getTime() - new Date(a.eventDate || a.uploadDate).getTime())
      }));

      sectionsData.sort((a, b) => new Date('01 ' + b.title).getTime() - new Date('01 ' + a.title).getTime());
      
      setSections(sectionsData);
    } catch (err) {
      console.log('Error fetching timeline', err);
    } finally {
      setLoading(false);
    }
  };

  const isRetroactive = (eventDate: string, uploadDate: string) => {
    if (!eventDate || !uploadDate) return false;
    const eDate = new Date(eventDate);
    const uDate = new Date(uploadDate);
    const diffTime = Math.abs(uDate.getTime() - eDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays > 7;
  };

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        {ListHeaderComponent}
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (sections.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        {ListHeaderComponent}
        <Text style={styles.emptyText}>No timeline events found.</Text>
      </View>
    );
  }

  return (
    <SectionList
      ListHeaderComponent={ListHeaderComponent}
      sections={sections}
      keyExtractor={(item, index) => item.id.toString() + index}
      renderSectionHeader={({ section: { title } }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      )}
      renderItem={({ item }) => {
        const retro = isRetroactive(item.eventDate, item.document?.uploadDate);
        return (
          <View style={styles.timelineItem}>
            {/* Timeline Line & Dot */}
            <View style={styles.timelineLineContainer}>
              <View style={[styles.timelineDot, retro && styles.timelineDotRetro]} />
              <View style={styles.timelineLine} />
            </View>

            {/* Content Card */}
            <TouchableOpacity 
              style={[styles.card, retro && styles.cardRetro]}
              activeOpacity={0.7}
              onPress={() => item.relatedDocumentId && navigation.navigate('ReportDetail', { id: item.relatedDocumentId })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                {retro && (
                  <View style={styles.retroBadge}>
                    <Text style={styles.retroBadgeText}>Retroactive</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.eventDate}>Date: {item.eventDate?.split('T')[0]}</Text>
              <Text style={styles.eventDesc} numberOfLines={2}>{item.description}</Text>
              
              <View style={styles.cardFooter}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.eventType || 'General'}</Text>
                </View>
                {item.documentId && (
                  <View style={styles.viewAction}>
                    <Text style={styles.viewText}>View Doc</Text>
                    <MaterialIcons name="arrow-forward" size={16} color={colors.primary} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        );
      }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: colors['on-surface-variant'],
    ...typography.bodyMd,
  },
  sectionHeader: {
    paddingVertical: 12,
    backgroundColor: colors.background,
    marginBottom: 8,
  },
  sectionTitle: {
    color: colors['on-surface'],
    ...typography.labelLg,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLineContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: 6,
    zIndex: 1,
  },
  timelineDotRetro: {
    backgroundColor: colors.error,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors['surface-variant'],
    marginTop: -6,
  },
  card: {
    flex: 1,
    backgroundColor: colors['surface-container-lowest'],
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardRetro: {
    backgroundColor: colors['error-container'],
    borderColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  eventTitle: {
    ...typography.headlineSm,
    color: colors['on-surface'],
    flex: 1,
  },
  retroBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  retroBadgeText: {
    fontSize: 10,
    color: colors['on-error'],
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  eventDate: {
    ...typography.bodyMd,
    color: colors['on-surface-variant'],
    marginBottom: 8,
  },
  eventDesc: {
    ...typography.bodyMd,
    color: colors['on-surface-variant'],
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors['outline-variant'],
    paddingTop: 12,
  },
  categoryBadge: {
    backgroundColor: colors['surface-container'],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    ...typography.labelMd,
    color: colors['on-surface-variant'],
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
