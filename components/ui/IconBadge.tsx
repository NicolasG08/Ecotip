import { Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface IconBadgeProps {
  icon: keyof typeof Ionicons.glyphMap;
  size?: 'small' | 'medium' | 'large';
  colors?: string[];
  iconColor?: string;
  animated?: boolean;
  pulse?: boolean;
  style?: ViewStyle;
}

export function IconBadge({
  icon,
  size = 'medium',
  colors = ['#4CAF50', '#81C784'],
  iconColor = '#FFFFFF',
  animated = false,
  pulse = false,
  style,
}: IconBadgeProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (pulse) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    }
    
    if (animated) {
      rotation.value = withDelay(
        Math.random() * 1000,
        withRepeat(
          withSequence(
            withTiming(10, { duration: 200 }),
            withTiming(-10, { duration: 400 }),
            withTiming(0, { duration: 200 })
          ),
          -1,
          true
        )
      );
    }
  }, [pulse, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { container: 36, icon: 18 };
      case 'large':
        return { container: 64, icon: 32 };
      default:
        return { container: 48, icon: 24 };
    }
  };

  const sizeConfig = getSizeConfig();

  return (
    <Animated.View style={[animatedStyle, style]}>
      <LinearGradient
        colors={colors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          Shadows.md,
          {
            width: sizeConfig.container,
            height: sizeConfig.container,
            borderRadius: sizeConfig.container / 2,
          },
        ]}
      >
        <Ionicons name={icon} size={sizeConfig.icon} color={iconColor} />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});