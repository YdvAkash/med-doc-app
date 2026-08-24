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
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

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
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0A0A0F', '#0D1B2A', '#0A0A0F']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Glow orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />
      <View style={styles.orb3} />

      <View style={styles.content}>
        {/* Logo & Branding */}
        <Animated.View
          style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        >
          <Animated.View style={[styles.logoCircle, { transform: [{ scale: pulse }] }]}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={[styles.titleArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <Text style={styles.appName}>MedDoc</Text>
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
            style={styles.primaryBtnWrapper}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#0066FF', '#00A3FF']}
              style={styles.primaryBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryBtnText}>Get Started</Text>
            </LinearGradient>
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
    backgroundColor: '#0A0A0F',
  },
  orb1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0,102,255,0.12)',
    top: -60,
    left: -80,
  },
  orb2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0,207,255,0.08)',
    top: height * 0.35,
    right: -50,
  },
  orb3: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(0,102,255,0.07)',
    bottom: 40,
    left: -60,
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
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
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
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: 14,
    textShadowColor: 'rgba(0,102,255,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 26,
    fontWeight: '300',
    color: '#8899AA',
    lineHeight: 36,
  },
  taglineHighlight: {
    fontSize: 26,
    fontWeight: '700',
    color: '#00A3FF',
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
    backgroundColor: 'rgba(0,102,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,163,255,0.25)',
  },
  pillText: {
    color: '#99CCFF',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonArea: {
    gap: 14,
  },
  primaryBtnWrapper: {
    borderRadius: 18,
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 12,
  },
  primaryBtn: {
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
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
    borderColor: 'rgba(0,163,255,0.35)',
    backgroundColor: 'rgba(0,102,255,0.06)',
  },
  secondaryBtnText: {
    color: '#80BFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
