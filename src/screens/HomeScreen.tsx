import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const FeatureCard = ({
  icon, title, desc, color, onPress, active = false,
}: { icon: string; title: string; desc: string; color: string[]; onPress?: () => void; active?: boolean }) => (
  <TouchableOpacity style={styles.featureCard} onPress={onPress} activeOpacity={0.85} disabled={!onPress}>
    <LinearGradient colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.01)']} style={styles.featureCardInner}>
      <View style={[styles.featureIcon, { borderColor: color[0] + '44' }]}>
        <LinearGradient colors={color as any} style={styles.featureIconGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.featureIconText}>{icon}</Text>
        </LinearGradient>
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
      {active ? (
        <View style={[styles.featureSoon, { backgroundColor: 'rgba(0,102,255,0.2)', borderColor: 'rgba(0,163,255,0.5)' }]}>
          <Text style={[styles.featureSoonText, { color: '#60AFFF' }]}>TAP TO OPEN</Text>
        </View>
      ) : (
        <View style={styles.featureSoon}>
          <Text style={styles.featureSoonText}>SOON</Text>
        </View>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const initials = (user?.name || user?.email || 'U').slice(0, 2).toUpperCase();
  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0A0F', '#0D1B2A', '#0A0A0F']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good day,</Text>
              <Text style={styles.name}>{firstName} 👋</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.avatarWrapper}
            >
              <LinearGradient colors={['#0066FF', '#00A3FF']} style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Status Card */}
          <LinearGradient
            colors={['rgba(0,102,255,0.18)', 'rgba(0,163,255,0.08)']}
            style={styles.statusCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statusLeft}>
              <View style={styles.statusDot} />
              <View>
                <Text style={styles.statusTitle}>System Active</Text>
                <Text style={styles.statusSub}>All services running</Text>
              </View>
            </View>
            <Text style={styles.statusEmoji}>🟢</Text>
          </LinearGradient>

          {/* Quick Stats Row */}
          <View style={styles.statsRow}>
            {[
              { label: 'Documents', value: '—', icon: '📄' },
              { label: 'Records', value: '—', icon: '📊' },
              { label: 'Alerts', value: '0', icon: '🔔' },
            ].map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Features */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Coming Soon</Text>
            <Text style={styles.sectionSub}>Powerful health tools</Text>
          </View>

          <View style={styles.featureGrid}>
            <FeatureCard icon="📄" title="Documents" desc="Upload & manage" color={['#0066FF', '#00A3FF']} onPress={() => navigation.navigate('Documents')} active />
            <FeatureCard icon="📅" title="Timeline" desc="Medical history" color={['#7C3AED', '#A855F7']} />
            <FeatureCard icon="🤖" title="AI Analysis" desc="Smart insights" color={['#059669', '#10B981']} />
            <FeatureCard icon="📈" title="Trends" desc="Health metrics" color={['#DC2626', '#F87171']} />
          </View>

          {/* Sign Out */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.8}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0F' },
  orb1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(0,102,255,0.1)', top: -80, right: -80 },
  orb2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(0,207,255,0.06)', bottom: 100, left: -60 },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  greeting: { fontSize: 15, color: '#667788', fontWeight: '500' },
  name: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', marginTop: 2 },
  avatarWrapper: { shadowColor: '#0066FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 10 },
  avatar: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  statusCard: { borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,163,255,0.2)' },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C759' },
  statusTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  statusSub: { color: '#667788', fontSize: 13, marginTop: 2 },
  statusEmoji: { fontSize: 22 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  statIcon: { fontSize: 22, marginBottom: 8 },
  statValue: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: '#667788', fontSize: 12, fontWeight: '600' },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  sectionSub: { color: '#667788', fontSize: 13, marginTop: 2 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 40 },
  featureCard: { width: (width - 62) / 2, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  featureCardInner: { padding: 20 },
  featureIcon: { width: 52, height: 52, borderRadius: 16, marginBottom: 14, borderWidth: 1 },
  featureIconGradient: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  featureIconText: { fontSize: 22 },
  featureTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  featureDesc: { color: '#667788', fontSize: 12, marginBottom: 14 },
  featureSoon: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,102,255,0.15)', borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8, borderWidth: 1, borderColor: 'rgba(0,163,255,0.3)' },
  featureSoonText: { color: '#4499FF', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  logoutBtn: { borderRadius: 18, height: 56, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,59,48,0.3)', backgroundColor: 'rgba(255,59,48,0.06)' },
  logoutText: { color: '#FF6B6B', fontSize: 16, fontWeight: '700' },
});
