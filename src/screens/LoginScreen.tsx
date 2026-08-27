import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAuthStore } from '../store/useAuth';
import { colors, typography } from '../theme';
import { verifyRegistration } from '../services/api';
import { getUserFriendlyErrorMessage } from '../utils/errorHandler';
import { OTPModal } from '../components/common/OTPModal';
import { MedicalBackground } from '../components/common/MedicalBackground';
import { AnimatedAuthHeading } from '../components/common/AnimatedAuthHeading';
import { PremiumTextInput } from '../components/common/PremiumTextInput';
import { MedivaLogo } from '../components/common/MedivaLogo';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
    } catch (err: any) {
      const code = err.response?.data?.code;
      const errorMessage = getUserFriendlyErrorMessage(err);

      if (code === 'UNVERIFIED_ACCOUNT' || errorMessage.includes('not verified')) {
        Alert.alert('Verify Email', errorMessage);
        setShowOtpModal(true);
      } else {
        Alert.alert('Login Failed', errorMessage);
      }
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
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <MedicalBackground />

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

        <View style={styles.logoContainer}>
          <MedivaLogo width={72} height={72} color={colors.primary} />
        </View>

        <AnimatedAuthHeading
          title="Welcome Back"
          subtitle="Sign in to access your medical records"
        />

        <View style={styles.form}>
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

          <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors['on-primary']} />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
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
    padding: 24,
    paddingTop: 60,
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
    marginBottom: 24,
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
    marginTop: 32,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  forgotPasswordText: {
    ...typography.labelLg,
    color: colors.primary,
  },
  loginButton: {
    height: 60,
    backgroundColor: colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
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
