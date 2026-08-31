import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  userName: string;
  planName: string;
}

export const SubscriptionSuccessModal: React.FC<Props> = ({ visible, onClose, userName, planName }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 50,
          useNativeDriver: true,
          delay: 100, // delay the pop slightly
        })
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      scaleAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.modalContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.animationContainer}>
            <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleAnim }] }]}>
              <MaterialIcons name="check" size={60} color="#FFFFFF" />
            </Animated.View>
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>Payment Successful!</Text>
            <Text style={styles.subtitle}>
              Hello <Text style={styles.highlight}>{userName}</Text>,
            </Text>
            <Text style={styles.message}>
              Welcome to the <Text style={styles.planHighlight}>{planName}</Text> plan
            </Text>
            <Text style={styles.description}>
              Your account has been upgraded. You now have access to all premium features. Enjoy your new superpowers!
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Start Exploring</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  animationContainer: {
    marginTop: -50,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    backgroundColor: '#10B981', // Success Green
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    ...typography.headlineMd,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.bodyLg,
    color: '#334155',
    marginBottom: 4,
    fontSize: 20,
  },
  message: {
    ...typography.bodyLg,
    color: '#334155',
    fontSize: 18,
    marginBottom: 12,
  },
  highlight: {
    fontWeight: '800',
    color: colors.primary,
  },
  planHighlight: {
    fontWeight: '800',
    color: '#10B981', // green shade for success/plan
  },
  description: {
    ...typography.bodyMd,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
});
