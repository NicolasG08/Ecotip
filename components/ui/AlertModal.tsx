import {
    Colors,
    Gradients,
    Palette,
    Shadows,
    Spacing,
    Typography
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInUp,
    FadeOut,
    ZoomIn,
} from 'react-native-reanimated';

export interface AlertModalProps {
    visible: boolean;
    title: string;
    message: string;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    iconGradient?: string[];
    primaryButtonText?: string;
    secondaryButtonText?: string;
    onPrimaryPress?: () => void;
    onSecondaryPress?: () => void;
    onClose?: () => void;
    danger?: boolean;
}

export function AlertModal({
    visible,
    title,
    message,
    icon = 'information-circle',
    iconColor,
    iconGradient,
    primaryButtonText = 'Aceptar',
    secondaryButtonText,
    onPrimaryPress,
    onSecondaryPress,
    onClose,
    danger = false,
}: AlertModalProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    if (!visible) return null;

    const defaultIconColor = danger ? Palette.red.main : colors.primary;
    const gradientColors = iconGradient || (danger
        ? [Palette.red.light, Palette.red.main]
        : [...Gradients.primary]);

    const primaryBtnColors = danger
        ? [Palette.red.main, Palette.red.dark]
        : [...Gradients.primary];

    return (
        <Modal
            visible
            transparent
            animationType="none"
            onRequestClose={onClose || onSecondaryPress || onPrimaryPress}
        >
            <View style={styles.overlay}>
                {/* Backdrop */}
                <TouchableWithoutFeedback
                    onPress={onClose || onSecondaryPress || onPrimaryPress}
                >
                    <Animated.View
                        entering={FadeIn.duration(250)}
                        exiting={FadeOut.duration(200)}
                        style={styles.backdrop}
                    />
                </TouchableWithoutFeedback>

                {/* Card */}
                <Animated.View
                    entering={ZoomIn.springify().damping(16).stiffness(180).mass(0.7)}
                    style={[
                        styles.card,
                        {
                            backgroundColor:
                                colorScheme === 'dark'
                                    ? 'rgba(26,46,26,0.97)'
                                    : 'rgba(255,255,255,0.98)',
                        },
                    ]}
                >
                    {/* Icon ring */}
                    <Animated.View
                        entering={FadeInUp.delay(100).springify().damping(14)}
                        style={styles.iconWrapper}
                    >
                        {/* Outer glow ring */}
                        <View
                            style={[
                                styles.iconGlow,
                                {
                                    backgroundColor: (iconGradient?.[0] || defaultIconColor) + '15',
                                },
                            ]}
                        >
                            <LinearGradient
                                colors={gradientColors as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.iconCircle}
                            >
                                <Ionicons name={icon} size={30} color="#FFFFFF" />
                            </LinearGradient>
                        </View>
                    </Animated.View>

                    {/* Title */}
                    <Animated.Text
                        entering={FadeInUp.delay(150).springify().damping(14)}
                        style={[styles.title, { color: colors.text }]}
                    >
                        {title}
                    </Animated.Text>

                    {/* Message */}
                    <Animated.Text
                        entering={FadeInUp.delay(200).springify().damping(14)}
                        style={[styles.message, { color: colors.textSecondary }]}
                    >
                        {message}
                    </Animated.Text>

                    {/* Buttons */}
                    <Animated.View
                        entering={FadeInUp.delay(250).springify().damping(14)}
                        style={styles.buttonContainer}
                    >
                        {/* Primary */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={onPrimaryPress || onClose || (() => { })}
                            style={styles.primaryBtnOuter}
                        >
                            <LinearGradient
                                colors={primaryBtnColors as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.primaryBtn}
                            >
                                <Text style={styles.primaryBtnText}>{primaryButtonText}</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Secondary */}
                        {secondaryButtonText && (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={onSecondaryPress || onClose || (() => { })}
                                style={[
                                    styles.secondaryBtn,
                                    {
                                        backgroundColor:
                                            colorScheme === 'dark'
                                                ? 'rgba(255,255,255,0.06)'
                                                : 'rgba(0,0,0,0.04)',
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.secondaryBtnText,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    {secondaryButtonText}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </Animated.View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxl,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    card: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 28,
        paddingTop: Spacing.xxl + Spacing.sm,
        paddingBottom: Spacing.xl,
        paddingHorizontal: Spacing.xl,
        alignItems: 'center',
        ...Shadows.float,
    },
    iconWrapper: {
        marginBottom: Spacing.lg,
    },
    iconGlow: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.md,
    },
    title: {
        fontSize: Typography.size.xl,
        fontWeight: Typography.weight.bold,
        textAlign: 'center',
        marginBottom: Spacing.sm,
        letterSpacing: -0.3,
    },
    message: {
        fontSize: Typography.size.md,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.xl,
        paddingHorizontal: Spacing.xs,
    },
    buttonContainer: {
        width: '100%',
        gap: Spacing.sm,
    },
    primaryBtnOuter: {
        borderRadius: 16,
        overflow: 'hidden',
        ...Shadows.sm,
    },
    primaryBtn: {
        paddingVertical: 15,
        paddingHorizontal: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.bold,
        letterSpacing: -0.2,
    },
    secondaryBtn: {
        paddingVertical: 14,
        paddingHorizontal: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    secondaryBtnText: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.semibold,
        letterSpacing: -0.2,
    },
});
