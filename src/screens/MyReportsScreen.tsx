import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, TextInput, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import { getDocuments } from '../services/api';
import { useIsFocused } from '@react-navigation/native';

type Props = {
  navigation: any;
};

export const MyReportsScreen: React.FC<Props> = ({ navigation }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChip, setActiveChip] = useState('All');
  const isFocused = useIsFocused();

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isFocused) {
      fetchReports();
    }
  }, [isFocused, activeChip, searchQuery]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getDocuments(0, 20, searchQuery, activeChip);
      setReports(res.data.content || []);
    } catch (err) {
      console.log('Error fetching reports', err);
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf': return 'picture-as-pdf';
      case 'png':
      case 'jpg':
      case 'jpeg': return 'image';
      default: return 'description';
    }
  };

  const chips = ['All', 'Blood Tests', 'Prescriptions', 'Scans', 'Haematological report', 'Blood', 'Liver', 'Kidney', 'Other'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      
      {/* TopAppBar */}
      <View style={styles.appBar}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors['on-surface-variant']} />
        </TouchableOpacity>
        
        <Text style={styles.appBarTitle}>MedDoc</Text>
        
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="translate" size={24} color={colors['on-surface-variant']} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Screen Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>My Reports</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color={colors.outline} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by report name or date"
            placeholderTextColor={colors.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.chipsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
            {chips.map(chip => (
              <TouchableOpacity 
                key={chip}
                style={[styles.chip, activeChip === chip && styles.chipActive]} 
                activeOpacity={0.8}
                onPress={() => setActiveChip(chip)}
              >
                <Text style={[styles.chipText, activeChip === chip && styles.chipTextActive]}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Reports List */}
        <View style={styles.reportsList}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : reports.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20, color: colors['on-surface-variant'] }}>No reports found.</Text>
          ) : (
            reports.map((report) => (
              <TouchableOpacity 
                key={report.id}
                style={styles.reportCard} 
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ReportDetail', { id: report.id })}
              >
                <View style={[styles.cardAccent, { backgroundColor: colors.primary }]} />
                <View style={styles.cardHeader}>
                  <View style={styles.iconWrapper}>
                    <MaterialIcons name={getIconForType(report.fileType)} size={24} color={colors.primary} />
                  </View>
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.cardTitle}>{report.originalFilename}</Text>
                    <Text style={styles.cardDate}>{report.extractedEventDate || report.uploadDate?.split('T')[0]}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={colors['on-surface-variant']} />
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardTags}>{report.category || 'General'}</Text>
                  <View style={styles.viewAction}>
                    <Text style={styles.viewText}>View</Text>
                    <MaterialIcons name="arrow-forward" size={16} color={colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors['outline-variant'],
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  appBarTitle: {
    ...typography.headlineSm,
    color: colors.primary,
  },
  content: {
    padding: spacing.marginMobile,
    paddingBottom: 40,
    gap: spacing.stackLg,
  },
  titleContainer: {
    marginBottom: spacing.stackSm,
  },
  title: {
    ...typography.headlineLgMobile,
    color: colors['on-surface'],
  },
  searchContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  searchInput: {
    height: 56,
    backgroundColor: colors['surface-container-lowest'],
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    borderRadius: 8,
    paddingLeft: 48,
    paddingRight: 16,
    ...typography.bodyMd,
    color: colors['on-surface'],
  },
  chipsWrapper: {
    marginHorizontal: -spacing.marginMobile,
  },
  chipsContainer: {
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.stackSm,
    paddingBottom: 8,
  },
  chip: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: colors['surface-container'],
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors['primary-container'],
    borderColor: 'transparent',
  },
  chipText: {
    ...typography.labelMd,
    color: colors['on-surface-variant'],
  },
  chipTextActive: {
    color: colors['on-primary'],
  },
  reportsList: {
    gap: spacing.stackMd,
  },
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
