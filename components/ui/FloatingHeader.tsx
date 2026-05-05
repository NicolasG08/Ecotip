import {
    Colors,
    Gradients,
    Spacing,
    Typography
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FloatingHeaderProps {
  title: string;
  subtitle?: string;
  scrollY?: SharedValue<number>;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
}

export function FloatingHeader({
  title,
  subtitle,
  scrollY,
  rightAction,
}: FloatingHeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const headerStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      backgroundColor: `rgba(255, 255, 255, ${opacity * 0.95})`,
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingTop: insets.top },
        headerStyle,
      ]}
    >
      <LinearGradient
        colors={colorScheme === 'dark' ? Gradients.forest : Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <View style={styles.logoContainer}>
              <Ionicons name="leaf" size={28} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>

          {rightAction && (
            <Animated.View>
              <Ionicons
                name={rightAction.icon}
                size={24}
                color="#FFFFFF"
                onPress={rightAction.onPress}
              />
            </Animated.View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  gradient: {
    paddingBottom: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});