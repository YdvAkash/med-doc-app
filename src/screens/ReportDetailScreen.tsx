import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, ActivityIndicator, Alert, Linking, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getDocument, deleteDocument } from '../services/api';
import { colors, spacing, typography } from '../theme';

type Props = {
  route: any;
  navigation: any;
};

export const ReportDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id } = route.params || {};
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchReportDetails();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchReportDetails = async () => {
    setLoading(true);
    try {
      const res = await getDocument(id);
      setReport(res.data);
    } catch (err) {
      console.error('Fetch document error', err);
      Alert.alert('Error', 'Failed to load report details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(id);
              navigation.goBack();
            } catch (err) {
              console.error('Delete error', err);
              Alert.alert('Error', 'Failed to delete document.');
            }
          }
        }
      ]
    );
  };

  const handleDownload = () => {
    if (report?.downloadUrl) {
      Linking.openURL(report.downloadUrl);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors['on-surface-variant']} />
          </TouchableOpacity>
        </View>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors['on-surface-variant']} />
          </TouchableOpacity>
        </View>
        <Text style={{ textAlign: 'center', marginTop: 20, color: colors['on-surface-variant'] }}>Report not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      
      {/* TopAppBar */}
      <View style={styles.appBar}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors['on-surface-variant']} />
        </TouchableOpacity>
        
        <Text style={styles.appBarTitle}>MedDoc</Text>
        
        <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
          <MaterialIcons name="delete-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header section */}
        <View style={styles.headerSection}>
          <View style={styles.cardInner}>
            {report.downloadUrl && (report.fileType?.includes('image') || report.originalFilename?.toLowerCase().match(/\.(jpg|jpeg|png)$/)) ? (
              <Image 
                source={{ uri: report.downloadUrl }} 
                style={styles.previewImage} 
                resizeMode="contain" 
              />
            ) : (
              <View style={styles.iconLarge}>
                <MaterialIcons name="description" size={48} color={colors.primary} />
              </View>
            )}
            <Text style={styles.title}>{report.originalFilename || 'Document Details'}</Text>
            
            <View style={styles.dateRow}>
              <MaterialIcons name="calendar-today" size={16} color={colors['on-surface-variant']} />
              <Text style={styles.dateText}>Date: {report.extractedEventDate || report.uploadDate?.split('T')[0]}</Text>
            </View>
            
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{report.category || 'General'}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={handleDownload}>
            <View style={styles.primaryButtonContainer}>
              <MaterialIcons name="file-download" size={20} color={colors['on-primary']} />
              <Text style={styles.primaryButtonText}>Download File</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
            <MaterialIcons name="share" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors['outline-variant'],
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  appBarTitle: {
    ...typography.headlineSm,
    color: colors.primary,
  },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 24,
  },
  headerSection: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    backgroundColor: colors['surface-container-lowest'],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardInner: {
    padding: 24,
    alignItems: 'center',
  },
  iconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors['secondary-container'],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 450,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    backgroundColor: colors['surface-container-lowest']
  },
  title: {
    ...typography.headlineMd,
    color: colors['on-surface'],
    textAlign: 'center',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dateText: {
    ...typography.bodyMd,
    color: colors['on-surface-variant'],
  },
  categoryBadge: {
    backgroundColor: colors['surface-container'],
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    ...typography.labelMd,
    color: colors['on-surface-variant'],
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonContainer: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    ...typography.labelLg,
    color: colors['on-primary'],
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.outline,
    backgroundColor: colors['surface-container-lowest'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    ...typography.labelLg,
    color: colors.primary,
  },
});
