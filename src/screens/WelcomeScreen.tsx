import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { MedivaLogo } from '../components/common/MedivaLogo';
import { WelcomeBackground } from '../components/common/WelcomeBackground';

const { height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 2500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.root}>
      <WelcomeBackground />
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      <View style={styles.content}>
        {/* Logo & Branding */}
        <Animated.View
          style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        >
          <Animated.View style={[styles.logoCircle, { transform: [{ scale: pulse }] }]}>
            <MedivaLogo width={100} height={100} color={colors.primary} />
          </Animated.View>
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={[styles.titleArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <Text style={styles.appName}>Mediva</Text>
          <Text style={styles.tagline}>Your complete medical history,</Text>
          <Text style={styles.taglineHighlight}>beautifully organized.</Text>
        </Animated.View>

        {/* Feature Pills */}
        <Animated.View style={[styles.pillsRow, { opacity: fadeAnim }]}>
          {['🔒 Secure', '📋 Organized', '🤖 AI-Powered'].map((label) => (
            <View key={label} style={styles.pill}>
              <Text style={styles.pillText}>{label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Buttons */}
        <Animated.View
          style={[styles.buttonArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>I already have an account</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff', // Fallback
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: height * 0.12, // Dynamic padding to fill screen better
    paddingBottom: height * 0.08,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
    backgroundColor: colors.surface,
  },
  titleArea: {
    alignItems: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
  },
  appName: {
    fontSize: 56,
    fontWeight: '900',
    color: colors['on-background'],
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 28,
    fontWeight: '300',
    color: colors['on-surface-variant'],
    lineHeight: 40,
  },
  taglineHighlight: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 40,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.8)', // Slightly transparent over the animated bg
    borderWidth: 1,
    borderColor: 'rgba(15, 108, 191, 0.2)', // Light primary border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  pillText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonArea: {
    gap: 16,
  },
  primaryBtn: {
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryBtnText: {
    color: colors['on-primary'],
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(15, 108, 191, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  secondaryBtnText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '700',
  },
});
