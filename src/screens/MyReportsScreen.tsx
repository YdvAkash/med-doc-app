import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  FlatList,
  RefreshControl,
  Modal,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import { getDocuments, getDocument } from '../services/api';
import { useIsFocused } from '@react-navigation/native';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { FileText, Pill, FlaskConical, Image as ImageIcon, Activity, Files } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = {
  navigation: any;
  route: any;
};

const getCategoryConfig = (category?: string | null, title?: string | null) => {
  const c = (category || '').toUpperCase();
  const t = (title || '').toLowerCase();

  if (c === 'PRESCRIPTION' || t.includes('prescription')) {
    return { Icon: Pill, color: '#8A4AF3', bg: '#F3E8FF', tagText: 'Prescription', tagColor: '#8A4AF3', tagBg: '#F3E8FF' };
  }
  if (c === 'LAB_TEST' || t.includes('blood count') || t.includes('cbc') || t.includes('test')) {
    return { Icon: FlaskConical, color: '#F28E2B', bg: '#FFF7ED', tagText: 'Lab Test', tagColor: '#F28E2B', tagBg: '#FFF7ED' };
  }
  if (c === 'IMAGING' || t.includes('x-ray') || t.includes('scan') || t.includes('mri') || t.includes('chest')) {
    return { Icon: ImageIcon, color: '#1E293B', bg: '#F1F5F9', tagText: 'Imaging', tagColor: '#8B5CF6', tagBg: '#F3E8FF' };
  }
  if (t.includes('ecg') || t.includes('heart') || t.includes('pulse')) {
    return { Icon: Activity, color: '#EF4444', bg: '#FEF2F2', tagText: 'Report', tagColor: '#EF4444', tagBg: '#FEF2F2' };
  }
  return { Icon: FileText, color: '#3B82F6', bg: '#EFF6FF', tagText: 'Report', tagColor: '#3B82F6', tagBg: '#EFF6FF' };
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
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

export const MyReportsScreen: React.FC<Props> = ({ navigation, route }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState('All');

  // Date range filter state
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [tempStartDate, setTempStartDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [tempEndDate, setTempEndDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // 3-dot menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  // Accept category from route params (from HomeScreen)
  const routeCategory = route?.params?.categoryFilter;

  useEffect(() => {
    if (routeCategory) {
      const chipMap: Record<string, string> = {
        'REPORT': 'Reports',
        'PRESCRIPTION': 'Prescriptions',
        'LAB_TEST': 'Lab Tests',
        'IMAGING': 'Imaging',
      };
      setActiveChip(chipMap[routeCategory] || 'All');
    }
  }, [routeCategory]);

  const categoryMap: Record<string, string | undefined> = {
    'All': undefined,
    'Reports': 'REPORT',
    'Lab Tests': 'LAB_TEST',
    'Imaging': 'IMAGING',
    'Prescriptions': 'PRESCRIPTION',
  };

  const fetchReports = useCallback(async (chip?: string) => {
    setLoading(true);
    try {
      const currentChip = chip !== undefined ? chip : activeChip;
      const catParam = categoryMap[currentChip];
      const startStr = filterStartDate ? filterStartDate.toISOString().split('T')[0] + 'T00:00:00' : undefined;
      const endStr = filterEndDate ? filterEndDate.toISOString().split('T')[0] + 'T23:59:59' : undefined;
      const res = await getDocuments(0, 100, searchQuery || undefined, catParam, startStr, endStr);
      setReports(res.data?.content || res.content || []);
    } catch (err) {
      console.log('Error fetching reports', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeChip, searchQuery, filterStartDate, filterEndDate]);

  useEffect(() => {
    if (isFocused) {
      fetchReports();
    }
  }, [isFocused, fetchReports]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, [fetchReports]);

  const handleChipPress = (chip: string) => {
    setActiveChip(chip);
    // Directly fetch with the new chip value to avoid stale closure
    fetchReports(chip);
  };

  const handleSearch = () => {
    fetchReports();
  };

  const handleOpenMenu = (report: any) => {
    setSelectedReport(report);
    setMenuVisible(true);
  };

  const handleViewDocument = async () => {
    if (!selectedReport) return;
    setMenuVisible(false);
    try {
      const res = await getDocument(selectedReport.id);
      const doc = res.data;
      if (doc?.downloadUrl) {
        await Linking.openURL(doc.downloadUrl);
      } else {
        Alert.alert('Unavailable', 'Document file is not available.');
      }
    } catch (err) {
      console.error('Error viewing document:', err);
      Alert.alert('Error', 'Could not open the document.');
    }
  };

  const handleDownloadDocument = async () => {
    if (!selectedReport) return;
    setMenuVisible(false);
    setDownloading(true);
    try {
      const res = await getDocument(selectedReport.id);
      const doc = res.data;
      if (!doc?.downloadUrl) {
        Alert.alert('Unavailable', 'No download link available.');
        setDownloading(false);
        return;
      }

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

      let extension = '.pdf';
      let mimeType = 'application/pdf';
      const sourceName = doc.originalFilename || doc.downloadUrl;
      if (sourceName.toLowerCase().includes('.jpg') || sourceName.toLowerCase().includes('.jpeg')) {
        extension = '.jpg'; mimeType = 'image/jpeg';
      } else if (sourceName.toLowerCase().includes('.png')) {
        extension = '.png'; mimeType = 'image/png';
      }

      const fileName = doc.title ? `${doc.title.replace(/\s+/g, '_')}${extension}` : `Medical_Report${extension}`;

      const downloadResult = await FileSystem.downloadAsync(
        doc.downloadUrl,
        FileSystem.cacheDirectory + fileName
      );

      try {
        const base64 = await FileSystem.readAsStringAsync(downloadResult.uri, { encoding: FileSystem.EncodingType.Base64 });
        const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(directoryUri, fileName, mimeType);
        await FileSystem.writeAsStringAsync(newFileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
        Alert.alert('Success', 'Report downloaded successfully!');
      } catch (innerError) {
        await AsyncStorage.removeItem('@download_directory_uri');
        Alert.alert('Download Failed', 'Could not access the saved folder. Please try downloading again.');
      }
    } catch (e) {
      console.error('Download error:', e);
      Alert.alert('Download Failed', 'An error occurred while downloading.');
    } finally {
      setDownloading(false);
    }
  };

  const handleApplyDateFilter = () => {
    setFilterStartDate(tempStartDate);
    setFilterEndDate(tempEndDate);
    setShowDateFilter(false);
  };

  const handleClearDateFilter = () => {
    setFilterStartDate(null);
    setFilterEndDate(null);
    setTempStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    setTempEndDate(new Date());
    setShowDateFilter(false);
  };

  const chips = [
    { key: 'All', label: 'All', icon: 'folder-open', iconColor: '#3B82F6', activeBg: '#3B82F6' },
    { key: 'Reports', label: 'Reports', icon: 'description', iconColor: '#22C55E', activeBg: '#22C55E' },
    { key: 'Lab Tests', label: 'Lab Tests', icon: 'science', iconColor: '#F59E0B', activeBg: '#F59E0B' },
    { key: 'Imaging', label: 'Imaging', icon: 'image', iconColor: '#8B5CF6', activeBg: '#8B5CF6' },
    { key: 'Prescriptions', label: 'Prescriptions', icon: 'medication', iconColor: '#EF4444', activeBg: '#EF4444' },
  ];

  const isFilterActive = filterStartDate !== null || filterEndDate !== null;

  const renderReportCard = ({ item, index }: { item: any; index: number }) => {
    const config = getCategoryConfig(item.category, item.title || item.originalFilename);
    const Icon = config.Icon;
    const displayTitle = getDisplayTitle(item);
    const dateStr = formatDate(item.extractedEventDate || item.uploadDate?.split('T')[0]);
    const provider = item.providerName || item.labName || (item.tags && item.tags.length > 0 ? item.tags[0] : '');
    const subtitle = provider ? `${dateStr}  •  ${provider}` : dateStr;
    const ext = (item.fileType || item.originalFilename?.split('.').pop() || 'PDF').toUpperCase();
    const badgeText = ext === 'APPLICATION/PDF' ? 'PDF' : ext.substring(0, 4);

    return (
      <Animated.View entering={FadeInDown.delay(index * 60).duration(400).springify()}>
        <TouchableOpacity
          style={styles.reportCard}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ReportDetail', { id: item.id })}
        >
          {/* Category Icon */}
          <View style={[styles.cardIcon, { backgroundColor: config.bg }]}>
            <Icon size={24} color={config.color} strokeWidth={2} />
          </View>

          {/* Info */}
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>{displayTitle}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>{subtitle}</Text>
            <View style={[styles.cardTag, { backgroundColor: config.tagBg }]}>
              <Text style={[styles.cardTagText, { color: config.tagColor }]}>{config.tagText}</Text>
            </View>
          </View>

          {/* Right side: File badge + 3-dot menu */}
          <View style={styles.cardRight}>
            <View style={styles.fileBadge}>
              <Text style={styles.fileBadgeText}>{badgeText}</Text>
            </View>
            <TouchableOpacity
              style={styles.menuBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => handleOpenMenu(item)}
            >
              <MaterialIcons name="more-vert" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.screenTitle}>My Records</Text>
          </View>
          <TouchableOpacity
            style={styles.uploadBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AddReport')}
          >
            <MaterialIcons name="file-upload" size={18} color={colors.primary} />
            <Text style={styles.uploadBtnText}>Upload</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar + Filter */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={22} color="#94A3B8" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search records by name, type or date..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, isFilterActive && styles.filterBtnActive]}
            onPress={() => setShowDateFilter(true)}
          >
            <MaterialIcons name="tune" size={22} color={isFilterActive ? '#FFF' : '#64748B'} />
          </TouchableOpacity>
        </View>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {chips.map(chip => {
            const isActive = activeChip === chip.key;
            return (
              <TouchableOpacity
                key={chip.key}
                style={[
                  styles.chip,
                  isActive && { backgroundColor: chip.activeBg, borderColor: chip.activeBg },
                ]}
                activeOpacity={0.8}
                onPress={() => handleChipPress(chip.key)}
              >
                <MaterialIcons
                  name={chip.icon as any}
                  size={16}
                  color={isActive ? '#FFF' : chip.iconColor}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>



      {/* Active Date Filter Indicator */}
      {isFilterActive && (
        <View style={styles.activeFilterBar}>
          <MaterialIcons name="date-range" size={16} color={colors.primary} />
          <Text style={styles.activeFilterText}>
            {filterStartDate ? formatDate(filterStartDate.toISOString()) : '—'} → {filterEndDate ? formatDate(filterEndDate.toISOString()) : '—'}
          </Text>
          <TouchableOpacity onPress={handleClearDateFilter}>
            <MaterialIcons name="close" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Records</Text>
        <Text style={styles.recordCount}>{reports.length} records</Text>
      </View>

      {/* Document List */}
      {loading ? (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <SkeletonLoader height={88} />
          <SkeletonLoader height={88} />
          <SkeletonLoader height={88} />
          <SkeletonLoader height={88} />
        </View>
      ) : reports.length === 0 ? (
        <EmptyState
          title="No Records Found"
          description="We couldn't find any medical records matching your search."
          icon={Files}
          actionLabel="Upload Report"
          onAction={() => navigation.navigate('AddReport')}
        />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={item => item.id.toString()}
          renderItem={renderReportCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }

        />
      )}

      {/* 3-Dot Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuSheet}>
            <View style={styles.menuHandle} />
            <Text style={styles.menuTitle} numberOfLines={1}>
              {selectedReport ? getDisplayTitle(selectedReport) : 'Document'}
            </Text>

            <TouchableOpacity style={styles.menuOption} onPress={handleViewDocument}>
              <MaterialIcons name="visibility" size={22} color={colors.primary} />
              <Text style={styles.menuOptionText}>View Document</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuOption} onPress={handleDownloadDocument}>
              <MaterialIcons name="file-download" size={22} color={colors.primary} />
              <Text style={styles.menuOptionText}>Download</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Range Filter Modal */}
      <Modal
        visible={showDateFilter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDateFilter(false)}
      >
        <TouchableOpacity
          style={styles.dateFilterOverlay}
          activeOpacity={1}
          onPress={() => setShowDateFilter(false)}
        >
          <View style={styles.dateFilterSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.menuHandle} />
            <Text style={styles.dateFilterTitle}>Filter by Date Range</Text>

            {/* From Date */}
            <Text style={styles.dateLabel}>From</Text>
            <TouchableOpacity
              style={styles.datePickerBtn}
              onPress={() => setShowStartPicker(true)}
            >
              <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
              <Text style={styles.datePickerText}>
                {formatDate(tempStartDate.toISOString())}
              </Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={tempStartDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={tempEndDate}
                onChange={(event, date) => {
                  setShowStartPicker(Platform.OS === 'ios');
                  if (date) setTempStartDate(date);
                }}
              />
            )}

            {/* To Date */}
            <Text style={[styles.dateLabel, { marginTop: 16 }]}>To</Text>
            <TouchableOpacity
              style={styles.datePickerBtn}
              onPress={() => setShowEndPicker(true)}
            >
              <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
              <Text style={styles.datePickerText}>
                {formatDate(tempEndDate.toISOString())}
              </Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={tempEndDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={tempStartDate}
                maximumDate={new Date()}
                onChange={(event, date) => {
                  setShowEndPicker(Platform.OS === 'ios');
                  if (date) setTempEndDate(date);
                }}
              />
            )}

            <View style={styles.dateFilterActions}>
              <TouchableOpacity style={styles.clearFilterBtn} onPress={handleClearDateFilter}>
                <Text style={styles.clearFilterBtnText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyFilterBtn} onPress={handleApplyDateFilter}>
                <Text style={styles.applyFilterBtnText}>Apply Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  headerSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  activeFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  activeFilterText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  recordCount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  cardTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  cardTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fileBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  fileBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  },
  menuBtn: {
    padding: 4,
  },


  // Menu Modal
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  menuHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 14,
  },
  menuOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Date Filter Modal
  dateFilterOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  dateFilterSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  dateFilterTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  datePickerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  dateFilterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  clearFilterBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  clearFilterBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  applyFilterBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyFilterBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
