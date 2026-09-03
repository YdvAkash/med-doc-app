import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Modal, ActivityIndicator, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { uploadDocument, getDocument, getDocumentText, confirmDate } from '../services/api';
import { colors, spacing, typography } from '../theme';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { StartIoAds } from '../services/ads/StartIoAds';

type Props = {
  navigation: any;
};

type UploadState = 'idle' | 'uploading' | 'processing' | 'confirm_date';

export const AddReportScreen: React.FC<Props> = ({ navigation }) => {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [currentDocId, setCurrentDocId] = useState<number | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [dateCandidates, setDateCandidates] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [manualDate, setManualDate] = useState<string>('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isPicking, setIsPicking] = useState(false);

  const handleDocumentSelection = async () => {
    if (isPicking) return;
    setIsPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        await handleUpload(file.uri, file.mimeType || 'application/octet-stream', file.name);
      }
    } catch (err) {
      console.log('Error selecting document', err);
    } finally {
      setIsPicking(false);
    }
  };

  const handleImageSelection = async (useCamera: boolean) => {
    if (isPicking) return;
    setIsPicking(true);
    try {
      let result;
      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return;
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const filename = file.uri.split('/').pop() || 'photo.jpg';
        const mimeType = file.uri.endsWith('.png') ? 'image/png' : 'image/jpeg';
        await handleUpload(file.uri, mimeType, filename);
      }
    } catch (err) {
      console.log('Error picking image', err);
    } finally {
      setIsPicking(false);
    }
  };

  const handleUpload = async (uri: string, mimeType: string, name: string) => {
    setUploadState('uploading');
    setProgress(0);
    try {
      const res = await uploadDocument(uri, mimeType, name, (progressEvent: any) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      });

      const docId = res.data.id;
      setCurrentDocId(docId);
      setUploadState('processing');
      pollDocumentStatus(docId);

    } catch (error: any) {
      console.error('Upload failed', error);
      if (error.response?.status === 403) {
        Alert.alert(
          'Limit Reached', 
          error.response?.data?.message || 'Upload limit reached for your current plan.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade Plan', onPress: () => navigation.navigate('Subscription') }
          ]
        );
      } else {
        Alert.alert('Upload Failed', 'There was an error uploading your document.');
      }
      setUploadState('idle');
    }
  };

  const pollDocumentStatus = async (id: number) => {
    const interval = setInterval(async () => {
      try {
        const res = await getDocument(id);
        const status = res.data.processingStatus;

        if (status === 'completed') {
          clearInterval(interval);
          await fetchExtractedData(id);
        } else if (status === 'failed') {
          clearInterval(interval);
          Alert.alert('Processing Failed', 'Could not read the document.');
          setUploadState('idle');
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 3000);
  };

  const fetchExtractedData = async (id: number) => {
    try {
      const res = await getDocumentText(id);
      setExtractedText(res.data.rawText);
      setDateCandidates(res.data.dateCandidates || []);
      if (res.data.dateCandidates && res.data.dateCandidates.length > 0) {
        setSelectedDate(res.data.dateCandidates[0].date);
      } else {
        const today = new Date().toISOString().split('T')[0];
        setManualDate(today);
      }
      setUploadState('confirm_date');
    } catch (err) {
      console.error('Fetch text error', err);
      Alert.alert('Error', 'Could not fetch extracted data.');
      setUploadState('idle');
    }
  };

  const handleConfirmDate = async () => {
    if (!currentDocId) return;
    const finalDate = manualDate || selectedDate;
    if (!finalDate) {
      Alert.alert('Required', 'Please select or enter a date.');
      return;
    }

    try {
      await confirmDate(currentDocId, finalDate);
      Alert.alert('Success', 'Document added successfully!');
      setUploadState('idle');
      navigation.navigate('MainTabs', { screen: 'ReportsTab' });
      StartIoAds.showInterstitialSafely();
    } catch (error) {
      console.error('Confirm date failed', error);
      Alert.alert('Error', 'Failed to confirm date.');
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(extractedText);
    Alert.alert('Copied', 'Text copied to clipboard!');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Custom Header with Back Button and Question Mark */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
              <MaterialIcons name="arrow-back" size={22} color="#1F2937" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle}>
              <MaterialIcons name="help-outline" size={22} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Header Texts */}
          <View style={styles.headerText}>
            <View style={{ flex: 1, paddingRight: 20 }}>
              <Text style={styles.title}>Add Medical Report</Text>
              <Text style={styles.subtitle}>Upload your reports, prescriptions, lab tests or scans to keep everything organized.</Text>
            </View>
          </View>

          {/* Security Banner */}
          <View style={styles.securityBanner}>
            <View style={styles.securityIconBox}>
              <MaterialIcons name="security" size={20} color="#3B82F6" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.securityTitle}>Your data is private & secure</Text>
              <Text style={styles.securitySubtitle}>We ensure complete confidentiality of your health data.</Text>
            </View>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#94A3B8" />
          </View>

          <Text style={styles.sectionHeader}>Upload a Report</Text>

          <View style={styles.optionsStack}>
            {/* Option 1: Take Photo */}
            <TouchableOpacity style={[styles.optionCard, { borderLeftColor: '#3B82F6' }]} activeOpacity={0.8} onPress={() => handleImageSelection(true)}>
              <View style={styles.cardInner}>
                <View style={[styles.iconWrapper, { backgroundColor: '#EFF6FF' }]}>
                  <MaterialIcons name="photo-camera" size={28} color="#3B82F6" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Take a Photo</Text>
                  <Text style={styles.optionSubtitle}>Use your camera to capture the report</Text>
                </View>
                <View style={[styles.arrowCircle, { backgroundColor: '#EFF6FF' }]}>
                  <MaterialIcons name="chevron-right" size={20} color="#3B82F6" />
                </View>
              </View>
            </TouchableOpacity>

            {/* Option 2: Gallery */}
            <TouchableOpacity style={[styles.optionCard, { borderLeftColor: '#EC4899' }]} activeOpacity={0.8} onPress={() => handleImageSelection(false)}>
              <View style={styles.cardInner}>
                <View style={[styles.iconWrapper, { backgroundColor: '#FDF2F8' }]}>
                  <MaterialIcons name="image" size={28} color="#EC4899" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Choose from Gallery</Text>
                  <Text style={styles.optionSubtitle}>Select an image from your phone gallery</Text>
                </View>
                <View style={[styles.arrowCircle, { backgroundColor: '#FDF2F8' }]}>
                  <MaterialIcons name="chevron-right" size={20} color="#EC4899" />
                </View>
              </View>
            </TouchableOpacity>

            {/* Option 3: PDF */}
            <TouchableOpacity style={[styles.optionCard, { borderLeftColor: '#10B981' }]} activeOpacity={0.8} onPress={handleDocumentSelection}>
              <View style={styles.cardInner}>
                <View style={[styles.iconWrapper, { backgroundColor: '#ECFDF5' }]}>
                  <MaterialIcons name="picture-as-pdf" size={28} color="#10B981" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Choose PDF File</Text>
                  <Text style={styles.optionSubtitle}>Upload a PDF file from your device</Text>
                </View>
                <View style={[styles.arrowCircle, { backgroundColor: '#ECFDF5' }]}>
                  <MaterialIcons name="chevron-right" size={20} color="#10B981" />
                </View>
              </View>
            </TouchableOpacity>

            {/* Option 4: Cloud */}
            <TouchableOpacity style={[styles.optionCard, { borderLeftColor: '#8B5CF6' }]} activeOpacity={0.8} onPress={handleDocumentSelection}>
              <View style={styles.cardInner}>
                <View style={[styles.iconWrapper, { backgroundColor: '#F5F3FF' }]}>
                  <MaterialIcons name="cloud-upload" size={28} color="#8B5CF6" />
                </View>
                <View style={styles.optionTextContainer}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.optionTitle}>Upload from Cloud</Text>
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>New</Text>
                    </View>
                  </View>
                  <Text style={styles.optionSubtitle}>Import reports from Google Drive, Dropbox or OneDrive</Text>
                </View>
                <View style={[styles.arrowCircle, { backgroundColor: '#F5F3FF' }]}>
                  <MaterialIcons name="chevron-right" size={20} color="#8B5CF6" />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.supportedFormatsTitle}>Supported formats</Text>
          <View style={styles.formatsRow}>
            <View style={styles.formatTag}><MaterialIcons name="image" size={14} color="#3B82F6" style={{marginRight:6}}/><Text style={styles.formatText}>JPG</Text></View>
            <View style={styles.formatTag}><MaterialIcons name="image" size={14} color="#10B981" style={{marginRight:6}}/><Text style={styles.formatText}>PNG</Text></View>
            <View style={styles.formatTag}><MaterialIcons name="picture-as-pdf" size={14} color="#EC4899" style={{marginRight:6}}/><Text style={styles.formatText}>PDF</Text></View>
            <View style={styles.formatTag}><MaterialIcons name="image" size={14} color="#8B5CF6" style={{marginRight:6}}/><Text style={styles.formatText}>HEIC</Text></View>
          </View>

          <View style={styles.footerBanner}>
            <View style={styles.footerIcon}>
              <MaterialIcons name="lock-outline" size={22} color="#8B5CF6" />
            </View>
            <Text style={styles.footerText}>All files are securely encrypted and stored in your account.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Upload & Processing Modal */}
      <Modal visible={uploadState === 'uploading' || uploadState === 'processing'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {uploadState === 'uploading' ? (
              <>
                <Text style={styles.modalTitle}>Uploading...</Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{progress}%</Text>
              </>
            ) : (
              <>
                <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 16 }} />
                <Text style={styles.modalTitle}>Processing Document</Text>
                <Text style={styles.modalSubtitle}>Extracting text and identifying dates...</Text>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Confirm Date Modal */}
      <Modal visible={uploadState === 'confirm_date'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.fullModalContainer}>
          <View style={styles.fullModalHeader}>
            <Text style={styles.modalTitle}>Review & Confirm</Text>
            <TouchableOpacity onPress={() => setUploadState('idle')}>
              <MaterialIcons name="close" size={24} color={colors['on-surface']} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
            <Text style={styles.sectionTitle}>Extracted Text</Text>
            <View style={styles.extractedTextContainer}>
              <Text style={styles.extractedText} numberOfLines={8}>{extractedText || 'No text extracted.'}</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={copyToClipboard}>
                <MaterialIcons name="content-copy" size={18} color={colors.primary} />
                <Text style={styles.copyBtnText}>Copy Text</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Confirm Document Date</Text>
            <Text style={[styles.modalSubtitle, { textAlign: 'left', marginBottom: 16 }]}>Select the date found in the document, or enter manually.</Text>

            {dateCandidates.map((cand, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.radioOption, selectedDate === cand.date && styles.radioOptionSelected]}
                onPress={() => { setSelectedDate(cand.date); setManualDate(''); }}
              >
                <MaterialIcons name={selectedDate === cand.date ? "radio-button-checked" : "radio-button-unchecked"} size={24} color={selectedDate === cand.date ? colors.primary : colors.outline} />
                <Text style={styles.radioText}>{cand.date}</Text>
                <Text style={styles.confidenceText}>{Math.round((cand.confidence || 0) * 100)}% Match</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.manualDateContainer}>
              <Text style={styles.label}>Manual Date Entry (YYYY-MM-DD)</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={() => { setDatePickerVisibility(true); setSelectedDate(''); }}>
                <View style={[styles.dateInput, { justifyContent: 'center' }]}>
                  <Text style={{ color: manualDate ? colors['on-surface'] : colors.outline, ...typography.bodyLg }}>
                    {manualDate || 'Select Date'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={(date) => {
                setDatePickerVisibility(false);
                const formatted = date.toISOString().split('T')[0];
                setManualDate(formatted);
                setSelectedDate('');
              }}
              onCancel={() => setDatePickerVisibility(false)}
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleConfirmDate} activeOpacity={0.8}>
              <View style={styles.primaryButtonContainer}>
                <Text style={styles.primaryButtonText}>Save Report</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC', // Very light blue/gray background
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerText: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0B1C3D',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 32,
  },
  securityIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 2,
  },
  securitySubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  optionsStack: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    paddingRight: 10,
    lineHeight: 18,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBadge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  supportedFormatsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 32,
    marginBottom: 12,
  },
  formatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formatTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  formatText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  footerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
  },
  footerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    color: '#4C1D95',
    lineHeight: 20,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors['surface-container-lowest'],
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  modalTitle: {
    ...typography.headlineSm,
    color: colors['on-surface'],
    marginBottom: 8,
  },
  modalSubtitle: {
    ...typography.bodyMd,
    color: colors['on-surface-variant'],
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: colors['surface-container-highest'],
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    ...typography.bodyMd,
    color: colors['on-surface-variant'],
    marginTop: 8,
  },
  fullModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fullModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors['outline-variant'],
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    ...typography.headlineSm,
    color: colors['on-surface'],
    marginBottom: 12,
  },
  extractedTextContainer: {
    backgroundColor: colors['surface-container-low'],
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors['outline-variant'],
  },
  extractedText: {
    fontSize: 13,
    color: colors['on-surface-variant'],
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 16,
    lineHeight: 20,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors['secondary-container'],
  },
  copyBtnText: {
    ...typography.labelLg,
    color: colors['on-secondary-container'],
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    marginTop: 12,
    backgroundColor: colors['surface-container-lowest'],
  },
  radioOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors['primary-container'],
  },
  radioText: {
    ...typography.bodyLg,
    color: colors['on-surface'],
    marginLeft: 12,
    flex: 1,
  },
  confidenceText: {
    ...typography.labelMd,
    color: colors['on-surface-variant'],
  },
  manualDateContainer: {
    marginTop: 32,
  },
  label: {
    ...typography.labelLg,
    color: colors['on-surface-variant'],
    marginBottom: 10,
  },
  dateInput: {
    backgroundColor: colors['surface-container-lowest'],
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    borderRadius: 12,
    padding: 16,
    ...typography.bodyLg,
    color: colors['on-surface'],
  },
  primaryButton: {
    marginTop: 40,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonContainer: {
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.labelLg,
    color: colors['on-primary'],
  },
});
