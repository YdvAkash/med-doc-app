import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Alert, Linking, Share, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getDocument, generateDocumentSummary, translateDocument, getFolders, createFolder, addDocumentToFolder } from '../services/api';
import { colors, typography } from '../theme';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { StartIoAds } from '../services/ads/StartIoAds';

type Props = {
  route: any;
  navigation: any;
};

const isUglyFilename = (name: string) => {
  if (!name) return true;
  if (name.length > 20 && !name.includes(' ')) return true;
  if (name.match(/[0-9a-f]{8}-[0-9a-f]{4}/i)) return true;
  if (name.toUpperCase().startsWith('IMG_') || name.toUpperCase().startsWith('IMAGE_')) return true;
  if (name.toUpperCase().startsWith('RN_IMAGE_PICKER')) return true;
  return false;
};

const getDisplayTitle = (report: any) => {
  if (report.title) return report.title;
  if (report.originalFilename && !isUglyFilename(report.originalFilename)) return report.originalFilename;
  const c = (report.category || '').toUpperCase();
  if (c === 'PRESCRIPTION') return 'Prescription';
  if (c === 'LAB_TEST') return 'Lab Test';
  if (c === 'IMAGING') return 'Medical Imaging';
  if (c === 'REPORT') return 'Medical Report';
  return 'Medical Document';
};

export const ReportDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id } = route.params || {};
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Folder state
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folders, setFolders] = useState<any[]>([]);
  const [folderLoading, setFolderLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  useEffect(() => {
    if (id) {
      fetchReportDetails();
    } else {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      // Clean up (reset summary visibility) when leaving the screen
      return () => {
        setShowSummary(false);
      };
    }, [])
  );

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
        setShowSummary(true);
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

      const sourceName = report.originalFilename || fileUri;
      if (sourceName.toLowerCase().includes('.jpg') || sourceName.toLowerCase().includes('.jpeg')) {
        extension = '.jpg';
        mimeType = 'image/jpeg';
      } else if (sourceName.toLowerCase().includes('.png')) {
        extension = '.png';
        mimeType = 'image/png';
      }

      const fileName = report.title ? `${report.title.replace(/\s+/g, '_')}${extension}` : `Medical_Report${extension}`;

      const downloadResult = await FileSystem.downloadAsync(
        fileUri,
        FileSystem.cacheDirectory + fileName
      );

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

  const handleViewPdf = async () => {
    if (!report?.downloadUrl) {
      Alert.alert('Unavailable', 'Document file is not available.');
      return;
    }
    try {
      await Linking.openURL(report.downloadUrl);
    } catch (err) {
      console.error('Failed to open PDF URL', err);
      Alert.alert('Error', 'Could not open the document.');
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
      const docName = report?.doctorName || report?.orderedBy || report?.providerName || '';

      let finalUrl = '';
      if (report?.downloadUrl) {
        try {
          const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(report.downloadUrl)}`);
          if (res.ok) {
            finalUrl = await res.text();
          } else {
            finalUrl = report.downloadUrl;
          }
        } catch (e) {
          finalUrl = report.downloadUrl;
        }
      }

      const shareMessage = [
        `📄 Report: ${reportName}`,
        docName ? `👨‍⚕️ Doctor: ${docName}` : '',
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

  const fetchUserFolders = async () => {
    setFolderLoading(true);
    try {
      const res = await getFolders();
      if (res.success) {
        setFolders(res.data);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setFolderLoading(false);
    }
  };

  const handleOpenFolderModal = () => {
    setShowFolderModal(true);
    fetchUserFolders();
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    try {
      const res = await createFolder(newFolderName.trim());
      if (res.success) {
        setFolders([res.data, ...folders]);
        setNewFolderName('');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      Alert.alert('Error', 'Could not create folder.');
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleAddToFolder = async (folderId: number) => {
    if (!id) return;
    try {
      const res = await addDocumentToFolder(folderId, id);
      if (res.success) {
        Alert.alert('Success', 'Document added to folder!');
        setShowFolderModal(false);
      }
    } catch (error) {
      console.error('Error adding to folder:', error);
      Alert.alert('Error', 'Could not add to folder.');
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

  const renderInfoRow = (icon: string, label: string, value: string | undefined | null) => {
    if (!value) return null;
    return (
      <View style={styles.infoRow}>
        <View style={styles.infoIconBox}>
          <MaterialIcons name={icon as any} size={18} color={colors.primary} />
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Custom Header */}
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
        <Text style={styles.headerTitle}>Document Details</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={() => setShowLangModal(true)}>
          <MaterialIcons name="translate" size={24} color={colors['on-surface']} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Document Header Card */}
        <Animated.View entering={FadeInDown.duration(800).springify()}>
          <View style={styles.headerCard}>
            <View style={styles.headerCardInner}>
              <View style={styles.docIconCircle}>
                <MaterialIcons name="receipt-long" size={32} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.docTitle} numberOfLines={2}>
                  {getDisplayTitle(report)}
                </Text>

                <View style={styles.docMetaRow}>
                  {report.extractedEventDate || report.uploadDate ? (
                    <View style={styles.docMetaItem}>
                      <MaterialIcons name="event" size={14} color={colors['on-surface-variant']} />
                      <Text style={styles.docMetaText}>
                        {report.extractedEventDate || report.uploadDate?.split('T')[0]}
                      </Text>
                    </View>
                  ) : null}

                  {report.labName || report.providerName ? (
                    <>
                      <View style={styles.metaDivider} />
                      <View style={[styles.docMetaItem, { flex: 1 }]}>
                        <MaterialIcons name="business" size={14} color={colors['on-surface-variant']} />
                        <Text style={styles.docMetaText} numberOfLines={1}>
                          {report.labName || report.providerName}
                        </Text>
                      </View>
                    </>
                  ) : null}
                </View>

                {report.category && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{report.category.replace('_', ' ')}</Text>
                  </View>
                )}
              </View>
              {report.fileType && (
                <View style={styles.fileTypeBadge}>
                  <Text style={styles.fileTypeText}>{report.fileType.toUpperCase()}</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Doctor's Summary Section */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <MaterialIcons name="auto-awesome" size={20} color="#00C48C" />
              <Text style={styles.summaryTitle}>AI Summary</Text>
            </View>
            {(!report.summary || report.summary.includes('We could not generate a summary')) && (
              <TouchableOpacity
                style={styles.generateButtonSmall}
                onPress={handleGenerateSummary}
                disabled={summaryLoading}
              >
                {summaryLoading ? (
                  <ActivityIndicator size="small" color="#00C48C" />
                ) : (
                  <>
                    <MaterialIcons name="auto-awesome" size={14} color="#00C48C" style={{ marginRight: 4 }} />
                    <Text style={styles.generateButtonSmallText}>Get Summary</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            {(report.summary && !report.summary.includes('We could not generate a summary')) && (
              <TouchableOpacity onPress={() => setShowSummary(!showSummary)} style={{ padding: 4 }}>
                <MaterialIcons name={showSummary ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={24} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          {report.summary && !report.summary.includes('We could not generate a summary') ? (
            showSummary && (
              <>
                <Text style={styles.summaryText}>{report.summary}</Text>
                <View style={styles.summaryFooter}>
                  <MaterialIcons name="check-circle-outline" size={14} color={colors['on-surface-variant']} />
                  <Text style={styles.summaryFooterText}>AI insights are for informational purposes only.</Text>
                </View>
              </>
            )
          ) : (
            <>
              {report.summary?.includes('We could not generate a summary') && (
                <Text style={[styles.summaryText, { color: colors.error, marginBottom: 8 }]}>
                  {report.summary}
                </Text>
              )}
              <Text style={[styles.summaryText, { color: colors['on-surface-variant'], fontStyle: 'italic' }]}>
                {report.summary?.includes('We could not generate a summary')
                  ? "Click 'Get Summary' to try analyzing this document again."
                  : "No AI summary generated yet. Click 'Get Summary' to analyze this document."}
              </Text>
            </>
          )}
        </View>

        {/* Key Values (Dynamic based on metrics and category) */}
        {displayMetrics.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Key Values</Text>
              <TouchableOpacity onPress={handleViewPdf}>
                <Text style={styles.viewFullReportText}>View Full Report <MaterialIcons name="open-in-new" size={14} /></Text>
              </TouchableOpacity>
            </View>

            <View style={styles.metricsContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Test</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Result</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Unit</Text>
              </View>
              {displayMetrics.map((metric: any, index: number) => {
                const isLast = index === displayMetrics.length - 1;
                return (
                  <View key={index} style={[styles.tableRow, !isLast && styles.metricDivider]}>
                    <Text style={[styles.tableCellText, { flex: 2, fontWeight: '500' }]} numberOfLines={2}>
                      {metric.name}
                    </Text>
                    <Text style={[styles.tableCellText, { flex: 1, fontWeight: '700', color: metric.status !== 'normal' && metric.status ? colors.error : colors['on-surface'] }]}>
                      {metric.value}
                    </Text>
                    <Text style={[styles.tableCellText, { flex: 1, color: colors['on-surface-variant'] }]}>
                      {metric.unit || '-'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* About This Report (Dynamic Metadata) */}
        {(report.sampleId || report.uploadDate || report.extractedEventDate || report.orderedBy || report.verifiedStatus || report.doctorName) && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>About This Report</Text>
            <View style={styles.aboutCard}>
              {renderInfoRow("science", "Sample ID", report.sampleId)}
              {renderInfoRow("event", "Sample Date", report.extractedEventDate)}
              {renderInfoRow("event-note", "Report Date", report.uploadDate?.split('T')[0])}
              {renderInfoRow("person", "Ordered By", report.orderedBy || report.doctorName)}
              {renderInfoRow("verified", "Verified", report.verifiedStatus)}
            </View>
          </View>
        )}

        {/* Actions Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={handleViewPdf}>
              <MaterialIcons name="description" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}>View PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <MaterialIcons name="share" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleDownload} disabled={downloading}>
              {downloading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <MaterialIcons name="file-download" size={20} color={colors.primary} />
                  <Text style={styles.actionButtonText}>Download</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleOpenFolderModal}>
              <MaterialIcons name="create-new-folder" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}>Add to Folder</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

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

            {['Hindi', 'Spanish', 'French', 'English'].map(lang => (
              <TouchableOpacity key={lang} style={styles.langOption} onPress={() => handleTranslate(lang)}>
                <Text style={styles.langOptionText}>{lang}</Text>
                <MaterialIcons name="chevron-right" size={24} color={colors['on-surface-variant']} />
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Folder Selection Modal */}
      <Modal
        visible={showFolderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFolderModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFolderModal(false)}>
          <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Add to Folder</Text>

            <View style={styles.createFolderRow}>
              <TextInput
                style={styles.folderInput}
                placeholder="New Folder Name"
                value={newFolderName}
                onChangeText={setNewFolderName}
              />
              <TouchableOpacity
                style={styles.createFolderBtn}
                onPress={handleCreateFolder}
                disabled={creatingFolder || !newFolderName.trim()}
              >
                {creatingFolder ? <ActivityIndicator size="small" color="#FFF" /> : <MaterialIcons name="add" size={24} color="#FFF" />}
              </TouchableOpacity>
            </View>

            {folderLoading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : folders.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20, color: colors['on-surface-variant'] }}>No folders found. Create one above.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 300, marginTop: 10 }}>
                {folders.map(folder => (
                  <TouchableOpacity
                    key={folder.id}
                    style={styles.folderOption}
                    onPress={() => handleAddToFolder(folder.id)}
                  >
                    <MaterialIcons name="folder" size={24} color={colors.primary} />
                    <Text style={styles.folderOptionText}>{folder.name}</Text>
                    <MaterialIcons name="add-circle-outline" size={24} color={colors.primary} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
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
  },
  headerIcon: {
    padding: 8,
  },
  headerTitle: {
    ...typography.Title2,
    color: colors['on-surface'],
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  headerCardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  docIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(92, 107, 192, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  docTitle: {
    ...typography.Title2,
    color: colors['on-surface'],
    fontWeight: '700',
    marginBottom: 8,
  },
  docMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  docMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  docMetaText: {
    ...typography.bodyMd,
    color: colors['on-surface-variant'],
    fontSize: 12,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  badgeContainer: {
    backgroundColor: 'rgba(92, 107, 192, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  fileTypeBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  fileTypeText: {
    fontSize: 10,
    color: '#D32F2F',
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: '#F0FDF8',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryTitle: {
    ...typography.labelLg,
    color: '#000000',
    fontWeight: '700',
    marginLeft: 6,
    flex: 1,
  },
  generateButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00C48C',
  },
  generateButtonSmallText: {
    fontSize: 12,
    color: '#00C48C',
    fontWeight: '600',
  },
  summaryText: {
    ...typography.bodyMd,
    color: colors['on-surface'],
    lineHeight: 22,
    marginBottom: 12,
  },
  summaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryFooterText: {
    fontSize: 11,
    color: colors['on-surface-variant'],
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionHeading: {
    ...typography.Title2,
    color: colors['on-surface'],
    fontWeight: '700',
    marginBottom: 12,
  },
  viewFullReportText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  metricsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors['on-surface-variant'],
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tableCellText: {
    fontSize: 13,
    color: colors['on-surface'],
  },
  metricDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: colors['on-surface-variant'],
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors['on-surface'],
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    width: '48%',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors['on-surface'],
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
  createFolderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  folderInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 14,
  },
  createFolderBtn: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  folderOptionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors['on-surface'],
  },
});
