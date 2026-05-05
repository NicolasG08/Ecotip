// components/ui/AnimatedButton.tsx
import {
  BorderRadius,
  Colors,
  Gradients,
  Shadows,
  Spacing,
  Typography,
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnimatedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: AnimatedButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const getGradientColors = (): readonly string[] => {
    switch (variant) {
      case 'primary':
        return Gradients.primary;
      case 'secondary':
        return Gradients.ocean;
      case 'accent':
        return Gradients.sunrise;
      case 'outline':
      case 'ghost':
        return ['transparent', 'transparent'];
      default:
        return Gradients.primary;
    }
  };

  const getTextColor = () => {
    if (variant === 'outline' || variant === 'ghost') return colors.primary;
    return '#FFFFFF';
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md };
      case 'large':
        return { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxl };
      default:
        return { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 24;
      default: return 20;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return Typography.size.sm;
      case 'large': return Typography.size.lg;
      default: return Typography.size.md;
    }
  };

  const isOutline = variant === 'outline';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        isOutline && { borderWidth: 2, borderColor: colors.primary },
        variant !== 'ghost' && variant !== 'outline' && Shadows.md,
        animatedStyle,
        style,
      ]}
    >
      <LinearGradient
        colors={(disabled ? ['#E0E0E0', '#BDBDBD'] : getGradientColors()) as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, getSizeStyles()]}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Ionicons
                name={icon}
                size={getIconSize()}
                color={disabled ? '#9E9E9E' : getTextColor()}
                style={styles.iconLeft}
              />
            )}
            <Text
              style={[
                styles.text,
                { color: disabled ? '#9E9E9E' : getTextColor(), fontSize: getFontSize() },
              ]}
            >
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <Ionicons
                name={icon}
                size={getIconSize()}
                color={disabled ? '#9E9E9E' : getTextColor()}
                style={styles.iconRight}
              />
            )}
          </>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: Typography.weight.semibold,
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
});