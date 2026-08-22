import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  useRef,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthService } from '../services/auth';
import { CustomInput } from '../components/CustomInput';
import { useAuthStore } from '../store/useAuth';
import { User, Activity, AlertCircle, Phone, Calendar, Edit2, Save, ChevronLeft } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

type SectionProps = {
  title: string;
  emoji: string;
  children: React.ReactNode;
  color: string[];
};

const Section: React.FC<SectionProps> = ({ title, emoji, children, color }) => (
  <View style={sectionStyles.container}>
    <View style={sectionStyles.header}>
      <LinearGradient colors={color as any} style={sectionStyles.dot} />
      <Text style={sectionStyles.emoji}>{emoji}</Text>
      <Text style={sectionStyles.title}>{title}</Text>
    </View>
    <View style={sectionStyles.body}>{children}</View>
  </View>
);

const sectionStyles = StyleSheet.create({
  container: { marginBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  dot: { width: 4, height: 20, borderRadius: 2 },
  emoji: { fontSize: 18 },
  title: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  body: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
});

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    bloodGroup: '',
    allergies: '',
    chronicConditions: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    dateOfBirth: '',
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await AuthService.getProfile();
      if (res.data) {
        setProfileData({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          bloodGroup: res.data.bloodGroup || '',
          allergies: res.data.allergies || '',
          chronicConditions: res.data.chronicConditions || '',
          emergencyContactName: res.data.emergencyContactName || '',
          emergencyContactPhone: res.data.emergencyContactPhone || '',
          dateOfBirth: res.data.dateOfBirth || '',
        });
      }
    } catch (err: any) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await AuthService.updateProfile(profileData);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setIsEditing(false);
      // Update global name
      const token = useAuthStore.getState().token;
      if (token) {
        useAuthStore.getState().login(
          { email: user?.email || '', name: `${profileData.firstName} ${profileData.lastName}`.trim() },
          token
        );
      }
    } catch (err: any) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setProfileData(prev => ({ ...prev, [key]: value }));
  };

  const initials = (`${profileData.firstName} ${profileData.lastName}`.trim() || user?.email || 'U').slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0099FF" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0A0F', '#0D1B2A', '#0A0A0F']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.orb1} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <ChevronLeft color="#4488BB" size={24} />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)} style={styles.editBtn}>
                <LinearGradient
                  colors={isEditing ? ['#059669', '#10B981'] : ['#0066FF', '#00A3FF']}
                  style={styles.editBtnGrad}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  {isEditing ? <Save color="#fff" size={16} /> : <Edit2 color="#fff" size={16} />}
                  <Text style={styles.editBtnText}>{saving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Profile Hero */}
            <View style={styles.heroSection}>
              <View style={styles.avatarShadow}>
                <LinearGradient colors={['#0066FF', '#00A3FF']} style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </LinearGradient>
              </View>
              <Text style={styles.heroName}>{profileData.firstName || 'Your'} {profileData.lastName || 'Profile'}</Text>
              <Text style={styles.heroEmail}>{user?.email}</Text>
              {profileData.bloodGroup ? (
                <View style={styles.bloodBadge}>
                  <Text style={styles.bloodBadgeText}>🩸 {profileData.bloodGroup}</Text>
                </View>
              ) : null}
            </View>

            {/* Feedback banners */}
            {error ? <View style={styles.errorBanner}><Text style={styles.errorText}>⚠ {error}</Text></View> : null}
            {success ? <View style={styles.successBanner}><Text style={styles.successText}>✓ {success}</Text></View> : null}

            {/* Sections */}
            <Section title="Personal Info" emoji="👤" color={['#0066FF', '#00A3FF']}>
              <CustomInput label="First Name" value={profileData.firstName} onChangeText={v => handleChange('firstName', v)} editable={isEditing} icon={<User color="#4488BB" size={18} />} />
              <CustomInput label="Last Name" value={profileData.lastName} onChangeText={v => handleChange('lastName', v)} editable={isEditing} icon={<User color="#4488BB" size={18} />} />
              <CustomInput label="Date of Birth" placeholder="YYYY-MM-DD" value={profileData.dateOfBirth} onChangeText={v => handleChange('dateOfBirth', v)} editable={isEditing} icon={<Calendar color="#4488BB" size={18} />} />
            </Section>

            <Section title="Medical Details" emoji="🏥" color={['#7C3AED', '#A855F7']}>
              <CustomInput label="Blood Group" placeholder="e.g. A+" value={profileData.bloodGroup} onChangeText={v => handleChange('bloodGroup', v)} editable={isEditing} icon={<Activity color="#9966DD" size={18} />} />
              <CustomInput label="Allergies" placeholder="e.g. Penicillin, Peanuts" value={profileData.allergies} onChangeText={v => handleChange('allergies', v)} editable={isEditing} icon={<AlertCircle color="#9966DD" size={18} />} />
              <CustomInput label="Chronic Conditions" placeholder="e.g. Diabetes, Hypertension" value={profileData.chronicConditions} onChangeText={v => handleChange('chronicConditions', v)} editable={isEditing} icon={<Activity color="#9966DD" size={18} />} />
            </Section>

            <Section title="Emergency Contact" emoji="🆘" color={['#DC2626', '#F87171']}>
              <CustomInput label="Contact Name" placeholder="Contact person's name" value={profileData.emergencyContactName} onChangeText={v => handleChange('emergencyContactName', v)} editable={isEditing} icon={<User color="#CC4444" size={18} />} />
              <CustomInput label="Contact Phone" placeholder="+91 XXXXX XXXXX" value={profileData.emergencyContactPhone} onChangeText={v => handleChange('emergencyContactPhone', v)} editable={isEditing} icon={<Phone color="#CC4444" size={18} />} />
            </Section>

            {isEditing && (
              <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn} activeOpacity={0.85}>
                <LinearGradient colors={['#059669', '#10B981']} style={styles.saveBtnGrad}>
                  <Save color="#fff" size={20} />
                  <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save All Changes'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0F' },
  centerContainer: { flex: 1, backgroundColor: '#0A0A0F', justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: '#667788', fontSize: 15 },
  orb1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(0,102,255,0.1)', top: -60, right: -80 },
  content: { paddingHorizontal: 24, paddingBottom: 60 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, marginBottom: 28 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { color: '#4488BB', fontSize: 16, fontWeight: '600' },
  editBtn: { borderRadius: 12, overflow: 'hidden', shadowColor: '#0066FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  editBtnGrad: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 18 },
  editBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  heroSection: { alignItems: 'center', marginBottom: 36 },
  avatarShadow: { shadowColor: '#0066FF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 16, marginBottom: 16 },
  avatar: { width: 90, height: 90, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  heroName: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  heroEmail: { color: '#667788', fontSize: 14, marginBottom: 14 },
  bloodBadge: { backgroundColor: 'rgba(220,38,38,0.15)', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)' },
  bloodBadgeText: { color: '#F87171', fontSize: 14, fontWeight: '700' },
  errorBanner: { backgroundColor: 'rgba(255,59,48,0.12)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)', borderRadius: 14, padding: 14, marginBottom: 20 },
  errorText: { color: '#FF6B6B', fontSize: 14, fontWeight: '600' },
  successBanner: { backgroundColor: 'rgba(52,199,89,0.12)', borderWidth: 1, borderColor: 'rgba(52,199,89,0.3)', borderRadius: 14, padding: 14, marginBottom: 20 },
  successText: { color: '#4CD964', fontSize: 14, fontWeight: '600' },
  saveBtn: { borderRadius: 18, overflow: 'hidden', marginTop: 12, shadowColor: '#059669', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  saveBtnGrad: { height: 60, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
