import {
    BorderRadius,
    Colors,
    Palette,
    Shadows,
    Spacing,
    Typography,
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
    Easing,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  colors?: string[];
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function StatCard({
  icon,
  value,
  label,
  colors = [Palette.green.light, Palette.green.main],
  trend,
  trendValue,
}: StatCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  
  const animatedValue = useSharedValue(0);

  React.useEffect(() => {
    const numericValue = typeof value === 'number' ? value : parseInt(value) || 0;
    
    animatedValue.value = withTiming(numericValue, {
      duration: 1500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [value]);

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return Palette.green.vibrant;
      case 'down': return Palette.red.main;
      default: return themeColors.textSecondary;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'remove';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surface }, Shadows.sm]}>
      {/* Colored accent bar at top */}
      <LinearGradient
        colors={colors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentBar}
      />

      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors[0] }]}>
          <Ionicons name={icon} size={20} color="#FFFFFF" />
        </View>

        {/* Value */}
        <Text style={[styles.value, { color: themeColors.text }]}>
          {value}
        </Text>

        {/* Label */}
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>
          {label}
        </Text>

        {/* Trend */}
        {trend && trendValue && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={getTrendIcon()}
              size={14}
              color={getTrendColor()}
            />
            <Text style={[styles.trendValue, { color: getTrendColor() }]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    minWidth: 140,
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  value: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.size.xs,
    textAlign: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  trendValue: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
    marginLeft: 4,
  },
});