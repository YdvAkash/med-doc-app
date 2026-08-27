import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { colors, typography } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { forgotPassword, resetPassword } from '../services/api';
import { getUserFriendlyErrorMessage } from '../utils/errorHandler';

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

  const handleVerifyOtp = () => {
    if (!otp) return Alert.alert('Error', 'Please enter OTP');
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableOpacity style={styles.backButton} onPress={() => step === 'email' ? navigation.goBack() : setStep(step === 'password' ? 'otp' : 'email')}>
        <MaterialIcons name="arrow-back" size={24} color={colors['on-surface']} />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={styles.title}>
          {step === 'email' ? 'Forgot Password' : step === 'otp' ? 'Enter OTP' : 'New Password'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 'email' ? 'Enter your email to receive a reset OTP' : step === 'otp' ? `We sent an OTP to ${email}` : 'Create a new password'}
        </Text>

        {step === 'email' && (
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={20} color={colors.outline} style={styles.icon} />
            <TextInput style={styles.input} placeholder="Email Address" value={email} onChangeText={setEmail} autoCapitalize="none" />
          </View>
        )}

        {step === 'otp' && (
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock-clock" size={20} color={colors.outline} style={styles.icon} />
            <TextInput style={styles.input} placeholder="Enter 6-digit code" placeholderTextColor={colors.outline} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />
          </View>
        )}

        {step === 'password' && (
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color={colors.outline} style={styles.icon} />
            <TextInput style={styles.input} placeholder="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
          </View>
        )}

        <TouchableOpacity 
          style={styles.button} 
          onPress={step === 'email' ? handleSendOtp : step === 'otp' ? handleVerifyOtp : handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors['on-primary']} />
          ) : (
            <Text style={styles.buttonText}>
              {step === 'email' ? 'Send OTP' : step === 'otp' ? 'Verify OTP' : 'Reset Password'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, paddingTop: 60 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors['outline-variant'], marginBottom: 40 },
  content: { flex: 1, justifyContent: 'center', paddingBottom: 100 },
  title: { ...typography.headlineLg, color: colors['on-background'], marginBottom: 8 },
  subtitle: { ...typography.bodyLg, color: colors['on-surface-variant'], marginBottom: 32 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors['outline-variant'], height: 60, paddingHorizontal: 16, marginBottom: 24 },
  icon: { marginRight: 12 },
  input: { flex: 1, ...typography.bodyLg, color: colors['on-surface'] },
  button: { height: 60, backgroundColor: colors.primary, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  buttonText: { ...typography.labelLg, color: colors['on-primary'], fontSize: 18 }
});
