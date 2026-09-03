import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, Linking, Dimensions, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import { X } from 'lucide-react-native';
import { Banner, dismissBanner, fetchActiveBanners, getDismissedBannerIds } from '../services/bannerService';
import { CustomButton } from './CustomButton';
import { colors, typography } from '../theme';

const { width, height } = Dimensions.get('window');

export const InAppBanner = () => {
  const [activeBanner, setActiveBanner] = useState<Banner | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    checkBanners();
  }, []);

  const checkBanners = async () => {
    try {
      const banners = await fetchActiveBanners();
      const dismissedIds = await getDismissedBannerIds();

      // Find the first banner that is not dismissed
      const bannerToShow = banners.find(b => !dismissedIds.includes(b.id));

      if (bannerToShow) {
        setActiveBanner(bannerToShow);
        setIsVisible(true);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          })
        ]).start();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDismiss = async () => {
    if (activeBanner) {
      await dismissBanner(activeBanner.id);
      closeModal();
    }
  };

  const handleAction = async () => {
    if (activeBanner?.actionUrl) {
      await Linking.openURL(activeBanner.actionUrl).catch(err => console.error("Couldn't open URL", err));
      handleDismiss();
    }
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsVisible(false);
      setActiveBanner(null);
    });
  };

  if (!isVisible || !activeBanner) return null;

  return (
    <Modal visible={isVisible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[
          styles.modalContainer,
          activeBanner.htmlContent ? styles.htmlModalContainer : {},
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
            <X size={24} color="#000" />
          </TouchableOpacity>

          {activeBanner.htmlContent ? (
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={handleAction} 
              style={{ width: '100%', height: 350 }}
            >
              <View style={{ flex: 1 }} pointerEvents="none">
                <WebView
                  originWhitelist={['*']}
                  source={{ html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                    <style>
                      body { margin: 0; padding: 0; font-family: -apple-system, system-ui, sans-serif; background-color: transparent; display: flex; justify-content: center; align-items: center; min-height: 100vh; overflow: hidden; }
                    </style>
                    </head>
                    <body>
                      ${activeBanner.htmlContent}
                    </body>
                    </html>
                  ` }}
                  style={{ backgroundColor: 'transparent' }}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  bounces={false}
                />
              </View>
            </TouchableOpacity>
          ) : (
            <>
              {activeBanner.imageUrl ? (
                <Image
                  source={{ uri: activeBanner.imageUrl }}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage} />
              )}

              <View style={styles.contentContainer}>
                <Text style={styles.title}>{activeBanner.title}</Text>

                {!!activeBanner.actionUrl && (
                  <CustomButton
                    title="View Offer"
                    onPress={handleAction}
                    style={styles.actionButton}
                  />
                )}
              </View>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  htmlModalContainer: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 15,
    padding: 4,
  },
  bannerImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.background,
  },
  placeholderImage: {
    width: '100%',
    height: 100,
    backgroundColor: colors.primary,
  },
  contentContainer: {
    padding: 24,
  },
  title: {
    ...typography.H2,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    ...typography.Body1,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  actionButton: {
    marginTop: 10,
    borderRadius: 30,
  },
});
