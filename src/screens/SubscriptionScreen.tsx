import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import RazorpayCheckout from 'react-native-razorpay';
import { colors, typography } from '../theme';
import { useAuthStore } from '../store/useAuth';
import { createOrder, verifyPayment } from '../services/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SubscriptionSuccessModal } from '../components/SubscriptionSuccessModal';

type Props = {
  navigation: any;
};

export const SubscriptionScreen: React.FC<Props> = ({ navigation }) => {
  const { user, fetchProfile } = useAuthStore();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [subscribedPlan, setSubscribedPlan] = useState('');

  // Use environment variable for Razorpay Key, with fallback for local testing if not set
  const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TVtRFkDuf8X59H';

  const handleSubscribe = async (plan: string, amount: number) => {
    setLoadingPlan(plan);
    try {
      const orderRes = await createOrder(plan);
      if (!orderRes.success) {
        Alert.alert('Error', 'Could not create subscription order.');
        setLoadingPlan(null);
        return;
      }

      const options: any = {
        description: `Mediva ${plan} Subscription`,
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: 'INR',
        key: RAZORPAY_KEY_ID,
        amount: (amount * 100).toString(),
        name: 'Mediva',
        order_id: orderRes.orderId,
        theme: { color: colors.primary },
      };

      if (user?.email || user?.emergencyContactPhone || user?.firstName) {
        options.prefill = {};
        if (user?.email) options.prefill.email = user.email;
        if (user?.emergencyContactPhone) options.prefill.contact = user.emergencyContactPhone;
        if (user?.firstName) options.prefill.name = `${user.firstName} ${user.lastName || ''}`.trim();
      }

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          const verifyRes = await verifyPayment(data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature, plan);
          if (verifyRes.success) {
            await fetchProfile(); // refresh user tier
            setSubscribedPlan(plan);
            setShowSuccessModal(true);
          } else {
            Alert.alert('Payment Failed', 'Payment verification failed.');
          }
        })
        .catch((error: any) => {
          console.log(error);
          Alert.alert('Payment Cancelled', 'You cancelled the payment process.');
        })
        .finally(() => {
          setLoadingPlan(null);
        });

    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
      setLoadingPlan(null);
    }
  };

  const currentTier = user?.subscriptionTier || 'FREE';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <MaterialIcons name="close" size={24} color={colors['on-surface']} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade Plan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerSection}>
          <Text style={styles.mainHeading}>Choose your perfect plan</Text>
          <Text style={styles.subHeading}>Get more limits and remove ads for a better experience.</Text>
        </View>

        {/* FREE PLAN */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <View style={[styles.planCard, currentTier === 'FREE' && styles.activeCard]}>
            {currentTier === 'FREE' && <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>CURRENT</Text></View>}
            <Text style={styles.planName}>Free Plan</Text>
            <Text style={styles.planPrice}>₹0<Text style={styles.planPeriod}>/month</Text></Text>
            
            <View style={styles.featureList}>
              <View style={styles.featureRow}>
                <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                <Text style={styles.featureText}>3 Document Uploads / month</Text>
              </View>
              <View style={styles.featureRow}>
                <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                <Text style={styles.featureText}>2 AI Chats / month</Text>
              </View>
              <View style={styles.featureRow}>
                <MaterialIcons name="cancel" size={20} color={colors.error} />
                <Text style={styles.featureText}>Contains Ads</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* BASIC PLAN */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <View style={[styles.planCard, styles.recommendedCard, currentTier === 'BASIC' && styles.activeCard]}>
            <View style={styles.recommendedBadge}><Text style={styles.recommendedBadgeText}>RECOMMENDED</Text></View>
            {currentTier === 'BASIC' && <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>CURRENT</Text></View>}
            
            <Text style={styles.planName}>Basic Plan</Text>
            <Text style={styles.planPrice}>₹199<Text style={styles.planPeriod}>/month</Text></Text>
            
            <View style={styles.featureList}>
              <View style={styles.featureRow}>
                <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                <Text style={styles.featureText}>7 Document Uploads / month</Text>
              </View>
              <View style={styles.featureRow}>
                <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                <Text style={styles.featureText}>20 AI Chats / month</Text>
              </View>
              <View style={styles.featureRow}>
                <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                <Text style={styles.featureText}>Ad-Free Experience</Text>
              </View>
            </View>

            {currentTier !== 'BASIC' && currentTier !== 'PRO' && (
              <TouchableOpacity style={styles.subscribeButton} onPress={() => handleSubscribe('BASIC', 199)} disabled={loadingPlan !== null}>
                {loadingPlan === 'BASIC' ? <ActivityIndicator color="#FFF" /> : <Text style={styles.subscribeButtonText}>Upgrade to Basic</Text>}
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* PRO PLAN */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <View style={[styles.planCard, currentTier === 'PRO' && styles.activeCard]}>
            {currentTier === 'PRO' && <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>CURRENT</Text></View>}
            
            <Text style={styles.planName}>Pro Plan</Text>
            <Text style={styles.planPrice}>₹399<Text style={styles.planPeriod}>/month</Text></Text>
            
            <View style={styles.featureList}>
              <View style={styles.featureRow}>
                <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                <Text style={styles.featureText}>Unlimited Document Uploads</Text>
              </View>
              <View style={styles.featureRow}>
                <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                <Text style={styles.featureText}>Unlimited AI Chats</Text>
              </View>
              <View style={styles.featureRow}>
                <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                <Text style={styles.featureText}>Ad-Free & Priority Support</Text>
              </View>
            </View>

            {currentTier !== 'PRO' && (
              <TouchableOpacity style={[styles.subscribeButton, { backgroundColor: '#0F172A' }]} onPress={() => handleSubscribe('PRO', 399)} disabled={loadingPlan !== null}>
                {loadingPlan === 'PRO' ? <ActivityIndicator color="#FFF" /> : <Text style={styles.subscribeButtonText}>Upgrade to Pro</Text>}
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

      </ScrollView>

      <SubscriptionSuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
        userName={user?.firstName || 'Valued Member'}
        planName={subscribedPlan}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  headerIcon: {
    padding: 8,
  },
  headerTitle: {
    ...typography.Title2,
    color: colors['on-surface'],
    fontWeight: '700',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  mainHeading: {
    ...typography.headlineMd,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subHeading: {
    ...typography.bodyMd,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  activeCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  recommendedCard: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#F0F9FF',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  currentBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },
  planName: {
    ...typography.Title2,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 24,
  },
  planPeriod: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  featureList: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    ...typography.bodyMd,
    color: '#334155',
    fontWeight: '500',
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  }
});
