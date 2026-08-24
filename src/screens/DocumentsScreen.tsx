import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  FlatList,
  RefreshControl,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { DocumentService } from '../services/documents';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Upload, FileText, Trash2, Image, File, AlertCircle, CheckCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

interface Document {
  id: number;
  originalFilename: string;
  fileSizeBytes: number;
  fileType: string;
  uploadDate: string;
  processingStatus: string;
  category: string | null;
}

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fileIcon = (fileType: string) => {
  if (fileType === 'pdf') return { icon: '📄', color: ['#DC2626', '#F87171'] };
  if (['jpg', 'jpeg', 'png'].includes(fileType)) return { icon: '🖼️', color: ['#7C3AED', '#A855F7'] };
  return { icon: '📁', color: ['#0066FF', '#00A3FF'] };
};

const statusBadge = (status: string) => {
  switch (status) {
    case 'completed': return { label: 'Processed', color: '#34C759', bg: 'rgba(52,199,89,0.15)' };
    case 'processing': return { label: 'Processing', color: '#FF9500', bg: 'rgba(255,149,0,0.15)' };
    case 'failed': return { label: 'Failed', color: '#FF3B30', bg: 'rgba(255,59,48,0.15)' };
    default: return { label: 'Pending', color: '#8E8E93', bg: 'rgba(142,142,147,0.15)' };
  }
};

export const DocumentsScreen: React.FC<Props> = ({ navigation }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const progressAnim = useState(new Animated.Value(0))[0];

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDocuments = async () => {
    try {
      const res = await DocumentService.list();
      if (res.data?.content) {
        setDocuments(res.data.content);
      } else if (Array.isArray(res.data)) {
        setDocuments(res.data);
      }
    } catch (err) {
      showToast('Failed to load documents', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDocuments();
  }, []);

  const animateProgress = (toValue: number) => {
    Animated.timing(progressAnim, {
      toValue,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  const handleUploadFile = async (uri: string, name: string, mimeType: string) => {
    setUploading(true);
    setUploadProgress(0);
    animateProgress(0.3);

    try {
      animateProgress(0.6);
      await DocumentService.upload(uri, name, mimeType);
      animateProgress(1);
      showToast('Document uploaded successfully!', 'success');
      setTimeout(() => {
        setUploading(false);
        setShowUploadModal(false);
        fetchDocuments();
      }, 600);
    } catch (err: any) {
      setUploading(false);
      showToast(err.response?.data?.message || 'Upload failed. Please try again.', 'error');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setShowUploadModal(false);
        await handleUploadFile(asset.uri, asset.name, asset.mimeType || 'application/pdf');
      }
    } catch (err) {
      showToast('Failed to pick document', 'error');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('Camera roll permission denied', 'error');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const name = asset.fileName || `image_${Date.now()}.jpg`;
      const mimeType = asset.mimeType || 'image/jpeg';
      setShowUploadModal(false);
      await handleUploadFile(asset.uri, name, mimeType);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showToast('Camera permission denied', 'error');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const name = `photo_${Date.now()}.jpg`;
      setShowUploadModal(false);
      await handleUploadFile(asset.uri, name, 'image/jpeg');
    }
  };

  const handleDelete = (doc: Document) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${doc.originalFilename}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DocumentService.delete(doc.id);
              setDocuments(prev => prev.filter(d => d.id !== doc.id));
              showToast('Document deleted', 'success');
            } catch (err) {
              showToast('Failed to delete document', 'error');
            }
          },
        },
      ]
    );
  };

  const renderDocument = ({ item }: { item: Document }) => {
    const fi = fileIcon(item.fileType);
    const sb = statusBadge(item.processingStatus);
    return (
      <TouchableOpacity style={styles.docCard} activeOpacity={0.85}>
        <LinearGradient colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']} style={styles.docCardInner}>
          {/* File icon */}
          <View style={styles.docIconWrapper}>
            <LinearGradient colors={fi.color as any} style={styles.docIconGrad}>
              <Text style={styles.docIconText}>{fi.icon}</Text>
            </LinearGradient>
          </View>

          {/* Info */}
          <View style={styles.docInfo}>
            <Text style={styles.docName} numberOfLines={1}>{item.originalFilename}</Text>
            <View style={styles.docMeta}>
              <Text style={styles.docMetaText}>{formatFileSize(item.fileSizeBytes)}</Text>
              <View style={styles.docMetaDot} />
              <Text style={styles.docMetaText}>{formatDate(item.uploadDate)}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: sb.bg }]}>
              <Text style={[styles.statusPillText, { color: sb.color }]}>{sb.label}</Text>
            </View>
          </View>

          {/* Delete */}
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Trash2 color="#FF3B30" size={18} />
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0A0F', '#0D1B2A', '#0A0A0F']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color="#4488BB" size={24} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>My Documents</Text>
            <Text style={styles.headerSub}>{documents.length} file{documents.length !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowUploadModal(true)} style={styles.uploadHeaderBtn}>
            <LinearGradient colors={['#0066FF', '#00A3FF']} style={styles.uploadHeaderGrad}>
              <Upload color="#fff" size={18} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Upload Progress Banner */}
        {uploading && (
          <View style={styles.progressBanner}>
            <View style={styles.progressBannerHeader}>
              <ActivityIndicator color="#0099FF" size="small" />
              <Text style={styles.progressBannerText}>Uploading document...</Text>
            </View>
            <View style={styles.progressBar}>
              <Animated.View
                style={[styles.progressFill, {
                  width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                }]}
              />
            </View>
          </View>
        )}

        {/* Toast */}
        {toast && (
          <View style={[styles.toast, toast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
            {toast.type === 'success'
              ? <CheckCircle color="#34C759" size={16} />
              : <AlertCircle color="#FF3B30" size={16} />}
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        )}

        {/* Document List */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#0099FF" size="large" />
            <Text style={styles.loadingText}>Loading documents...</Text>
          </View>
        ) : documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📂</Text>
            <Text style={styles.emptyTitle}>No Documents Yet</Text>
            <Text style={styles.emptyDesc}>Upload your first medical record to get started.</Text>
            <TouchableOpacity onPress={() => setShowUploadModal(true)} style={styles.emptyBtn} activeOpacity={0.85}>
              <LinearGradient colors={['#0066FF', '#00A3FF']} style={styles.emptyBtnGrad}>
                <Upload color="#fff" size={18} />
                <Text style={styles.emptyBtnText}>Upload Document</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={documents}
            keyExtractor={item => item.id.toString()}
            renderItem={renderDocument}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0099FF" />
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* FAB when docs exist */}
        {documents.length > 0 && !uploading && (
          <TouchableOpacity onPress={() => setShowUploadModal(true)} style={styles.fab} activeOpacity={0.85}>
            <LinearGradient colors={['#0066FF', '#00A3FF']} style={styles.fabGrad}>
              <Upload color="#fff" size={24} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowUploadModal(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Upload Medical Document</Text>
            <Text style={styles.modalSub}>PDF, JPG, or PNG files up to 10MB</Text>

            <View style={styles.modalOptions}>
              <TouchableOpacity style={styles.modalOption} onPress={openCamera} activeOpacity={0.85}>
                <LinearGradient colors={['#7C3AED', '#A855F7']} style={styles.modalOptionIcon}>
                  <Text style={{ fontSize: 26 }}>📸</Text>
                </LinearGradient>
                <Text style={styles.modalOptionText}>Camera</Text>
                <Text style={styles.modalOptionSub}>Take a photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOption} onPress={pickImage} activeOpacity={0.85}>
                <LinearGradient colors={['#059669', '#10B981']} style={styles.modalOptionIcon}>
                  <Text style={{ fontSize: 26 }}>🖼️</Text>
                </LinearGradient>
                <Text style={styles.modalOptionText}>Gallery</Text>
                <Text style={styles.modalOptionSub}>Pick an image</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOption} onPress={pickDocument} activeOpacity={0.85}>
                <LinearGradient colors={['#DC2626', '#F87171']} style={styles.modalOptionIcon}>
                  <Text style={{ fontSize: 26 }}>📄</Text>
                </LinearGradient>
                <Text style={styles.modalOptionText}>Files</Text>
                <Text style={styles.modalOptionSub}>Browse PDF files</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setShowUploadModal(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0F' },
  orb1: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(0,102,255,0.1)', top: -60, right: -70 },
  orb2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(0,207,255,0.06)', bottom: 80, left: -50 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { color: '#4488BB', fontSize: 16, fontWeight: '600' },
  headerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  headerSub: { color: '#667788', fontSize: 13, textAlign: 'center', marginTop: 2 },
  uploadHeaderBtn: { borderRadius: 14, overflow: 'hidden', shadowColor: '#0066FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  uploadHeaderGrad: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

  progressBanner: { marginHorizontal: 20, marginBottom: 12, backgroundColor: 'rgba(0,102,255,0.12)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(0,163,255,0.25)' },
  progressBannerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  progressBannerText: { color: '#80BFFF', fontSize: 14, fontWeight: '600' },
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: '#0099FF', borderRadius: 2 },

  toast: { marginHorizontal: 20, marginBottom: 12, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  toastSuccess: { backgroundColor: 'rgba(52,199,89,0.12)', borderWidth: 1, borderColor: 'rgba(52,199,89,0.3)' },
  toastError: { backgroundColor: 'rgba(255,59,48,0.12)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)' },
  toastText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', flex: 1 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#667788', fontSize: 15 },

  listContent: { paddingHorizontal: 20, paddingBottom: 100 },

  docCard: { marginBottom: 12, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  docCardInner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  docIconWrapper: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5 },
  docIconGrad: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  docIconText: { fontSize: 22 },
  docInfo: { flex: 1, gap: 4 },
  docName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  docMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  docMetaText: { color: '#667788', fontSize: 12 },
  docMetaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#667788' },
  statusPill: { alignSelf: 'flex-start', borderRadius: 6, paddingVertical: 2, paddingHorizontal: 8, marginTop: 2 },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  deleteBtn: { padding: 8 },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 12 },
  emptyEmoji: { fontSize: 60, marginBottom: 8 },
  emptyTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  emptyDesc: { color: '#667788', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  emptyBtn: { marginTop: 12, borderRadius: 16, overflow: 'hidden', shadowColor: '#0066FF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 10 },
  emptyBtnGrad: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16, paddingHorizontal: 28 },
  emptyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },

  fab: { position: 'absolute', bottom: 30, right: 24, borderRadius: 20, overflow: 'hidden', shadowColor: '#0066FF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 14 },
  fabGrad: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#0F1923', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 20 },
  modalTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  modalSub: { color: '#667788', fontSize: 14, textAlign: 'center', marginBottom: 28 },
  modalOptions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
  modalOption: { alignItems: 'center', gap: 10 },
  modalOptionIcon: { width: 72, height: 72, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  modalOptionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  modalOptionSub: { color: '#667788', fontSize: 12 },
  modalCancel: { height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalCancelText: { color: '#667788', fontSize: 16, fontWeight: '600' },
});
