import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';
import { useHaptics } from '../../hooks/useHaptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const PremiumTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  const currentRouteName = state.routes[state.index].name;

  // Hide tab bar on specific screens
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
          if (route.name === 'ReportsTab') iconName = 'description'; // Med-Doc Reports
          if (route.name === 'HealthTab') iconName = 'monitor-heart'; // Med-Doc Health
          if (route.name === 'AskTab') iconName = 'smart-toy'; // Med-Doc AI Chat
          if (route.name === 'ProfileTab') iconName = 'person'; // Med-Doc Profile

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              iconName={iconName}
              label={label as string}
            />
          );
        })}
      </View>
    </View>
  );
};

const TabItem = ({ isFocused, onPress, onLongPress, iconName, label }: any) => {
  const scale = useRef(new Animated.Value(isFocused ? 1.05 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isFocused ? 1.05 : 1,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

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
        {/* Top Active Indicator */}
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
  },
  tabBarBackground: {
    flexDirection: 'row',
    borderRadius: 16,
    backgroundColor: colors.surface, // Light theme matching the app
    height: 72,
    alignItems: 'center',
    justifyContent: 'space-around',
    overflow: 'hidden',
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
