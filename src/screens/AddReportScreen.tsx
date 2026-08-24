import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Modal, ActivityIndicator, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { uploadDocument, getDocument, getDocumentText, confirmDate } from '../services/api';
import { colors, spacing, typography } from '../theme';

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
  
  const handleDocumentSelection = async () => {
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
    }
  };

  const handleImageSelection = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return;
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      
    } catch (error) {
      console.error('Upload failed', error);
      Alert.alert('Upload Failed', 'There was an error uploading your document.');
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Add Medical Report</Text>
          <Text style={styles.subtitle}>Take a photo or choose a file.</Text>
        </View>

        <View style={styles.optionsStack}>
          {/* Option 1 */}
          <TouchableOpacity style={styles.optionCard} activeOpacity={0.8} onPress={() => handleImageSelection(true)}>
            <View style={styles.cardInner}>
              <View style={[styles.iconWrapper, { backgroundColor: colors['secondary-container'] }]}>
                <MaterialIcons name="photo-camera" size={28} color={colors.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Take Photo</Text>
                <Text style={styles.optionSubtitle}>Use your camera</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors['on-surface-variant']} />
            </View>
          </TouchableOpacity>

          {/* Option 2 */}
          <TouchableOpacity style={styles.optionCard} activeOpacity={0.8} onPress={() => handleImageSelection(false)}>
            <View style={styles.cardInner}>
              <View style={[styles.iconWrapper, { backgroundColor: colors['tertiary-container'] }]}>
                <MaterialIcons name="image" size={28} color={colors.tertiary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Choose from Gallery</Text>
                <Text style={styles.optionSubtitle}>Select a report photo</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors['on-surface-variant']} />
            </View>
          </TouchableOpacity>

          {/* Option 3 */}
          <TouchableOpacity style={styles.optionCard} activeOpacity={0.8} onPress={handleDocumentSelection}>
            <View style={styles.cardInner}>
              <View style={[styles.iconWrapper, { backgroundColor: colors['primary-container'] }]}>
                <MaterialIcons name="picture-as-pdf" size={28} color={colors['on-primary-container']} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Choose PDF</Text>
                <Text style={styles.optionSubtitle}>Select a PDF report</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors['on-surface-variant']} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

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
              <TextInput 
                style={styles.dateInput}
                placeholder="e.g. 2026-08-15"
                placeholderTextColor={colors.outline}
                value={manualDate}
                onChangeText={(text) => { setManualDate(text); setSelectedDate(''); }}
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleConfirmDate} activeOpacity={0.8}>
              <View style={styles.primaryButtonContainer}>
                <Text style={styles.primaryButtonText}>Save Report</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

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
    flex: 1,
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.stackLg,
  },
  headerText: {
    gap: spacing.stackSm,
    paddingTop: 16,
  },
  title: {
    ...typography.headlineLgMobile,
    color: colors['on-surface'],
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors['on-surface-variant'],
  },
  optionsStack: {
    gap: 16,
    marginTop: 16,
  },
  optionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    overflow: 'hidden',
    backgroundColor: colors['surface-container-lowest'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 88,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  optionTitle: {
    ...typography.headlineSm,
    color: colors['on-surface'],
  },
  optionSubtitle: {
    ...typography.bodyMd,
    color: colors['on-surface-variant'],
    marginTop: 4,
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
