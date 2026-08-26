import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SectionList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import { getTimeline } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { DocumentCard } from './DocumentCard';

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
            <View style={{ flex: 1 }}>
              {retro && (
                <View style={styles.retroBadge}>
                  <Text style={styles.retroBadgeText}>Retroactive</Text>
                </View>
              )}
              <DocumentCard 
                filename={item.title.replace('Document Uploaded: ', '')}
                date={item.eventDate?.split('T')[0]}
                category={item.eventType || 'General'}
                fileType={item.document?.fileType || 'description'}
                onPress={() => item.relatedDocumentId && navigation.navigate('ReportDetail', { id: item.relatedDocumentId })}
              />
            </View>
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
  retroBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  retroBadgeText: {
    fontSize: 10,
    color: colors['on-error'],
    fontWeight: 'bold',
    letterSpacing: 0.5,
  }
});
