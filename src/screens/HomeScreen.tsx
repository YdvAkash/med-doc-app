import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing } from '../theme';
import { getDocuments, getProfile, getDashboardStats } from '../services/api';
import { Modal } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { DocumentCard } from '../components/DocumentCard';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { LinearGradient } from 'expo-linear-gradient';
import EmptyState from '../components/EmptyState';
import { FileSearch, FileText, Pill, FlaskConical, Image as ImageIcon } from 'lucide-react-native';
import Animated, { FadeInDown, withRepeat, withSequence, withTiming, Easing, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { AnimatedHeaderBackground } from '../components/common/AnimatedHeaderBackground';
import { MedivaLogo } from '../components/common/MedivaLogo';
import { StartIoBanner } from '../../modules/expo-startio';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const firstName = profile?.firstName || user?.firstName || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ REPORT: 0, LAB_TEST: 0, PRESCRIPTION: 0, IMAGING: 0 });
  const [loading, setLoading] = useState(true);
  const [showProModal, setShowProModal] = useState(false);
  const hasShownProModal = React.useRef(false);
  const isFocused = useIsFocused();

  const pulseScale = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedReferStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }]
  }));

  useEffect(() => {
    if (isFocused) {
      fetchRecentReports();
      fetchUserProfile();
      fetchStats();
    }
  }, [isFocused]);

  useEffect(() => {
    if (user && (!user.subscriptionTier || user.subscriptionTier === 'FREE')) {
      if (!hasShownProModal.current) {
        // slight delay so it feels natural after splash
        setTimeout(() => setShowProModal(true), 1000);
        hasShownProModal.current = true;
      }
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await getDashboardStats();
      if (res && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.log('Error fetching stats', err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await getProfile();
      setProfile(res.data);
    } catch (err) {
      console.log('Error fetching user profile', err);
    }
  };

  const fetchRecentReports = async () => {
    setLoading(true);
    try {
      const res = await getDocuments();
      const docs = res.data.content || [];
      setRecentReports(docs.slice(0, 3)); // Only take top 3
    } catch (err) {
      console.log('Error fetching recent reports', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.primaryLight, colors.background]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {/* Ad Banner Overlay (Sticky at top, but pushed down slightly to not overlap status bar) */}
        {(!user?.subscriptionTier || user?.subscriptionTier === 'FREE') && (
          <View style={styles.stickyAdContainer}>
            <StartIoBanner style={{ width: 320, height: 50, alignSelf: 'center' }} />
          </View>
        )}

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <Animated.View style={styles.header} entering={FadeInDown.duration(600).springify()}>
            <AnimatedHeaderBackground />
            <View style={styles.headerTextContainer}>
              <View style={styles.brandRow}>
                <MedivaLogo width={16} height={16} color={colors.primary} />
                <Text style={styles.brandTextSmall}>Mediva</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.greeting}>
                  Hello, {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
                </Text>
              </View>
              <Text style={styles.subtitle}>Your health records are safe here.</Text>
            </View>
            <TouchableOpacity
              style={styles.avatar}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ProfileTab')}
            >
              {profile?.profilePictureUrl ? (
                <Image source={{ uri: profile.profilePictureUrl }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <MaterialIcons name="person" size={28} color={colors.primary} />
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Analytics / Category Cards */}
          {/* Analytics / Category Cards */}
          <View style={styles.categoriesContainer}>
            <TouchableOpacity 
              style={[styles.categoryCard, { backgroundColor: '#F0F8F1' }]} 
              onPress={() => navigation.navigate('ReportsTab', { categoryFilter: 'REPORT' })}
              activeOpacity={0.8}
            >
              <View style={styles.categoryTextContainer}>
                <Text style={[styles.categoryLabel, { color: '#1B2A3B' }]} numberOfLines={1} adjustsFontSizeToFit>Reports</Text>
                <Text style={[styles.categoryCount, { color: '#1B2A3B' }]}>{stats.REPORT || 0}</Text>
              </View>
              <View style={[styles.categoryIconBg, { backgroundColor: '#E3F2E7' }]}>
                <FileText size={24} color="#0DAA61" strokeWidth={2} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.categoryCard, { backgroundColor: '#F4F0FB' }]} 
              onPress={() => navigation.navigate('ReportsTab', { categoryFilter: 'PRESCRIPTION' })}
              activeOpacity={0.8}
            >
              <View style={styles.categoryTextContainer}>
                <Text style={[styles.categoryLabel, { color: '#1B2A3B' }]} numberOfLines={1} adjustsFontSizeToFit>Prescriptions</Text>
                <Text style={[styles.categoryCount, { color: '#1B2A3B' }]}>{stats.PRESCRIPTION || 0}</Text>
              </View>
              <View style={[styles.categoryIconBg, { backgroundColor: '#EAE2F6' }]}>
                <Pill size={24} color="#8A4AF3" strokeWidth={2} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.categoryCard, { backgroundColor: '#FFF5EF' }]} 
              onPress={() => navigation.navigate('ReportsTab', { categoryFilter: 'LAB_TEST' })}
              activeOpacity={0.8}
            >
              <View style={styles.categoryTextContainer}>
                <Text style={[styles.categoryLabel, { color: '#1B2A3B' }]} numberOfLines={1} adjustsFontSizeToFit>Lab Tests</Text>
                <Text style={[styles.categoryCount, { color: '#1B2A3B' }]}>{stats.LAB_TEST || 0}</Text>
              </View>
              <View style={[styles.categoryIconBg, { backgroundColor: '#FDE8DA' }]}>
                <FlaskConical size={24} color="#F28E2B" strokeWidth={2} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.categoryCard, { backgroundColor: '#F0F6FF' }]} 
              onPress={() => navigation.navigate('ReportsTab', { categoryFilter: 'IMAGING' })}
              activeOpacity={0.8}
            >
              <View style={styles.categoryTextContainer}>
                <Text style={[styles.categoryLabel, { color: '#1B2A3B' }]} numberOfLines={1} adjustsFontSizeToFit>Imaging</Text>
                <Text style={[styles.categoryCount, { color: '#1B2A3B' }]}>{stats.IMAGING || 0}</Text>
              </View>
              <View style={[styles.categoryIconBg, { backgroundColor: '#E2EEFE' }]}>
                <ImageIcon size={24} color="#257BFA" strokeWidth={2} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Recent Records Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Records</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ReportsTab')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentList}>
            {loading ? (
              <View style={{ gap: 12 }}>
                <SkeletonLoader height={100} />
                <SkeletonLoader height={100} />
                <SkeletonLoader height={100} />
              </View>
            ) : recentReports.length === 0 ? (
              <EmptyState
                title="No Recent Reports"
                description="You haven't uploaded any medical reports recently."
                icon={FileSearch}
                actionLabel="Upload Report"
                onAction={() => navigation.navigate('AddReport')}
              />
            ) : (
              recentReports.map(report => (
                <DocumentCard
                  key={report.id}
                  filename={report.originalFilename}
                  title={report.title}
                  tags={report.tags}
                  date={report.extractedEventDate || report.uploadDate?.split('T')[0]}
                  providerName={report.providerName || (report.tags && report.tags.length > 0 ? report.tags[0] : undefined)}
                  category={report.category}
                  fileType={report.fileType}
                  onPress={() => navigation.navigate('ReportDetail', { id: report.id })}
                />
              ))
            )}
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* Pro Upgrade App-Open Modal */}
      <Modal
        visible={showProModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.modalContent} entering={FadeInDown}>
            <LinearGradient colors={['#08A8C6', '#068A9F']} style={styles.modalHeader}>
              <MaterialIcons name="star" size={48} color="#FFF" />
              <Text style={styles.modalTitle}>Upgrade to Mediva Pro</Text>
            </LinearGradient>
            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Unlock unlimited document uploads, advanced AI categorization, and detailed health analytics with a Pro subscription.
              </Text>
              <AnimatedButton
                title="View Plans"
                onPress={() => {
                  setShowProModal(false);
                  navigation.navigate('Subscription');
                }}
                style={{ marginTop: 24 }}
              />
              <TouchableOpacity onPress={() => setShowProModal(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.marginMobile,
    paddingBottom: 120, // Increased to account for the floating bottom tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: colors.primary + '15',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  brandTextSmall: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  greeting: {
    ...typography.headlineMd,
    fontSize: 22,
    color: colors['on-background'],
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.bodyMd,
    fontSize: 13,
    color: colors['on-surface-variant'],
    marginTop: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    ...typography.labelLg,
    color: colors['on-primary'],
    marginLeft: 8,
  },
  stickyAdContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    zIndex: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  gridItem: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors['surface-variant'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  gridItemText: {
    ...typography.labelLg,
    color: colors['on-surface'],
    textAlign: 'center',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.headlineSm,
    color: colors['on-background'],
    fontWeight: '700',
  },
  seeAllText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '600',
  },
  recentList: {
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: colors['on-surface-variant'],
    ...typography.bodyMd,
    marginTop: 10,
  },
  greetingCard: {
    margin: 16,
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  greetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  profileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  profileIconImage: {
    width: '100%',
    height: '100%',
  },
  greetingBgIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    transform: [{ rotate: '-15deg' }],
  },
  greetingBgIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    transform: [{ rotate: '-15deg' }],
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 32,
  },
  categoryCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 18,
    borderRadius: 16,
  },
  categoryIconBg: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 22,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    width: '100%',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    ...typography.headlineMd,
    color: '#FFF',
    fontWeight: '800',
    marginTop: 16,
    textAlign: 'center',
  },
  modalBody: {
    padding: 24,
  },
  modalDescription: {
    ...typography.bodyLg,
    color: colors['on-surface-variant'],
    textAlign: 'center',
    lineHeight: 24,
  },
  modalCloseBtn: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCloseText: {
    ...typography.labelLg,
    color: colors['on-surface-variant'],
  }
});
