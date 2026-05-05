import {
  Colors,
  Gradients,
  Shadows,
  Spacing,
  Typography,
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ExpoSplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Logo size adapts to screen width (28% of screen, clamped)
const LOGO_SIZE = Math.min(Math.max(width * 0.28, 100), 160);
const ICON_SIZE = LOGO_SIZE * 0.5;

// Native splash background colors (must match app.json exactly)
const NATIVE_BG_LIGHT = '#E8F5E9';
const NATIVE_BG_DARK = '#0F4035';

interface SplashScreenProps {
  isReady?: boolean;
  onFinished?: () => void;
}

export default function SplashScreen({ isReady = false, onFinished }: SplashScreenProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const hasHiddenNative = useRef(false);

  const nativeBg = colorScheme === 'dark' ? NATIVE_BG_DARK : NATIVE_BG_LIGHT;

  // Start fully visible to match native splash
  const logoOpacity = useSharedValue(1);
  const textOpacity = useSharedValue(1);
  const taglineOpacity = useSharedValue(1);
  const leafRotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const dotsOpacity = useSharedValue(0);

  // Transition: solid bg → gradient + decorations
  const transitionProgress = useSharedValue(0);

  // Fade-out overlay
  const containerOpacity = useSharedValue(1);

  const hideNativeSplash = useCallback(async () => {
    if (!hasHiddenNative.current) {
      hasHiddenNative.current = true;
      await ExpoSplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    // Hide native splash quickly once this component has painted
    const timer = setTimeout(() => {
      hideNativeSplash();
    }, 50);

    // After hiding native splash, animate in the enhanced design
    // Delay the transition so the native → RN swap is invisible
    transitionProgress.value = withDelay(
      300,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
    );

    // Subtle leaf swing (starts after transition)
    leafRotation.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(8, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    // Gentle pulse
    pulseScale.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(1.04, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    // Loading dots appear after transition
    dotsOpacity.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.3, { duration: 800 })
        ),
        -1,
        true
      )
    );

    return () => clearTimeout(timer);
  }, []);

  // Fade out when app is ready
  useEffect(() => {
    if (isReady && onFinished) {
      containerOpacity.value = withTiming(
        0,
        { duration: 400, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) {
            runOnJS(onFinished)();
          }
        }
      );
    }
  }, [isReady, onFinished]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  // Solid bg fades out as gradient fades in
  const solidBgStyle = useAnimatedStyle(() => ({
    opacity: 1 - transitionProgress.value,
  }));

  // Gradient fades in
  const gradientStyle = useAnimatedStyle(() => ({
    opacity: transitionProgress.value,
  }));

  // Decorative circles fade in with transition
  const decorationsStyle = useAnimatedStyle(() => ({
    opacity: transitionProgress.value * 0.15,
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  const leafAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${leafRotation.value}deg` }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const dotsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dotsOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Layer 1: Solid background matching native splash (visible initially) */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: nativeBg }, solidBgStyle]}
      />

      {/* Layer 2: Gradient background (fades in after native splash hides) */}
      <Animated.View style={[StyleSheet.absoluteFillObject, gradientStyle]}>
        <LinearGradient
          colors={
            colorScheme === 'dark'
              ? ['#0F4035', '#004D40', '#263238']
              : ['#E8F5E9', '#C8E6C9', '#A5D6A7']
          }
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Layer 3: Decorative circles (fade in with gradient) */}
      <Animated.View style={[styles.decorations, decorationsStyle]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={[
              styles.floatingCircle,
              {
                left: `${(i * 67 + 23) % 100}%` as any,
                top: `${(i * 43 + 11) % 50}%` as any,
                width: 30 + (i * 17) % 50,
                height: 30 + (i * 17) % 50,
                backgroundColor: [
                  '#7ED957',
                  '#64B5F6',
                  '#FFF59D',
                  '#FFB74D',
                  '#7ED957',
                  '#64B5F6',
                ][i],
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Center content — logo + text + tagline centered on screen */}
      <View style={styles.content}>
        <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
          <Animated.View style={leafAnimatedStyle}>
            <LinearGradient
              colors={Gradients.primary}
              style={[
                styles.logoGradient,
                {
                  width: LOGO_SIZE,
                  height: LOGO_SIZE,
                  borderRadius: LOGO_SIZE / 2,
                },
              ]}
            >
              <Ionicons name="leaf" size={ICON_SIZE} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>
        </Animated.View>

        <Animated.Text
          style={[styles.appName, { color: colors.text }, textAnimatedStyle]}
        >
          Ecotip
        </Animated.Text>

        <Animated.Text
          style={[styles.tagline, { color: colors.textSecondary }, taglineAnimatedStyle]}
        >
          Tu compañero de reciclaje
        </Animated.Text>
      </View>

      {/* Loading dots at bottom */}
      <Animated.View style={[styles.loadingDots, { bottom: insets.bottom + 60 }, dotsAnimatedStyle]}>
        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        <View style={[styles.dot, { backgroundColor: colors.primary, opacity: 0.7 }]} />
        <View style={[styles.dot, { backgroundColor: colors.primary, opacity: 0.4 }]} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  decorations: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 100,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    marginBottom: Spacing.xl,
    ...Shadows.lg,
  },
  logoGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  appName: {
    fontSize: Typography.size.display,
    fontWeight: Typography.weight.black,
    marginBottom: Spacing.xs,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: Typography.size.md,
  },
  loadingDots: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
