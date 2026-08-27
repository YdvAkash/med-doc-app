import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
  ScrollView,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAuthStore } from '../store/useAuth';
import { colors, typography } from '../theme';
import { verifyRegistration } from '../services/api';
import { getUserFriendlyErrorMessage } from '../utils/errorHandler';
import { OTPModal } from '../components/common/OTPModal';
import { PremiumTextInput } from '../components/common/PremiumTextInput';
import { MedicalBackground } from '../components/common/MedicalBackground';
import { AnimatedAuthHeading } from '../components/common/AnimatedAuthHeading';
import { MedivaLogo } from '../components/common/MedivaLogo';

export const RegisterScreen = ({ navigation }: any) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  const { register, login, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await register(firstName, lastName, email, password);
      setShowOtpModal(true);
    } catch (err: any) {
      Alert.alert('Registration Failed', getUserFriendlyErrorMessage(err));
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    if (!otpCode) return Alert.alert('Error', 'Please enter OTP');
    try {
      await verifyRegistration(email, otpCode);
      setShowOtpModal(false);
      await login(email, password);
    } catch (err: any) {
      Alert.alert('Verification Failed', getUserFriendlyErrorMessage(err));
    }
  };

  return (
    <View style={styles.root}>
      <MedicalBackground />
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors['on-surface']} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <MedivaLogo width={72} height={72} color={colors.primary} />
          </View>

          <AnimatedAuthHeading
            title="Create Account"
            subtitle="Join us to manage your health records"
          />

          <View style={styles.form}>
            <PremiumTextInput
              icon="person"
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />

            <PremiumTextInput
              icon="person-outline"
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />

            <PremiumTextInput
              icon="email"
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <PremiumTextInput
              icon="lock"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              isPassword={true}
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors['on-primary']} />
              ) : (
                <Text style={styles.loginButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <OTPModal
        visible={showOtpModal}
        email={email}
        onVerify={handleVerifyOtp}
        onCancel={() => setShowOtpModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 120,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    zIndex: 10,
  },
  logoContainer: {
    alignSelf: 'center',
    marginBottom: 24,
    width: 72,
    height: 72,
  },
  form: {
    gap: 16,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    height: 60,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    ...typography.bodyLg,
    color: colors['on-surface'],
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    height: 60,
    backgroundColor: colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    ...typography.labelLg,
    color: colors['on-primary'],
    fontSize: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    ...typography.bodyMd,
    color: colors['on-surface-variant'],
  },
  footerLink: {
    ...typography.labelLg,
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.headlineSm,
    color: colors['on-surface'],
    marginBottom: 8,
  },
  modalSubtitle: {
    ...typography.bodyMd,
    color: colors['on-surface-variant'],
    marginBottom: 24,
    textAlign: 'center',
  },
  otpInput: {
    width: '100%',
    height: 60,
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    ...typography.headlineSm,
    marginBottom: 24,
  },
  verifyButton: {
    width: '100%',
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  verifyButtonText: {
    ...typography.labelLg,
    color: colors['on-primary'],
  },
  cancelButton: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.labelLg,
    color: colors['on-surface-variant'],
  },
});
