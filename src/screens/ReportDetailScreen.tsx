import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { getDocument, deleteDocument } from '../services/api';
import { colors, typography } from '../theme';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { SkeletonLoader } from '../components/common/SkeletonLoader';

type Props = {
  route: any;
  navigation: any;
};

export const ReportDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id } = route.params || {};
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchReportDetails();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchReportDetails = async () => {
    setLoading(true);
    try {
      const res = await getDocument(id);
      setReport(res.data);
    } catch (err) {
      console.error('Fetch document error', err);
      Alert.alert('Error', 'Failed to load report details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (report?.downloadUrl) {
      Linking.openURL(report.downloadUrl);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={{ padding: 20, gap: 16, marginTop: 40 }}>
          <SkeletonLoader height={40} width="60%" />
          <SkeletonLoader height={120} />
          <SkeletonLoader height={120} />
        </View>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <Text style={{ textAlign: 'center', marginTop: 20, color: colors['on-surface-variant'] }}>Report not found.</Text>
      </SafeAreaView>
    );
  }

  const mockedMetrics = [
    { id: 1, name: 'Blood Sugar', value: '108', unit: 'mg/dL', status: 'normal', icon: 'water-drop' },
    { id: 2, name: 'HbA1c', value: '6.2', unit: '%', status: 'attention', icon: 'science' },
    { id: 3, name: 'Cholesterol', value: '190', unit: 'mg/dL', status: 'normal', icon: 'monitor-heart' }
  ];

  const displayMetrics = report.metrics && report.metrics.length > 0 ? report.metrics : mockedMetrics;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Custom Header matching Mockup */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <MaterialIcons name="arrow-back" size={24} color={colors['on-surface']} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mediva</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <MaterialIcons name="translate" size={24} color={colors['on-surface']} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>{report.category ? `${report.category} Details` : 'Document Details'}</Text>
          <View style={styles.dateRow}>
            <MaterialIcons name="calendar-today" size={16} color={colors['on-surface-variant']} />
            <Text style={styles.dateText}>Date: {report.extractedEventDate || report.uploadDate?.split('T')[0] || '15 August 2026'}</Text>
          </View>
        </View>

        {/* Important Numbers Section */}
        <Text style={styles.sectionHeading}>Important Numbers</Text>

        <View style={styles.metricsList}>
          {displayMetrics.map((metric: any, index: number) => (
            <View key={index} style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricName}>{metric.name}</Text>
                <MaterialIcons name={(metric.icon || 'assessment') as any} size={20} color={colors.outline} />
              </View>

              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricUnit}>{metric.unit}</Text>
              </View>

              <View style={[
                styles.statusPill,
                metric.status === 'normal' ? styles.statusNormal : styles.statusAttention
              ]}>
                <MaterialIcons
                  name={metric.status === 'normal' ? "check-circle" : "warning"}
                  size={14}
                  color={metric.status === 'normal' ? colors.primary : colors['on-surface-variant']}
                />
                <Text style={[
                  styles.statusText,
                  metric.status === 'normal' ? styles.statusTextNormal : styles.statusTextAttention
                ]}>
                  {metric.status === 'normal' ? 'Within normal range' : 'Needs attention'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.stickyFooter}>
        <AnimatedButton
          title="Download PDF"
          onPress={handleDownload}
          style={styles.primaryButton}
        />
        <AnimatedButton
          title="Share"
          onPress={() => { }}
          style={styles.secondaryButton}
          textStyle={styles.secondaryButtonText}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  customHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: colors['outline-variant'],
  },
  headerIcon: {
    padding: 8,
  },
  headerTitle: {
    ...typography.Title1,
    color: colors.primary,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 24,
  },
  pageTitle: {
    ...typography.headlineMd,
    color: colors['on-surface'],
    fontWeight: '800',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    ...typography.bodyMd,
    color: colors['on-surface-variant'],
  },
  sectionHeading: {
    ...typography.Title2,
    color: colors['on-surface'],
    fontWeight: '700',
    marginBottom: 16,
  },
  metricsList: {
    gap: 16,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricName: {
    ...typography.labelLg,
    color: colors['on-surface'],
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors['on-surface'],
    marginRight: 4,
  },
  metricUnit: {
    ...typography.bodyMd,
    color: colors['on-surface'],
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 6,
  },
  statusNormal: {
    backgroundColor: '#E8F5E9',
  },
  statusAttention: {
    backgroundColor: '#F5F5F5',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusTextNormal: {
    color: colors.primary,
  },
  statusTextAttention: {
    color: colors['on-surface-variant'],
  },
  stickyFooter: {
    padding: 20,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: colors['outline-variant'],
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    ...typography.labelLg,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryButton: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    ...typography.labelLg,
    color: colors.primary,
    fontWeight: '700',
  },
});
