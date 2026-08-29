import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Alert, Linking, Share, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDocument, deleteDocument, generateDocumentSummary, translateDocument } from '../services/api';
import { colors, typography } from '../theme';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { StartIoAds } from '../services/ads/StartIoAds';

type Props = {
  route: any;
  navigation: any;
};

export const ReportDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id } = route.params || {};
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

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

  const handleGenerateSummary = async () => {
    if (!id) return;
    setSummaryLoading(true);
    try {
      const res = await generateDocumentSummary(id);
      if (res.success && res.data) {
        setReport((prev: any) => ({ ...prev, summary: res.data }));
      } else {
        Alert.alert('Error', 'Could not generate summary.');
      }
    } catch (err) {
      console.error('Error generating summary:', err);
      Alert.alert('Error', 'Failed to generate summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!report?.downloadUrl) {
      Alert.alert('Download Unavailable', 'There is no download link available for this report.');
      return;
    }
    
    setDownloading(true);
    try {
      let directoryUri = await AsyncStorage.getItem('@download_directory_uri');
      
      if (!directoryUri) {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          directoryUri = permissions.directoryUri;
          await AsyncStorage.setItem('@download_directory_uri', directoryUri);
        } else {
          Alert.alert('Permission Denied', 'Please grant folder permissions to save the file.');
          setDownloading(false);
          return;
        }
      }

      const fileUri = report.downloadUrl;
      let extension = '.pdf';
      let mimeType = 'application/pdf';
      
      // Determine file type from original filename or download URL
      const sourceName = report.originalFilename || fileUri;
      if (sourceName.toLowerCase().includes('.jpg') || sourceName.toLowerCase().includes('.jpeg')) {
        extension = '.jpg';
        mimeType = 'image/jpeg';
      } else if (sourceName.toLowerCase().includes('.png')) {
        extension = '.png';
        mimeType = 'image/png';
      }

      const fileName = report.title ? `${report.title.replace(/\\s+/g, '_')}${extension}` : `Medical_Report${extension}`;
      
      // Download to app's cache directory first
      const downloadResult = await FileSystem.downloadAsync(
        fileUri,
        FileSystem.cacheDirectory + fileName
      );
      
      // Save to the selected directory
      try {
        const base64 = await FileSystem.readAsStringAsync(downloadResult.uri, { encoding: FileSystem.EncodingType.Base64 });
        const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          directoryUri,
          fileName,
          mimeType
        );
        await FileSystem.writeAsStringAsync(newFileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
        
        Alert.alert('Success', `Report downloaded to your device successfully!`);
      } catch (innerError) {
        // If writing fails (e.g. permission revoked), prompt again next time
        await AsyncStorage.removeItem('@download_directory_uri');
        console.error('File write error:', innerError);
        Alert.alert('Download Failed', 'Could not access the saved folder. Please try downloading again to select a new folder.');
      }
    } catch (e) {
      console.error('Download error:', e);
      Alert.alert('Download Failed', 'An error occurred while downloading the file.');
    } finally {
      setDownloading(false);
    }
  };

  const handleTranslate = async (lang: string) => {
    if (!id) return;
    setShowLangModal(false);
    setTranslateLoading(true);
    try {
      const res = await translateDocument(id, lang);
      if (res.success && res.data) {
        setReport(res.data);
      } else {
        Alert.alert('Error', 'Translation failed.');
      }
    } catch (err) {
      console.error('Error translating:', err);
      Alert.alert('Error', 'Failed to translate document.');
    } finally {
      setTranslateLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const reportName = report?.title || report?.originalFilename || report?.category || 'Medical Report';
      const doctorName = report?.doctorName || 'Dr. Sharma';
      const labName = report?.labName || 'Himani Imaging & Diagnostics';
      
      let finalUrl = '';
      if (report?.downloadUrl) {
        try {
          const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(report.downloadUrl)}`);
          if (res.ok) {
            finalUrl = await res.text();
          } else {
            finalUrl = report.downloadUrl;
          }
        } catch(e) {
          finalUrl = report.downloadUrl;
        }
      }

      const shareMessage = [
        `📄 Report: ${reportName}`,
        `👨‍⚕️ Referred By: ${doctorName}`,
        `🏥 Pathology/Lab: ${labName}`,
        finalUrl ? `\n🔗 View Document: ${finalUrl}` : ''
      ].filter(Boolean).join('\n');
        
      await Share.share({
        message: shareMessage,
        title: reportName,
        url: finalUrl
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share the document.');
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

  const displayMetrics = report.metrics && report.metrics.length > 0 ? report.metrics : [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Custom Header matching Mockup */}
      <View style={styles.customHeader}>
        <TouchableOpacity 
          onPress={() => {
            navigation.goBack();
            StartIoAds.showInterstitialSafely();
          }} 
          style={styles.headerIcon}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors['on-surface']} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mediva</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={() => setShowLangModal(true)}>
          <MaterialIcons name="translate" size={24} color={colors['on-surface']} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Fancy Title Section */}
        <Animated.View entering={FadeInDown.duration(800).springify()}>
          <LinearGradient
            colors={['#0A4A8F', '#20D5EA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fancyTitleSection}
          >
            <View style={styles.fancyTitleContent}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="description" size={32} color="#0A4A8F" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fancyPageTitle} numberOfLines={2}>
                  {report.title || report.originalFilename || (report.category ? `${report.category} Details` : 'Document Details')}
                </Text>
                <View style={styles.fancyDateRow}>
                  <MaterialIcons name="event" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.fancyDateText}>{report.extractedEventDate || report.uploadDate?.split('T')[0] || '15 August 2026'}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Doctor and Pathology Info */}
        <View style={styles.providerCard}>
          <View style={styles.providerRow}>
            <MaterialIcons name="local-hospital" size={20} color={colors.primary} />
            <View style={styles.providerTextContainer}>
              <Text style={styles.providerLabel}>Pathology / Lab</Text>
              <Text style={styles.providerValue}>{report.labName || 'Himani Imaging & Diagnostics'}</Text>
            </View>
          </View>
          
          <View style={styles.providerDivider} />

          <View style={styles.providerRow}>
            <MaterialIcons name="person" size={20} color={colors.primary} />
            <View style={styles.providerTextContainer}>
              <Text style={styles.providerLabel}>Referred By</Text>
              <Text style={styles.providerValue}>{report.doctorName || 'Dr. Sharma'}</Text>
            </View>
          </View>
        </View>

        {/* Important Numbers Section */}
        <Text style={styles.sectionHeading}>Important Numbers</Text>

        <View style={styles.metricsContainer}>
          {displayMetrics.map((metric: any, index: number) => {
            const isLast = index === displayMetrics.length - 1;
            return (
              <View key={index} style={[styles.metricRow, !isLast && styles.metricDivider]}>
                <View style={styles.metricRowLeft}>
                  <View style={styles.metricIconContainer}>
                    <MaterialIcons name={(metric.icon || 'assessment') as any} size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.metricNameText} numberOfLines={1}>{metric.name}</Text>
                    {metric.status !== 'normal' && (
                      <Text style={styles.metricStatusAttentionText}>Needs attention</Text>
                    )}
                  </View>
                </View>
                <View style={styles.metricRowRight}>
                  <Text style={styles.metricValueText}>{metric.value}</Text>
                  {metric.unit ? <Text style={styles.metricUnitText}>{metric.unit}</Text> : null}
                </View>
              </View>
            );
          })}
        </View>

        {/* Doctor's Summary Section */}
        <Text style={[styles.sectionHeading, { marginTop: 24 }]}>Doctor's Summary</Text>
        <View style={styles.summaryCard}>
          {report.summary ? (
            <View>
              <View style={styles.summaryHeader}>
                <MaterialIcons name="auto-awesome" size={20} color="#08A8C6" />
                <Text style={styles.summaryTitle}>AI Analysis</Text>
              </View>
              <Text style={styles.summaryText}>{report.summary}</Text>
            </View>
          ) : (
            <View style={styles.generateSummaryContainer}>
              <MaterialIcons name="psychology" size={48} color={colors.outline} style={{ marginBottom: 12 }} />
              <Text style={styles.generateSummaryText}>Generate an AI-powered summary to easily understand your report.</Text>
              <TouchableOpacity 
                style={styles.generateButton} 
                onPress={handleGenerateSummary}
                disabled={summaryLoading}
              >
                {summaryLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="auto-awesome" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.generateButtonText}>Generate Summary</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.stickyFooterHorizontal}>
        <TouchableOpacity style={styles.iconActionButton} onPress={handleDownload} disabled={downloading}>
          {downloading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialIcons name="file-download" size={28} color="#FFFFFF" />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconActionButton} onPress={handleShare}>
          <MaterialIcons name="share" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Translation Loader Overlay */}
      {translateLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Translating...</Text>
          </View>
        </View>
      )}

      {/* Language Selection Modal */}
      <Modal
        visible={showLangModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLangModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLangModal(false)}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Language</Text>
            
            <TouchableOpacity style={styles.langOption} onPress={() => handleTranslate('Hindi')}>
              <Text style={styles.langOptionText}>Hindi (हिन्दी)</Text>
              <MaterialIcons name="chevron-right" size={24} color={colors['on-surface-variant']} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.langOption} onPress={() => handleTranslate('Spanish')}>
              <Text style={styles.langOptionText}>Spanish (Español)</Text>
              <MaterialIcons name="chevron-right" size={24} color={colors['on-surface-variant']} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.langOption} onPress={() => handleTranslate('French')}>
              <Text style={styles.langOptionText}>French (Français)</Text>
              <MaterialIcons name="chevron-right" size={24} color={colors['on-surface-variant']} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.langOption} onPress={() => handleTranslate('English')}>
              <Text style={styles.langOptionText}>English</Text>
              <MaterialIcons name="chevron-right" size={24} color={colors['on-surface-variant']} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  fancyTitleSection: {
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#0A4A8F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  fancyTitleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fancyPageTitle: {
    ...typography.headlineMd,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 6,
  },
  fancyDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  fancyDateText: {
    ...typography.bodyMd,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  providerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerTextContainer: {
    marginLeft: 12,
  },
  providerLabel: {
    fontSize: 12,
    color: colors['on-surface-variant'],
    marginBottom: 2,
  },
  providerValue: {
    ...typography.labelLg,
    color: colors['on-surface'],
  },
  providerDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
    marginLeft: 32,
  },
  sectionHeading: {
    ...typography.Title2,
    color: colors['on-surface'],
    fontWeight: '700',
    marginBottom: 16,
  },
  metricsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  metricDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  metricRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  metricIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(10, 74, 143, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metricNameText: {
    ...typography.labelLg,
    color: colors['on-surface'],
  },
  metricStatusAttentionText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 2,
    fontWeight: '600',
  },
  metricRowRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValueText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors['on-surface'],
  },
  metricUnitText: {
    ...typography.bodyMd,
    color: colors['on-surface-variant'],
    marginLeft: 4,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    ...typography.labelLg,
    color: '#08A8C6',
    fontWeight: '700',
    marginLeft: 8,
  },
  summaryText: {
    ...typography.bodyLg,
    color: colors['on-surface'],
    lineHeight: 24,
  },
  generateSummaryContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  generateSummaryText: {
    ...typography.bodyMd,
    color: colors['on-surface-variant'],
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  generateButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  stickyFooterHorizontal: {
    padding: 20,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: colors['outline-variant'],
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  iconActionButton: {
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingBox: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 5,
  },
  loadingText: {
    ...typography.labelLg,
    color: colors['on-surface'],
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    ...typography.Title2,
    color: colors['on-surface'],
    marginBottom: 16,
  },
  langOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  langOptionText: {
    ...typography.bodyLg,
    color: colors['on-surface'],
  },
});
