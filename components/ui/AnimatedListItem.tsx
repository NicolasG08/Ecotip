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
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeInRight,
    Layout,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

interface AnimatedListItemProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColors?: string[];
  rightElement?: React.ReactNode;
  onPress?: () => void;
  index?: number;
  completed?: boolean;
  points?: number;
}

export function AnimatedListItem({
  title,
  subtitle,
  icon,
  iconColors = [Palette.green.main, Palette.green.light],
  rightElement,
  onPress,
  index = 0,
  completed = false,
  points,
}: AnimatedListItemProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).springify()}
      layout={Layout.springify()}
      style={animatedStyle}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={[
          styles.container,
          { backgroundColor: colors.surface },
          completed && styles.completedContainer,
        ]}
      >
        {/* Icon */}
        {icon && (
          <LinearGradient
            colors={completed ? [Palette.green.light, Palette.green.main] : (iconColors as any)}
            style={styles.iconContainer}
          >
            <Ionicons
              name={completed ? 'checkmark' : icon}
              size={20}
              color="#FFFFFF"
            />
          </LinearGradient>
        )}

        {/* Content */}
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
              completed && styles.completedText,
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>
          
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}

          {points !== undefined && (
            <View style={styles.pointsContainer}>
              <Ionicons name="star" size={14} color={Palette.yellow.gold} />
              <Text style={[styles.points, { color: Palette.yellow.dark }]}>
                {points} pts
              </Text>
            </View>
          )}
        </View>

        {/* Right Element */}
        {rightElement || (
          completed && (
            <View style={[styles.completedBadge, { backgroundColor: Palette.green.light }]}>
              <Ionicons name="checkmark" size={20} color={Palette.green.dark} />
            </View>
          )
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  completedContainer: {
    opacity: 0.8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.medium,
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  subtitle: {
    fontSize: Typography.size.sm,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  points: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    marginLeft: 4,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});