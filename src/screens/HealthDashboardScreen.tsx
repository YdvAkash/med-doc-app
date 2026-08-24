import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import { TimelineView } from '../components/TimelineView';

type Props = {
  navigation: any;
};

export const HealthDashboardScreen: React.FC<Props> = ({ navigation }) => {
  
  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={styles.title}>My Health Journey</Text>
      <Text style={styles.subtitle}>See a timeline of your health records.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="translate" size={24} color={colors['on-surface-variant']} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TimelineView ListHeaderComponent={renderHeader()} />
      </View>
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
    flex: 1,
    paddingHorizontal: spacing.marginMobile,
    paddingTop: 16,
  },
  headerSection: {
    marginBottom: spacing.stackLg,
  },
  title: {
    ...typography.headlineLgMobile,
    color: colors['on-background'],
    marginBottom: spacing.stackSm,
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors['on-surface-variant'],
  },
});
