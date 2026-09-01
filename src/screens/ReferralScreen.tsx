import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { colors, typography } from '../theme';
import { useAuthStore } from '../store/useAuth';
import { getReferralStats, getReferralHistory } from '../services/api';
import { AnimatedAuthHeading } from '../components/common/AnimatedAuthHeading';

export const ReferralScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReferralData = async () => {
    try {
      const statsRes = await getReferralStats();
      const historyRes = await getReferralHistory(0, 20);
      
      // If the backend wraps responses in { data: ... }, use statsRes.data, otherwise use statsRes directly
      setStats(statsRes.data ? statsRes.data : statsRes);
      
      // Page response has 'content' array
      const historyData = historyRes.data ? historyRes.data : historyRes;
      setHistory(historyData.content || []);
    } catch (err) {
      console.error('Failed to fetch referrals', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReferralData();
  };

  const handleCopyCode = async () => {
    if (stats?.referralCode) {
      await Clipboard.setStringAsync(stats.referralCode);
      Toast.show({ type: 'success', text1: 'Code copied!' });
    }
  };

  const handleCopyLink = async () => {
    if (stats?.referralLink) {
      await Clipboard.setStringAsync(stats.referralLink);
      Toast.show({ type: 'success', text1: 'Link copied!' });
    }
  };

  const handleShare = async () => {
    if (!stats) return;
    try {
      const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'a friend';
      await Share.share({
        message: `Hey! 👋\n\nThis is ${userName}, and I highly recommend using Mediva! It's an amazing AI-powered app that helps you organize, store, and understand your medical documents instantly.\n\n🎁 Join using my referral link below and get started:\n${stats.referralLink}\n\nOr, you can sign up and enter my referral code manually: ${stats.referralCode}\n\n🚀 Let's take control of our health with Mediva!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors['on-surface']} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <AnimatedAuthHeading
          title="Invite Friends 🎁"
          subtitle="When your friend joins using your referral link, uploads 2 documents and completes 5 AI chats, you earn 50 referral credits."
        />

        <View style={styles.shareCard}>
          <Text style={styles.cardTitle}>Your Referral Code</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{stats?.referralCode || '...'}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode} activeOpacity={0.7}>
              <MaterialIcons name="content-copy" size={18} color={colors.primary} />
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.cardTitle, { marginTop: 16 }]}>Your Referral Link</Text>
          <View style={styles.codeRow}>
            <Text style={styles.linkText} numberOfLines={1}>{stats?.referralLink || '...'}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyLink} activeOpacity={0.7}>
              <MaterialIcons name="content-copy" size={18} color={colors.primary} />
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <MaterialIcons name="share" size={20} color={colors['on-primary']} />
            <Text style={styles.shareButtonText}>Share with Friends</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>{stats?.totalReferrals || 0}</Text>
            <Text style={styles.statLabel}>Friends Referred</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🎁</Text>
            <Text style={styles.statValue}>{stats?.totalCreditsEarned || 0}</Text>
            <Text style={styles.statLabel}>Credits Earned</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statValue}>{stats?.successfulReferrals || 0}</Text>
            <Text style={styles.statLabel}>Successful</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>⏳</Text>
            <Text style={styles.statValue}>{stats?.pendingReferrals || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Referral History</Text>
        
        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="group-add" size={48} color={colors['outline-variant']} />
            <Text style={styles.emptyText}>You haven't referred anyone yet.</Text>
          </View>
        ) : (
          history.map((item, index) => (
            <View key={index} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyName}>{item.referredUserName}</Text>
                {item.status === 'REWARDED' ? (
                  <Text style={styles.historyStatusSuccess}>✅ Completed</Text>
                ) : (
                  <Text style={styles.historyStatusPending}>⏳ Pending</Text>
                )}
              </View>

              {item.status === 'REWARDED' ? (
                <View style={styles.rewardContainer}>
                  <Text style={styles.rewardText}>Reward earned: +50 credits</Text>
                </View>
              ) : (
                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>Documents</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${Math.min(item.documentsCompleted / 2 * 100, 100)}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{Math.min(item.documentsCompleted, 2)}/2</Text>

                  <Text style={[styles.progressLabel, { marginTop: 12 }]}>AI Chats</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${Math.min(item.chatsCompleted / 5 * 100, 100)}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{Math.min(item.chatsCompleted, 5)}/5</Text>
                  
                  <Text style={styles.almostThereText}>⏳ Almost there!</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    ...typography.titleLg,
    color: colors['on-surface'],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors['outline-variant'],
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  shareCard: {
    backgroundColor: colors['surface-variant'],
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
  },
  cardTitle: {
    ...typography.labelLg,
    color: colors['on-surface-variant'],
    marginBottom: 8,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
  },
  codeText: {
    ...typography.titleLg,
    color: colors.primary,
    letterSpacing: 2,
  },
  linkText: {
    ...typography.bodyMd,
    color: colors['on-surface'],
    flex: 1,
    marginRight: 8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  copyButtonText: {
    ...typography.labelMd,
    color: colors.primary,
    marginLeft: 6,
    fontWeight: '600',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
  },
  shareButtonText: {
    ...typography.labelLg,
    color: colors['on-primary'],
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    ...typography.titleLg,
    color: colors['on-surface'],
  },
  statLabel: {
    ...typography.bodySm,
    color: colors['on-surface-variant'],
    marginTop: 4,
  },
  sectionTitle: {
    ...typography.titleMd,
    color: colors['on-surface'],
    marginTop: 32,
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    ...typography.bodyLg,
    color: colors['on-surface-variant'],
    marginTop: 16,
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyName: {
    ...typography.titleMd,
    color: colors['on-surface'],
  },
  historyStatusSuccess: {
    ...typography.labelMd,
    color: '#4CAF50',
  },
  historyStatusPending: {
    ...typography.labelMd,
    color: '#FF9800',
  },
  rewardContainer: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  rewardText: {
    ...typography.labelMd,
    color: '#2E7D32',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    ...typography.labelSm,
    color: colors['on-surface-variant'],
    marginBottom: 4,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors['surface-variant'],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    ...typography.bodySm,
    color: colors['on-surface-variant'],
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  almostThereText: {
    ...typography.labelMd,
    color: '#FF9800',
    marginTop: 12,
    textAlign: 'center',
  }
});
