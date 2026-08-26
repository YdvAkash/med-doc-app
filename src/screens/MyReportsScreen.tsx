import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import { getDocuments } from '../services/api';
import { useIsFocused } from '@react-navigation/native';
import { DocumentCard } from '../components/DocumentCard';

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
      const res = await getDocuments();
      setReports(res.data.content || []);
    } catch (err) {
      console.log('Error fetching reports', err);
    } finally {
      setLoading(false);
    }
  };

  const chips = ['All', 'Blood Tests', 'Prescriptions', 'Scans', 'Haematological report', 'Blood', 'Liver', 'Kidney', 'Other'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Screen Title */}
        <View style={styles.header}>
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
        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : reports.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20, color: colors['on-surface-variant'] }}>No reports found.</Text>
          ) : (
            reports.map((report) => (
              <DocumentCard 
                key={report.id}
                filename={report.originalFilename}
                date={report.extractedEventDate || report.uploadDate?.split('T')[0]}
                category={report.category}
                fileType={report.fileType}
                onPress={() => navigation.navigate('ReportDetail', { id: report.id })}
              />
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
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.stackLg,
    paddingBottom: 40,
  },
  header: {
    marginBottom: spacing.stackLg,
  },
  title: {
    ...typography.headlineLgMobile,
    color: colors['on-background'],
    marginBottom: spacing.stackSm,
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors['on-surface-variant'],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    paddingHorizontal: 16,
    height: 56,
    marginBottom: spacing.stackLg,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyLg,
    color: colors['on-surface'],
  },
  chipsWrapper: {
    marginHorizontal: -spacing.marginMobile,
    marginBottom: spacing.stackLg,
  },
  chipsContainer: {
    paddingHorizontal: spacing.marginMobile,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors['outline-variant'],
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.labelLg,
    color: colors['on-surface-variant'],
  },
  chipTextActive: {
    color: colors['on-primary'],
  },
  listContainer: {
    gap: spacing.stackMd,
  }
});
