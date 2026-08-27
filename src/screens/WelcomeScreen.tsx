import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography } from '../theme';
import { MedivaLogo } from '../components/common/MedivaLogo';

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
        Animated.timing(pulse, { toValue: 1.08, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.content}>
        {/* Logo & Branding */}
        <Animated.View
          style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        >
          <Animated.View style={[styles.logoCircle, { transform: [{ scale: pulse }] }]}>
            <MedivaLogo width={80} height={80} color={colors.primary} />
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
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: colors.surface,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 30,
  },
  titleArea: {
    alignItems: 'flex-start',
  },
  appName: {
    fontSize: 52,
    fontWeight: '900',
    color: colors['on-background'],
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  tagline: {
    fontSize: 26,
    fontWeight: '300',
    color: colors['on-surface-variant'],
    lineHeight: 36,
  },
  taglineHighlight: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 36,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors['secondary-container'],
    borderWidth: 1,
    borderColor: colors['outline-variant'],
  },
  pillText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  buttonArea: {
    gap: 14,
  },
  primaryBtn: {
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: colors['on-primary'],
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.outline,
    backgroundColor: colors.surface,
  },
  secondaryBtnText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
