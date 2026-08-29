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
import { getDocuments, getProfile } from '../services/api';
import { useIsFocused } from '@react-navigation/native';
import { DocumentCard } from '../components/DocumentCard';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { LinearGradient } from 'expo-linear-gradient';
import EmptyState from '../components/EmptyState';
import { FileSearch } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchRecentReports();
      fetchUserProfile();
    }
  }, [isFocused]);

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
        
        {/* Sticky Ad Banner at the Top */}
        <View style={styles.stickyAdContainer}>
          <StartIoBanner style={{ width: 320, height: 50, alignSelf: 'center' }} />
        </View>

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
                <Text style={styles.greeting}>Hello, {firstName}</Text>
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

          {/* Primary Action Button */}
          <AnimatedButton
            title="Add Medical Report"
            onPress={() => navigation.navigate('AddReport')}
            style={styles.primaryButton}
          />



          {/* Quick Actions Grid */}
          <View style={styles.grid}>
            {/* Take Photo */}
            <TouchableOpacity style={styles.gridItem} activeOpacity={0.8} onPress={() => navigation.navigate('AddReport')}>
              <MaterialIcons name="photo-camera" size={36} color={colors.primary} style={{ marginBottom: 12 }} />
              <Text style={styles.gridItemText}>Take Photo</Text>
            </TouchableOpacity>

            {/* Choose Report */}
            <TouchableOpacity style={styles.gridItem} activeOpacity={0.8} onPress={() => navigation.navigate('AddReport')}>
              <MaterialIcons name="folder" size={36} color={colors.primary} style={{ marginBottom: 12 }} />
              <Text style={styles.gridItemText}>Choose Report</Text>
            </TouchableOpacity>

            {/* Ask About Reports */}
            <TouchableOpacity style={styles.gridItem} activeOpacity={0.8} onPress={() => navigation.navigate('AskTab')}>
              <MaterialIcons name="chat-bubble-outline" size={36} color={colors.primary} style={{ marginBottom: 12 }} />
              <Text style={styles.gridItemText}>Ask About Reports</Text>
            </TouchableOpacity>

            {/* View Health */}
            <TouchableOpacity style={styles.gridItem} activeOpacity={0.8} onPress={() => navigation.navigate('HealthTab')}>
              <MaterialIcons name="monitor-heart" size={36} color={colors.primary} style={{ marginBottom: 12 }} />
              <Text style={styles.gridItemText}>View Health</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Reports Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ReportsTab')}>
              <Text style={styles.seeAllText}>See All</Text>
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
                  category={report.category}
                  fileType={report.fileType}
                  onPress={() => navigation.navigate('ReportDetail', { id: report.id })}
                />
              ))
            )}
          </View>

        </ScrollView>
      </SafeAreaView>
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
    marginBottom: 24,
    padding: 16,
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
    marginBottom: 6,
    backgroundColor: colors.primary + '15',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    color: colors['on-background'],
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors['on-surface-variant'],
    marginTop: 4,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
  }
});
