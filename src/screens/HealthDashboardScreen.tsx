import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import { TimelineView } from '../components/TimelineView';

type Props = {
  navigation: any;
};

export const HealthDashboardScreen: React.FC<Props> = ({ navigation }) => {

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.headerSection}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.stackSm }}>
        <MaterialIcons name="timeline" size={32} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={[styles.title, { color: colors.primary, marginBottom: 0 }]}>My Health Journey</Text>
      </View>
      <Text style={styles.subtitle}>See a timeline of your health records.</Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />



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
