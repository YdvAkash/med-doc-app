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
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>Hello, {firstName}</Text>
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
              <MaterialIcons name="person" size={28} color={colors.surface} />
            )}
          </TouchableOpacity>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity 
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AddReport')}
        >
          <MaterialIcons name="add" size={20} color={colors['on-primary']} />
          <Text style={styles.primaryButtonText}>Add Medical Report</Text>
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <View style={styles.grid}>
          {/* Take Photo */}
          <TouchableOpacity style={styles.gridItem} activeOpacity={0.8} onPress={() => navigation.navigate('AddReport')}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="photo-camera" size={28} color={colors.primary} />
            </View>
            <Text style={styles.gridItemText}>Take Photo</Text>
          </TouchableOpacity>

          {/* Choose Report */}
          <TouchableOpacity style={styles.gridItem} activeOpacity={0.8} onPress={() => navigation.navigate('AddReport')}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="folder" size={28} color={colors.primary} />
            </View>
            <Text style={styles.gridItemText}>Choose Report</Text>
          </TouchableOpacity>

          {/* Ask About Reports */}
          <TouchableOpacity style={styles.gridItem} activeOpacity={0.8} onPress={() => navigation.navigate('AskTab')}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="chat-bubble-outline" size={28} color={colors.primary} />
            </View>
            <Text style={styles.gridItemText}>Ask About Reports</Text>
          </TouchableOpacity>

          {/* View Health */}
          <TouchableOpacity style={styles.gridItem} activeOpacity={0.8} onPress={() => navigation.navigate('HealthTab')}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="monitor-heart" size={28} color={colors.primary} />
            </View>
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
            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
          ) : recentReports.length === 0 ? (
            <Text style={styles.emptyText}>No recent reports found.</Text>
          ) : (
            recentReports.map(report => (
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
    padding: spacing.marginMobile,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  greeting: {
    ...typography.headlineMd,
    color: colors['on-background'],
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors['on-surface-variant'],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
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
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors['secondary-container'],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridItemText: {
    ...typography.labelMd,
    color: colors['on-surface'],
    textAlign: 'center',
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
