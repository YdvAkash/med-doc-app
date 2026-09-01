import React, { useEffect, useState } from 'react';
import { 
  View, Text, Modal, StyleSheet, TouchableOpacity, 
  ActivityIndicator, LayoutAnimation, UIManager, Platform 
} from 'react-native';
import { UpdateService, UpdateState } from '../../services/UpdateService';
import { MaterialIcons } from '@expo/vector-icons';
import { PREMIUM_COLORS } from '../../design/colors';
import { TYPOGRAPHY } from '../../design/typography';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export function UpdateModal() {
  const [updateState, setUpdateState] = useState<UpdateState>('IDLE');
  const [progress, setProgress] = useState<number>(0);
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    UpdateService.setListener((state, prog, ver) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setUpdateState(state);
      if (prog !== undefined) setProgress(prog);
      if (ver !== undefined) setVersion(ver);
    });

    return () => {
      UpdateService.setListener(null);
    };
  }, []);

  if (updateState === 'IDLE' || updateState === 'CHECKING') {
    return null; 
  }

  const isDownloading = updateState === 'DOWNLOADING';
  const isPreparing = updateState === 'PREPARING_INSTALL' || updateState === 'OPENING_INSTALLER';
  const isComplete = updateState === 'DOWNLOAD_COMPLETE';
  const isFailed = updateState === 'DOWNLOAD_FAILED';
  const isAvailable = updateState === 'UPDATE_AVAILABLE';

  // Modal shouldn't be closable during download/install to avoid accidental interruptions
  const isClosable = isAvailable || isFailed;

  const handleUpdate = () => {
    UpdateService.startDownloadAndInstall();
  };

  const handleLater = () => {
    UpdateService.dismissUpdate();
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={true}
      onRequestClose={() => {
        if (isClosable) handleLater();
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          {isAvailable && (
            <View style={styles.stateContainer}>
              <View style={[styles.iconContainer, { backgroundColor: PREMIUM_COLORS.primaryLight }]}>
                <MaterialIcons name="system-update-alt" size={32} color={PREMIUM_COLORS.primaryDark} />
              </View>
              <Text style={styles.title}>Update Available</Text>
              <Text style={styles.subtitle}>
                A new version of Mediva is ready for you.
              </Text>
              
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>Version {version}</Text>
              </View>

              <View style={styles.featuresList}>
                <View style={styles.featureRow}>
                  <MaterialIcons name="speed" size={18} color={PREMIUM_COLORS.primary} />
                  <Text style={styles.featureItem}>Improved performance</Text>
                </View>
                <View style={styles.featureRow}>
                  <MaterialIcons name="security" size={18} color={PREMIUM_COLORS.primary} />
                  <Text style={styles.featureItem}>Better security</Text>
                </View>
                <View style={styles.featureRow}>
                  <MaterialIcons name="new-releases" size={18} color={PREMIUM_COLORS.primary} />
                  <Text style={styles.featureItem}>New features</Text>
                </View>
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleUpdate} activeOpacity={0.8}>
                  <Text style={styles.primaryButtonText}>Update Now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleLater} activeOpacity={0.7}>
                  <Text style={styles.secondaryButtonText}>Maybe Later</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isDownloading && (
            <View style={styles.stateContainer}>
              <View style={[styles.iconContainer, { backgroundColor: PREMIUM_COLORS.primaryLight }]}>
                <MaterialIcons name="cloud-download" size={32} color={PREMIUM_COLORS.primaryDark} />
              </View>
              <Text style={styles.title}>Downloading Update</Text>
              <Text style={styles.subtitle}>
                Getting everything ready for you...
              </Text>
              
              <View style={styles.progressWrapper}>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${Math.max(0, Math.min(100, progress * 100))}%` }]} />
                </View>
                <Text style={styles.progressPercentage}>{Math.round(progress * 100)}%</Text>
              </View>
              
              <Text style={styles.warningText}>Please keep the app open</Text>
            </View>
          )}

          {isComplete && (
            <View style={styles.stateContainer}>
              <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                <MaterialIcons name="check-circle" size={32} color="#4CAF50" />
              </View>
              <Text style={styles.title}>Download Complete</Text>
              <Text style={styles.subtitle}>Your update is ready.</Text>
              <Text style={styles.statusText}>Preparing installation...</Text>
            </View>
          )}

          {isPreparing && (
            <View style={styles.stateContainer}>
              <View style={[styles.iconContainer, { backgroundColor: PREMIUM_COLORS.primaryLight }]}>
                <ActivityIndicator size="large" color={PREMIUM_COLORS.primaryDark} />
              </View>
              <Text style={styles.title}>
                {updateState === 'OPENING_INSTALLER' ? 'Ready to Install' : 'Installing Update'}
              </Text>
              <Text style={styles.subtitle}>
                {updateState === 'OPENING_INSTALLER' 
                  ? 'Opening the installer...' 
                  : 'Please wait while we prepare the latest version.'}
              </Text>
            </View>
          )}

          {isFailed && (
            <View style={styles.stateContainer}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
                <MaterialIcons name="error-outline" size={32} color={PREMIUM_COLORS.danger} />
              </View>
              <Text style={styles.title}>Update Couldn't Download</Text>
              <Text style={styles.subtitle}>Something went wrong while downloading the update.</Text>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleUpdate} activeOpacity={0.8}>
                  <Text style={styles.primaryButtonText}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleLater} activeOpacity={0.7}>
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: PREMIUM_COLORS.darkOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: PREMIUM_COLORS.surface,
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  stateContainer: {
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    ...TYPOGRAPHY.H2,
    color: PREMIUM_COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.Body1,
    color: PREMIUM_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  statusText: {
    ...TYPOGRAPHY.Body1,
    color: PREMIUM_COLORS.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  versionBadge: {
    backgroundColor: PREMIUM_COLORS.background,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PREMIUM_COLORS.border,
    marginBottom: 24,
  },
  versionText: {
    ...TYPOGRAPHY.Label,
    color: PREMIUM_COLORS.textPrimary,
  },
  featuresList: {
    width: '100%',
    backgroundColor: PREMIUM_COLORS.secondarySurface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureItem: {
    ...TYPOGRAPHY.Body2,
    color: PREMIUM_COLORS.textPrimary,
  },
  buttonRow: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: PREMIUM_COLORS.primary,
    alignItems: 'center',
    shadowColor: PREMIUM_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.Button,
    color: '#FFFFFF',
    fontSize: 16,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.Button,
    color: PREMIUM_COLORS.textSecondary,
    fontSize: 16,
  },
  progressWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  progressContainer: {
    flex: 1,
    height: 10,
    backgroundColor: PREMIUM_COLORS.divider,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: PREMIUM_COLORS.primary,
    borderRadius: 5,
  },
  progressPercentage: {
    ...TYPOGRAPHY.Label,
    color: PREMIUM_COLORS.textPrimary,
    width: 40,
    textAlign: 'right',
  },
  warningText: {
    ...TYPOGRAPHY.Caption1,
    color: PREMIUM_COLORS.textSecondary,
    marginTop: 8,
  }
});
