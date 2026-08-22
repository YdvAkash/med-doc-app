import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomInput } from '../components/CustomInput';
import { AuthService } from '../services/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Mail, Lock, User } from 'lucide-react-native';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const btnScale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    try {
      await AuthService.register({ firstName, lastName, email, password });
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigation.navigate('Login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0A0F', '#0D1B2A', '#0A0A0F']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.badge}>
              <LinearGradient colors={['#0066FF', '#00A3FF']} style={styles.badgeGradient}>
                <Text style={styles.badgeIcon}>⚕</Text>
              </LinearGradient>
            </View>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start organizing your medical history today</Text>

            <View style={styles.form}>
              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <CustomInput
                    label="First Name"
                    placeholder="John"
                    value={firstName}
                    onChangeText={setFirstName}
                    icon={<User color="#4488BB" size={18} />}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <CustomInput
                    label="Last Name"
                    placeholder="Doe"
                    value={lastName}
                    onChangeText={setLastName}
                    icon={<User color="#4488BB" size={18} />}
                  />
                </View>
              </View>

              <CustomInput
                label="Email Address"
                placeholder="doctor@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                icon={<Mail color="#4488BB" size={20} />}
              />
              <CustomInput
                label="Password"
                placeholder="Create a strong password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                icon={<Lock color="#4488BB" size={20} />}
              />

              {error ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>⚠ {error}</Text>
                </View>
              ) : null}
              {success ? (
                <View style={styles.successBanner}>
                  <Text style={styles.successText}>✓ {success}</Text>
                </View>
              ) : null}

              <Animated.View style={[{ transform: [{ scale: btnScale }] }, { marginTop: 28 }]}>
                <TouchableOpacity
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.9}
                  style={styles.btnWrapper}
                >
                  <LinearGradient colors={['#0066FF', '#00A3FF']} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Text style={styles.btnText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}>Sign In →</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0F' },
  orb1: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(0,102,255,0.1)', top: -80, left: -80 },
  orb2: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(0,207,255,0.07)', bottom: 40, right: -60 },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 20, paddingBottom: 50 },
  backBtn: { marginBottom: 24 },
  backText: { color: '#4488BB', fontSize: 16, fontWeight: '600' },
  badge: { width: 64, height: 64, borderRadius: 20, marginBottom: 28, shadowColor: '#0066FF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12 },
  badgeGradient: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  badgeIcon: { fontSize: 30, color: '#fff' },
  title: { fontSize: 36, fontWeight: '900', color: '#FFFFFF', marginBottom: 8, letterSpacing: 0.5 },
  subtitle: { fontSize: 15, color: '#667788', marginBottom: 36, lineHeight: 22 },
  form: { width: '100%' },
  rowInputs: { flexDirection: 'row' },
  errorBanner: { backgroundColor: 'rgba(255,59,48,0.12)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)', borderRadius: 12, padding: 14, marginTop: 12 },
  errorText: { color: '#FF6B6B', fontSize: 14, fontWeight: '600' },
  successBanner: { backgroundColor: 'rgba(52,199,89,0.12)', borderWidth: 1, borderColor: 'rgba(52,199,89,0.3)', borderRadius: 12, padding: 14, marginTop: 12 },
  successText: { color: '#4CD964', fontSize: 14, fontWeight: '600' },
  btnWrapper: { borderRadius: 18, shadowColor: '#0066FF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 18, elevation: 12 },
  btn: { height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: '#667788', fontSize: 15 },
  footerLink: { color: '#0099FF', fontSize: 15, fontWeight: '700' },
});
