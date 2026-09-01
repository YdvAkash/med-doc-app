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
  TextInput,
  Image,
  Alert,
  Switch,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/useAuth';
import { getProfile, updateProfile, uploadProfilePicture } from '../services/api';
import { colors, typography } from '../theme';
import { scheduleDailyReminder, cancelAllReminders } from '../services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StartIoAds } from '../services/ads/StartIoAds';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, fetchProfile: updateStoreProfile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bloodGroup: '',
    dateOfBirth: '',
    profilePictureUrl: '',
  });

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);

  useEffect(() => {
    fetchProfile();
    checkReminderStatus();
  }, []);

  const checkReminderStatus = async () => {
    try {
      const storedStatus = await AsyncStorage.getItem('@daily_reminder');
      if (storedStatus === 'true') {
        setIsReminderEnabled(true);
      }
    } catch (e) {
      console.log('Error reading reminder status');
    }
  };

  const toggleReminder = async (value: boolean) => {
    setIsReminderEnabled(value);
    try {
      await AsyncStorage.setItem('@daily_reminder', value ? 'true' : 'false');
      if (value) {
        const success = await scheduleDailyReminder(20, 0); // 8:00 PM
        if (success) {
          Alert.alert('Reminder Set!', 'You will be notified daily at 8:00 PM.');
        } else {
          setIsReminderEnabled(false);
          await AsyncStorage.setItem('@daily_reminder', 'false');
          Alert.alert('Permission Denied', 'Please enable notifications for this app.');
        }
      } else {
        await cancelAllReminders();
      }
    } catch (e) {
      console.log('Error toggling reminder', e);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      setProfile(res.data);
      setFormData({
        firstName: res.data.firstName || '',
        lastName: res.data.lastName || '',
        email: res.data.email || '',
        phone: res.data.emergencyContactPhone || res.data.phone || '',
        bloodGroup: res.data.bloodGroup || '',
        dateOfBirth: res.data.dateOfBirth || '',
        profilePictureUrl: res.data.profilePictureUrl || '',
      });
      updateStoreProfile(); // Keep global store in sync
    } catch (err) {
      console.log('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(formData);
      await fetchProfile();
      setIsEditing(false);
      StartIoAds.showInterstitialSafely();
    } catch (err) {
      console.log('Update error:', err);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLoading(true);
        const asset = result.assets[0];
        const filename = asset.uri.split('/').pop() || 'profile.jpg';
        const uploadRes = await uploadProfilePicture(asset.uri, 'image/jpeg', filename);
        if (uploadRes.data?.profilePictureUrl) {
          const newUrl = uploadRes.data.profilePictureUrl;
          setFormData(prev => ({ ...prev, profilePictureUrl: newUrl }));
          await fetchProfile();
        }
      }
    } catch (error) {
      console.error('Image pick error', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const initials = ((profile?.firstName?.[0] || '') + (profile?.lastName?.[0] || '')).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || 'U';
  const isPro = profile?.subscriptionTier === 'PRO';
  const tierColor = isPro ? '#F59E0B' : (profile?.subscriptionTier === 'BASIC' ? '#3B82F6' : '#64748B');

  const renderField = (icon: any, label: string, key: keyof typeof formData, editable: boolean = true) => (
    <View style={styles.settingRow}>
      <View style={styles.settingIconWrapper}>
        <MaterialIcons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={[styles.settingContent, isEditing && editable && styles.editingBorder]}>
        <Text style={styles.settingLabel}>{label}</Text>
        {isEditing && editable ? (
          key === 'dateOfBirth' ? (
            <TouchableOpacity activeOpacity={0.8} onPress={() => setDatePickerVisibility(true)}>
              <Text style={[styles.settingValue, { color: formData[key] ? colors['on-surface'] : colors.outline }]}>
                {formData[key] || 'Select Date'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TextInput
              style={styles.settingInput}
              value={formData[key]}
              onChangeText={(text) => setFormData({ ...formData, [key]: text })}
              placeholderTextColor={colors.outline}
              placeholder={`Enter ${label}`}
              keyboardType={key === 'email' ? 'email-address' : key === 'phone' ? 'phone-pad' : 'default'}
              autoCapitalize={key === 'email' ? 'none' : 'words'}
            />
          )
        ) : (
          <Text style={styles.settingValue}>{formData[key] || 'Not provided'}</Text>
        )}
      </View>
      {!isEditing && <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />}
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* PREMIUM HEADER BACKGROUND */}
        <LinearGradient colors={[colors.primary, '#0284C7']} style={styles.headerBackground}>
          <SafeAreaView edges={['top']}>
            <View style={styles.appBar}>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.appBarTitle}>Profile</Text>
              <View style={{ width: 48 }} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.mainContent}>
          {/* AVATAR OVERLAPPING HEADER */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              {profile?.profilePictureUrl || formData.profilePictureUrl ? (
                <Image source={{ uri: formData.profilePictureUrl || profile.profilePictureUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
              {isEditing && (
                <TouchableOpacity style={styles.editAvatarBadge} onPress={handlePickImage} activeOpacity={0.9}>
                  <MaterialIcons name="camera-alt" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.userName}>
              {`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'User'}
            </Text>
            
            {/* SUBSCRIPTION BADGE */}
            <TouchableOpacity 
              style={[styles.tierBadge, { backgroundColor: tierColor + '15', borderColor: tierColor }]}
              onPress={() => !isPro && navigation.navigate('Subscription')}
              activeOpacity={isPro ? 1 : 0.7}
            >
              <MaterialIcons name={isPro ? "workspace-premium" : "star"} size={16} color={tierColor} />
              <Text style={[styles.tierBadgeText, { color: tierColor }]}>{profile?.subscriptionTier || 'FREE'} PLAN</Text>
              {!isPro && <MaterialIcons name="arrow-forward" size={14} color={tierColor} style={{ marginLeft: 4 }} />}
            </TouchableOpacity>
          </Animated.View>

          {/* USAGE STATS ROW */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#EEF2FF' }]}>
                <MaterialIcons name="upload-file" size={22} color="#4F46E5" />
              </View>
              <Text style={styles.statValue}>{profile?.reportsUploadedThisWeek || 0}</Text>
              <Text style={styles.statLabel}>Reports (This Week)</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#ECFDF5' }]}>
                <MaterialIcons name="forum" size={22} color="#10B981" />
              </View>
              <Text style={styles.statValue}>{profile?.chatsThisWeek || 0}</Text>
              <Text style={styles.statLabel}>Chats (This Week)</Text>
            </View>
          </Animated.View>

          {/* EDIT BUTTON */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            {!isEditing ? (
              <TouchableOpacity style={styles.editProfileBtn} onPress={() => setIsEditing(true)}>
                <MaterialIcons name="edit" size={18} color="#FFFFFF" />
                <Text style={styles.editProfileBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActionsRow}>
                <TouchableOpacity style={[styles.editProfileBtn, styles.cancelBtn]} onPress={() => setIsEditing(false)}>
                  <Text style={[styles.editProfileBtnText, { color: '#64748B' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.editProfileBtn, styles.saveBtn]} onPress={handleSave} disabled={saving}>
                  {saving ? <ActivityIndicator size="small" color="#FFF" /> : (
                    <>
                      <MaterialIcons name="check" size={18} color="#FFFFFF" />
                      <Text style={styles.editProfileBtnText}>Save Changes</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* SETTINGS CARDS */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            
            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.sectionGroup}>
              <Text style={styles.sectionHeader}>PERSONAL INFORMATION</Text>
              <View style={styles.card}>
                {renderField('person', 'First Name', 'firstName')}
                <View style={styles.divider} />
                {renderField('person-outline', 'Last Name', 'lastName')}
                <View style={styles.divider} />
                {renderField('email', 'Email Address', 'email', false)}
                <View style={styles.divider} />
                {renderField('phone', 'Phone Number', 'phone')}
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.sectionGroup}>
              <Text style={styles.sectionHeader}>MEDICAL DETAILS</Text>
              <View style={styles.card}>
                {renderField('bloodtype', 'Blood Group', 'bloodGroup')}
                <View style={styles.divider} />
                {renderField('cake', 'Date of Birth', 'dateOfBirth')}
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.sectionGroup}>
              <Text style={styles.sectionHeader}>REWARDS</Text>
              <View style={styles.card}>
                <TouchableOpacity 
                  style={[styles.settingRow, { paddingVertical: 16 }]} 
                  onPress={() => navigation.navigate('Referral')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.settingIconWrapper, { backgroundColor: '#FEF3C7' }]}>
                    <MaterialIcons name="card-giftcard" size={20} color="#D97706" />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={[styles.settingLabel, { color: '#0F172A', fontWeight: '600' }]}>Refer & Earn</Text>
                    <Text style={[styles.settingValue, { fontSize: 13, color: '#D97706', marginTop: 2 }]}>
                      Earn credits by inviting friends
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />
                </TouchableOpacity>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.sectionGroup}>
              <Text style={styles.sectionHeader}>PREFERENCES</Text>
              <View style={styles.card}>
                <View style={[styles.settingRow, { paddingVertical: 12 }]}>
                  <View style={[styles.settingIconWrapper, { backgroundColor: '#F0F9FF' }]}>
                    <MaterialIcons name="notifications-active" size={20} color="#0284C7" />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingLabel}>Daily Health Reminder</Text>
                    <Text style={[styles.settingValue, { fontSize: 13, color: '#64748B', marginTop: 2 }]}>
                      Get notified daily at 8 PM
                    </Text>
                  </View>
                  <Switch
                    trackColor={{ false: '#E2E8F0', true: colors.primary }}
                    thumbColor={'#FFFFFF'}
                    onValueChange={toggleReminder}
                    value={isReminderEnabled}
                  />
                </View>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.sectionGroup}>
              <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
                <MaterialIcons name="logout" size={20} color="#EF4444" />
                <Text style={styles.logoutBtnText}>Sign Out</Text>
              </TouchableOpacity>
            </Animated.View>

          </KeyboardAvoidingView>

        </View>
      </ScrollView>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date()}
        onConfirm={(date) => {
          setDatePickerVisibility(false);
          const formatted = date.toISOString().split('T')[0];
          setFormData({ ...formData, dateOfBirth: formatted });
        }}
        onCancel={() => setDatePickerVisibility(false)}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerBackground: {
    height: 180,
    width: '100%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  appBarTitle: {
    ...typography.headlineSm,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    paddingHorizontal: 20,
    marginTop: -70, // Overlap the header
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarFallback: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  userName: {
    ...typography.headlineMd,
    color: '#0F172A',
    fontWeight: '800',
    marginBottom: 6,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  editProfileBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  editActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
  },
  sectionGroup: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginLeft: 16,
    marginBottom: 8,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
    justifyContent: 'center',
  },
  editingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingBottom: 2,
  },
  settingLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  settingInput: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
    padding: 0,
    margin: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 48,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
});
