import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Animated, Easing } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { colors, typography } from '../../theme';
import { useHaptics } from '../../hooks/useHaptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export const PremiumTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  const currentRouteName = state.routes[state.index].name;

  if (currentRouteName === 'AskTab' || currentRouteName === 'ProfileTab') {
    return null;
  }

  return (
    <View style={[styles.container, { bottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.tabBarBackground}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              haptics.light();
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          let iconName: any = 'home';
          if (route.name === 'ReportsTab') iconName = 'description';
          if (route.name === 'HealthTab') iconName = 'monitor-heart';
          if (route.name === 'AskTab') iconName = 'smart-toy';
          if (route.name === 'ProfileTab') iconName = 'person';
          if (route.name === 'ReferralTab') iconName = 'gift'; // FontAwesome5

          const isReferral = route.name === 'ReferralTab';

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              iconName={iconName}
              label={label as string}
              isReferral={isReferral}
            />
          );
        })}
      </View>
    </View>
  );
};

const TabItem = ({ isFocused, onPress, onLongPress, iconName, label, isReferral }: any) => {
  const scale = useRef(new Animated.Value(isFocused && !isReferral ? 1.05 : 1)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isReferral) {
      Animated.spring(scale, {
        toValue: isFocused ? 1.05 : 1,
        useNativeDriver: true,
      }).start();
    }
  }, [isFocused]);

  useEffect(() => {
    if (isReferral) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.15, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();

      Animated.loop(
        Animated.timing(rotate, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isReferral]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  if (isReferral) {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        onPress={onPress}
        onLongPress={onLongPress}
        style={[styles.tabButton, { position: 'relative', zIndex: 10 }]}
        activeOpacity={0.9}
      >
        <View style={styles.fabContainer}>
          {/* Animated Glow Ring */}
          <Animated.View style={[styles.glowRing, { transform: [{ scale: pulse }] }]} />
          
          {/* Rotating Sparkles / Inner Ring */}
          <Animated.View style={[styles.sparkleRing, { transform: [{ rotate: spin }] }]}>
             <LinearGradient
                colors={['rgba(255,107,107,0.8)', 'transparent', 'rgba(255,142,83,0.8)', 'transparent']}
                style={{ width: '100%', height: '100%', borderRadius: 34 }}
             />
          </Animated.View>

          {/* Core Button */}
          <Animated.View style={{ transform: [{ scale: isFocused ? 1.05 : 1 }] }}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53', '#FF3366']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fab}
            >
              <FontAwesome5 name={iconName} size={28} color="#FFF" />
            </LinearGradient>
          </Animated.View>
        </View>
        <Text style={[styles.label, { color: '#FF6B6B', fontWeight: '800', marginTop: 36 }]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.tabContent, { transform: [{ scale }] }]}>
        {isFocused && <View style={styles.activeIndicator} />}

        <MaterialIcons
          name={iconName}
          size={24}
          color={isFocused ? colors.primary : colors.textSecondary}
        />
        <Text style={[styles.label, { color: isFocused ? colors.primary : colors.textSecondary }]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10, // Ensure it's on top
  },
  tabBarBackground: {
    flexDirection: 'row',
    borderRadius: 20, // slightly more rounded for the FAB to look good
    backgroundColor: colors.surface,
    height: 72,
    alignItems: 'center',
    justifyContent: 'space-around',
    overflow: 'visible', // Allow FAB to pop out
    borderWidth: 1,
    borderColor: colors['surface-variant'],
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  fabContainer: {
    position: 'absolute',
    top: -24, // Pop out of the tab bar
    alignItems: 'center',
    justifyContent: 'center',
    width: 68,
    height: 68,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  glowRing: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 107, 107, 0.25)',
  },
  sparkleRing: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: 'rgba(255,142,83,0.3)',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 4,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  label: {
    ...typography.Caption1,
    marginTop: 4,
    fontWeight: '500',
  }
});
