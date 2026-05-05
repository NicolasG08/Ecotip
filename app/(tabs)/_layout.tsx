import {
  BorderRadius,
  Colors,
  Gradients,
  Palette,
  Shadows,
  Spacing
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Configuración de tabs
const TAB_CONFIG: {
  name: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  gradient: any;
}[] = [
  { 
    name: 'challenges', 
    title: 'Retos', 
    icon: 'trophy-outline',
    activeIcon: 'trophy',
    gradient: Gradients.primary,
  },
  { 
    name: 'metrics', 
    title: 'Stats', 
    icon: 'stats-chart-outline',
    activeIcon: 'stats-chart',
    gradient: Gradients.ocean,
  },
  { 
    name: 'alerts', 
    title: 'Alertas', 
    icon: 'notifications-outline',
    activeIcon: 'notifications',
    gradient: Gradients.sunrise,
  },
  { 
    name: 'map', 
    title: 'Mapa', 
    icon: 'map-outline',
    activeIcon: 'map',
    gradient: Gradients.aurora,
  },
  { 
    name: 'social', 
    title: 'Social', 
    icon: 'people-outline',
    activeIcon: 'people',
    gradient: [Palette.purple.main, Palette.purple.light],
  },
  { 
    name: 'education', 
    title: 'Aprende', 
    icon: 'school-outline',
    activeIcon: 'school',
    gradient: [Palette.blue.main, Palette.blue.light],
  },
  { 
    name: 'account', 
    title: 'Perfil', 
    icon: 'person-outline',
    activeIcon: 'person',
    gradient: [Palette.green.dark, Palette.green.main],
  },
];

// Componente de Tab personalizado
function AnimatedTabBarButton({
  focused,
  icon,
  activeIcon,
  label,
  gradient,
  onPress,
}: {
  focused: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
  gradient: any;
  onPress: () => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.85, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
    >
      <Animated.View style={[styles.tabContent, animatedStyle]}>
        {focused ? (
          <LinearGradient
            colors={gradient as any}
            style={styles.activeIconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={activeIcon} size={22} color="#FFFFFF" />
          </LinearGradient>
        ) : (
          <View style={styles.inactiveIconContainer}>
            <Ionicons name={icon} size={22} color={colors.tabBarInactive} />
          </View>
        )}
        <Text
          style={[
            styles.tabLabel,
            {
              color: focused ? gradient[0] : colors.tabBarInactive,
              fontWeight: focused ? '600' : '400',
            },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

// Tab Bar personalizada
function CustomTabBar({ state, descriptors, navigation }: any) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarWrapper, { paddingBottom: insets.bottom }]}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 100}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={styles.blurView}
      >
        <LinearGradient
          colors={
            colorScheme === 'dark'
              ? ['rgba(26, 46, 26, 0.95)', 'rgba(26, 46, 26, 0.98)']
              : ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.98)']
          }
          style={styles.tabBarGradient}
        >
          <View style={styles.tabBarContent}>
            {state.routes.map((route: any, index: number) => {
              const config = TAB_CONFIG.find((t) => t.name === route.name);
              if (!config) return null;

              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              return (
                <AnimatedTabBarButton
                  key={route.key}
                  focused={isFocused}
                  icon={config.icon}
                  activeIcon={config.activeIcon}
                  label={config.title}
                  gradient={config.gradient}
                  onPress={onPress}
                />
              );
            })}
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Shadows.lg,
  },
  blurView: {
    overflow: 'hidden',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
  },
  tabBarGradient: {
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  tabBarContent: {
    flexDirection: 'row',
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  tabContent: {
    alignItems: 'center',
  },
  activeIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  inactiveIconContainer: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
  },
});