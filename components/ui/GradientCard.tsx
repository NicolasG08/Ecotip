// components/ui/GradientCard.tsx
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface GradientCardProps {
  children: React.ReactNode;
  colors?: string[];
  style?: ViewStyle;
  onPress?: () => void;
  glowColor?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GradientCard({ 
  children, 
  colors = ['#FFFFFF', '#F5F5F5'],
  style,
  onPress,
  glowColor,
}: GradientCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const shadowStyle = glowColor ? Shadows.glow(glowColor) : Shadows.md;

  const content = (
    <LinearGradient
      colors={colors as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {children}
    </LinearGradient>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, shadowStyle, animatedStyle, style]}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return (
    <Animated.View style={[styles.container, shadowStyle, animatedStyle, style]}>
      {content}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  gradient: {
    padding: Spacing.xl,
  },
});