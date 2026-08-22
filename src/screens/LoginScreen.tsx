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
import { useAuthStore } from '../store/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Mail, Lock } from 'lucide-react-native';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const btnScale = useRef(new Animated.Value(1)).current;
  const login = useAuthStore(state => state.login);

  const onPressIn = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    try {
      const response = await AuthService.login({ email, password });
      if (response.data && response.data.accessToken) {
        await login(
          {
            email: response.data.user?.email || email,
            name: `${response.data.user?.firstName || ''} ${response.data.user?.lastName || ''}`.trim() || 'User',
          },
          response.data.accessToken
        );
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed.';
      setError(errorMsg);
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
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {/* Back */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            {/* Badge */}
            <View style={styles.badge}>
              <LinearGradient colors={['#0066FF', '#00A3FF']} style={styles.badgeGradient}>
                <Text style={styles.badgeIcon}>⚕</Text>
              </LinearGradient>
            </View>

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your medical records</Text>

            <View style={styles.form}>
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
                placeholder="••••••••"
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

              <TouchableOpacity style={styles.forgotWrap}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                <TouchableOpacity
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.9}
                  style={styles.btnWrapper}
                >
                  <LinearGradient colors={['#0066FF', '#00A3FF']} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Text style={styles.btnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New here? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.footerLink}>Create Account →</Text>
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
  orb1: { position: 'absolute', width: 350, height: 350, borderRadius: 175, backgroundColor: 'rgba(0,102,255,0.1)', top: -80, right: -100 },
  orb2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(0,207,255,0.07)', bottom: 60, left: -60 },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 20, paddingBottom: 40 },
  backBtn: { marginBottom: 24 },
  backText: { color: '#4488BB', fontSize: 16, fontWeight: '600' },
  badge: { width: 64, height: 64, borderRadius: 20, marginBottom: 28, shadowColor: '#0066FF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12 },
  badgeGradient: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  badgeIcon: { fontSize: 30, color: '#fff' },
  title: { fontSize: 36, fontWeight: '900', color: '#FFFFFF', marginBottom: 8, letterSpacing: 0.5 },
  subtitle: { fontSize: 16, color: '#667788', marginBottom: 36 },
  form: { width: '100%' },
  errorBanner: { backgroundColor: 'rgba(255,59,48,0.12)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)', borderRadius: 12, padding: 14, marginTop: 12 },
  errorText: { color: '#FF6B6B', fontSize: 14, fontWeight: '600' },
  forgotWrap: { alignSelf: 'flex-end', marginTop: 10, marginBottom: 28 },
  forgotText: { color: '#0099FF', fontSize: 14, fontWeight: '600' },
  btnWrapper: { borderRadius: 18, shadowColor: '#0066FF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 18, elevation: 12 },
  btn: { height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 36 },
  footerText: { color: '#667788', fontSize: 15 },
  footerLink: { color: '#0099FF', fontSize: 15, fontWeight: '700' },
});
