import {
    Colors,
    Gradients,
    Shadows,
    Spacing,
    Typography
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideOutDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ActionSheetProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: string[];
    selectedValue?: string;
    onSelect: (value: string) => void;
}

function OptionRow({
    label,
    isSelected,
    isLast,
    onPress,
}: {
    label: string;
    isSelected: boolean;
    isLast: boolean;
    onPress: () => void;
}) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={animStyle}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPressIn={() => {
                    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
                }}
                onPressOut={() => {
                    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
                }}
                onPress={onPress}
                style={[
                    styles.optionRow,
                    {
                        backgroundColor: isSelected
                            ? colors.primary + '14'
                            : colorScheme === 'dark'
                                ? 'rgba(255,255,255,0.04)'
                                : 'rgba(0,0,0,0.02)',
                        borderColor: isSelected ? colors.primary + '30' : 'transparent',
                    },
                ]}
            >
                {/* Selected indicator dot */}
                <View
                    style={[
                        styles.radioOuter,
                        {
                            borderColor: isSelected ? colors.primary : colors.border,
                            backgroundColor: isSelected ? colors.primary + '10' : 'transparent',
                        },
                    ]}
                >
                    {isSelected && (
                        <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                    )}
                </View>

                <Text
                    style={[
                        styles.optionLabel,
                        {
                            color: isSelected ? colors.primary : colors.text,
                            fontWeight: isSelected
                                ? Typography.weight.bold
                                : Typography.weight.medium,
                        },
                    ]}
                >
                    {label}
                </Text>

                {isSelected && (
                    <Animated.View entering={FadeIn.duration(200)}>
                        <LinearGradient
                            colors={Gradients.primary as any}
                            style={styles.checkBadge}
                        >
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        </LinearGradient>
                    </Animated.View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}

export function ActionSheet({
    visible,
    onClose,
    title,
    options,
    selectedValue,
    onSelect,
}: ActionSheetProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const insets = useSafeAreaInsets();

    if (!visible) return null;

    return (
        <Modal visible transparent animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                {/* Backdrop */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <Animated.View
                        entering={FadeIn.duration(250)}
                        exiting={FadeOut.duration(200)}
                        style={styles.backdrop}
                    />
                </TouchableWithoutFeedback>

                {/* Sheet */}
                <Animated.View
                    entering={SlideInDown.springify().damping(18).stiffness(140).mass(0.8)}
                    exiting={SlideOutDown.duration(250)}
                    style={[
                        styles.sheet,
                        {
                            backgroundColor:
                                colorScheme === 'dark'
                                    ? 'rgba(26,46,26,0.97)'
                                    : 'rgba(255,255,255,0.97)',
                            paddingBottom: Math.max(insets.bottom, Spacing.xl) + Spacing.md,
                        },
                    ]}
                >
                    {/* Drag handle */}
                    <View style={styles.handleContainer}>
                        <View
                            style={[
                                styles.handle,
                                {
                                    backgroundColor:
                                        colorScheme === 'dark'
                                            ? 'rgba(255,255,255,0.15)'
                                            : 'rgba(0,0,0,0.12)',
                                },
                            ]}
                        />
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <LinearGradient
                                colors={Gradients.primary as any}
                                style={styles.headerIconBg}
                            >
                                <Ionicons name="options" size={16} color="#FFFFFF" />
                            </LinearGradient>
                            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            style={[
                                styles.closeBtn,
                                {
                                    backgroundColor:
                                        colorScheme === 'dark'
                                            ? 'rgba(255,255,255,0.08)'
                                            : 'rgba(0,0,0,0.05)',
                                },
                            ]}
                        >
                            <Ionicons name="close" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Options */}
                    <View style={styles.optionsList}>
                        {options.map((option, index) => (
                            <OptionRow
                                key={option}
                                label={option}
                                isSelected={option === selectedValue}
                                isLast={index === options.length - 1}
                                onPress={() => {
                                    onSelect(option);
                                    onClose();
                                }}
                            />
                        ))}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
        width: '100%',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: Spacing.xl,
        ...Shadows.float,
    },
    handleContainer: {
        alignItems: 'center',
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Spacing.md,
        paddingBottom: Spacing.lg,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    headerIconBg: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        letterSpacing: -0.3,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionsList: {
        gap: Spacing.sm,
        paddingBottom: Spacing.sm,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.lg,
        borderRadius: 16,
        borderWidth: 1.5,
        gap: Spacing.md,
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    optionLabel: {
        flex: 1,
        fontSize: Typography.size.md,
        letterSpacing: -0.2,
    },
    checkBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
