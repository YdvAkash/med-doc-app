import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Image, StatusBar } from 'react-native';
import { colors, typography } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { forgotPassword, resetPassword } from '../services/api';
import { getUserFriendlyErrorMessage } from '../utils/errorHandler';
import { OTPModal } from '../components/common/OTPModal';
import Animated, { FadeIn } from 'react-native-reanimated';
import { PremiumTextInput } from '../components/common/PremiumTextInput';
import { MedicalBackground } from '../components/common/MedicalBackground';
import { AnimatedAuthHeading } from '../components/common/AnimatedAuthHeading';
import { MedivaLogo } from '../components/common/MedivaLogo';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) return Alert.alert('Error', 'Please enter your email');
    setLoading(true);
    try {
      await forgotPassword(email);
      setStep('otp');
    } catch (err: any) {
      Alert.alert('Error', getUserFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (otpCode: string) => {
    if (!otpCode) return Alert.alert('Error', 'Please enter OTP');
    setOtp(otpCode);
    setStep('password');
  };

  const handleResetPassword = async () => {
    if (!newPassword) return Alert.alert('Error', 'Please enter new password');
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      Alert.alert('Success', 'Password reset successfully!');
      navigation.navigate('Login');
    } catch (err: any) {
      Alert.alert('Error', getUserFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <MedicalBackground />
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.backButton} onPress={() => step === 'email' ? navigation.goBack() : setStep(step === 'password' ? 'otp' : 'email')}>
          <MaterialIcons name="arrow-back" size={24} color={colors['on-surface']} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <MedivaLogo width={72} height={72} color={colors.primary} />
          </View>

          <AnimatedAuthHeading
            title={step === 'password' ? 'New Password' : 'Forgot Password'}
            subtitle={step === 'password' ? 'Create a new password' : 'Enter your email to receive a reset OTP'}
          />

          <View>
            {(step === 'email' || step === 'otp') && (
              <PremiumTextInput
                icon="email"
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ marginBottom: 24 }}
              />
            )}

            {step === 'password' && (
              <PremiumTextInput
                icon="lock"
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                isPassword={true}
                style={{ marginBottom: 24 }}
              />
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={step === 'email' || step === 'otp' ? handleSendOtp : handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors['on-primary']} />
              ) : (
                <Text style={styles.buttonText}>
                  {step === 'password' ? 'Reset Password' : 'Send OTP'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <OTPModal
          visible={step === 'otp'}
          email={email}
          onVerify={handleVerifyOtp}
          onCancel={() => setStep('email')}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, padding: 24, paddingTop: 60 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors['outline-variant'], marginBottom: 24, zIndex: 10 },
  logoContainer: { alignSelf: 'center', marginBottom: 24, width: 72, height: 72 },
  content: { flex: 1, justifyContent: 'center', paddingBottom: 100 },
  button: { height: 60, backgroundColor: colors.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { ...typography.labelLg, color: colors['on-primary'], fontSize: 18 }
});
