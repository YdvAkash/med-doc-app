import React, { useState, useEffect, useRef } from 'react';
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
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuth';
import { getProfile, updateProfile } from '../services/api';
import { colors, typography, spacing } from '../theme';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, token, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: '',
    dateOfBirth: '',
  });

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      setProfile(res.data);
      setFormData({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        bloodGroup: res.data.bloodGroup || '',
        dateOfBirth: res.data.dateOfBirth || '',
      });
    } catch (err) {
      console.log('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      await fetchProfile();
      setIsEditing(false);
    } catch (err) {
      console.log('Update error:', err);
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

  const initials = (profile?.name || user?.email || 'U').slice(0, 2).toUpperCase();

  const renderField = (icon: any, label: string, key: keyof typeof formData, editable: boolean = true) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldIconWrapper}>
        <MaterialIcons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {isEditing && editable ? (
          <TextInput
            style={styles.fieldInput}
            value={formData[key]}
            onChangeText={(text) => setFormData({ ...formData, [key]: text })}
            placeholderTextColor={colors.outline}
            placeholder={`Enter ${label}`}
          />
        ) : (
          <Text style={styles.fieldValue}>{formData[key] || 'Not provided'}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.appBar}>
          <Text style={styles.appBarTitle}>Profile</Text>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>{isEditing ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView 
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                {isEditing && (
                  <View style={styles.editAvatarBadge}>
                    <MaterialIcons name="camera-alt" size={16} color={colors['on-primary']} />
                  </View>
                )}
              </View>
              <Text style={styles.name}>{profile?.name || 'User'}</Text>
              <Text style={styles.email}>{profile?.email}</Text>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              {renderField('person', 'Full Name', 'name')}
              {renderField('email', 'Email Address', 'email', false)}
              {renderField('phone', 'Phone Number', 'phone')}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Medical Details</Text>
              {renderField('bloodtype', 'Blood Group', 'bloodGroup')}
              {renderField('cake', 'Date of Birth', 'dateOfBirth')}
            </View>

            <View style={styles.sectionCard}>
              <TouchableOpacity style={styles.actionRow} onPress={logout}>
                <View style={[styles.fieldIconWrapper, { backgroundColor: colors['error-container'] }]}>
                  <MaterialIcons name="logout" size={22} color={colors.error} />
                </View>
                <Text style={styles.logoutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
            
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors['outline-variant'],
  },
  appBarTitle: {
    ...typography.headlineSm,
    color: colors['on-surface'],
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors['primary-container'],
  },
  editButtonText: {
    ...typography.labelLg,
    color: colors['on-primary-container'],
  },
  content: {
    padding: spacing.marginMobile,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '800',
    color: colors['on-primary'],
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  name: {
    ...typography.headlineMd,
    color: colors['on-background'],
    fontWeight: '800',
  },
  email: {
    ...typography.bodyMd,
    color: colors['on-surface-variant'],
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors['surface-variant'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    ...typography.labelLg,
    color: colors['on-surface-variant'],
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  fieldIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors['secondary-container'],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  fieldContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors['surface-variant'],
    paddingBottom: 8,
  },
  fieldLabel: {
    ...typography.labelMd,
    color: colors['on-surface-variant'],
    marginBottom: 4,
  },
  fieldValue: {
    ...typography.bodyLg,
    color: colors['on-surface'],
  },
  fieldInput: {
    ...typography.bodyLg,
    color: colors['on-surface'],
    padding: 0,
    margin: 0,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    ...typography.bodyLg,
    color: colors.error,
    fontWeight: '600',
  },
});
