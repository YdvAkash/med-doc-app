import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { colors, typography } from '../../theme';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue, 
  withSequence, 
  withTiming 
} from 'react-native-reanimated';

interface OTPModalProps {
  visible: boolean;
  email: string;
  onVerify: (otp: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const OTP_LENGTH = 6;

export const OTPModal: React.FC<OTPModalProps> = ({
  visible,
  email,
  onVerify,
  onCancel,
  isLoading = false,
}) => {
  const [code, setCode] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setCode('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, [visible]);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const renderCells = () => {
    const cells = [];
    for (let i = 0; i < OTP_LENGTH; i++) {
      const char = code[i] || '';
      const isFocused = code.length === i;
      
      cells.push(
        <View
          key={i}
          style={[
            styles.cell,
            isFocused && styles.cellFocused,
            char ? styles.cellFilled : null
          ]}
        >
          <Text style={styles.cellText}>{char}</Text>
        </View>
      );
    }
    return cells;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>We sent an OTP to {email}</Text>
          
          <Pressable style={styles.otpContainer} onPress={handlePress}>
            {renderCells()}
          </Pressable>
          
          {/* Hidden Input */}
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={(text) => {
              if (text.length <= OTP_LENGTH) {
                setCode(text.replace(/[^0-9]/g, ''));
              }
            }}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            style={styles.hiddenInput}
            caretHidden={true}
            textContentType="oneTimeCode"
          />

          <TouchableOpacity 
            style={[styles.verifyButton, code.length < OTP_LENGTH && styles.verifyButtonDisabled]} 
            onPress={() => onVerify(code)}
            disabled={code.length < OTP_LENGTH || isLoading}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    ...typography.headlineMd,
    color: colors['on-surface'],
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors['on-surface-variant'],
    textAlign: 'center',
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  cell: {
    width: 44,
    height: 56,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  cellFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  cellFilled: {
    borderColor: colors.primary,
  },
  cellText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors['on-surface'],
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    ...typography.labelLg,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelButton: {
    padding: 12,
  },
  cancelButtonText: {
    ...typography.labelMd,
    color: colors['on-surface-variant'],
    fontWeight: '600',
  },
});
