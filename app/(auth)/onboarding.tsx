import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { auth, db } from '@/config/firebase';
import {
    BorderRadius,
    Colors,
    Gradients,
    Palette,
    Spacing,
    Typography,
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    SlideInRight,
    SlideOutLeft
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 5;

// --- Datos de cada paso ---
const INTERESTS = [
    { id: 'plastic', label: 'Reducir plástico', icon: 'water-outline', color: Palette.blue.main },
    { id: 'compost', label: 'Compostaje', icon: 'leaf-outline', color: Palette.green.main },
    { id: 'water', label: 'Ahorro de agua', icon: 'rainy-outline', color: Palette.blue.dark },
    { id: 'electronics', label: 'Reciclaje electrónico', icon: 'phone-portrait-outline', color: Palette.purple.main },
    { id: 'fashion', label: 'Moda sostenible', icon: 'shirt-outline', color: Palette.orange.main },
    { id: 'energy', label: 'Ahorro energético', icon: 'flash-outline', color: Palette.yellow.dark },
];

const EXPERIENCE_LEVELS = [
    { id: 'none', label: 'Nada', emoji: '🌱', description: 'Soy nuevo en esto' },
    { id: 'little', label: 'Un poco', emoji: '🌿', description: 'He reciclado algunas veces' },
    { id: 'normal', label: 'Lo normal', emoji: '🌳', description: 'Reciclo regularmente' },
    { id: 'lot', label: 'Bastante', emoji: '🏔️', description: 'Llevo un estilo eco' },
    { id: 'expert', label: 'Soy experto', emoji: '🌍', description: 'El reciclaje es mi vida' },
];

const WEEKLY_GOALS = [
    { id: 5, label: '5 items', description: 'Empezando tranquilo', icon: 'leaf-outline', color: Palette.green.light },
    { id: 10, label: '10 items', description: 'Buen ritmo', icon: 'trending-up-outline', color: Palette.green.main },
    { id: 20, label: '20 items', description: 'Comprometido', icon: 'flame-outline', color: Palette.orange.main },
    { id: 50, label: '50 items', description: 'Eco guerrero', icon: 'rocket-outline', color: Palette.red.main },
];

export default function OnboardingScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const insets = useSafeAreaInsets();

    const [step, setStep] = useState(0);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
    const [weeklyGoal, setWeeklyGoal] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const userName = auth.currentUser?.displayName?.split(' ')[0] || 'Amigo';

    const toggleInterest = (id: string) => {
        setSelectedInterests(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const canProceed = () => {
        switch (step) {
            case 0: return true; // Bienvenida
            case 1: return selectedInterests.length > 0;
            case 2: return experienceLevel !== null;
            case 3: return weeklyGoal !== null;
            case 4: return true; // Listo
            default: return false;
        }
    };

    const handleNext = () => {
        if (step < TOTAL_STEPS - 1) {
            setStep(step + 1);
        }
    };

    const handleFinish = async () => {
        setIsSaving(true);
        const user = auth.currentUser;

        if (user) {
            try {
                // Timeout de 6 segundos para evitar pantalla de carga infinita si Firebase falla offline
                const timeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('timeout')), 6000)
                );

                const savePromise = setDoc(doc(db, 'users', user.uid), {
                    onboardingCompleted: true,
                    interests: selectedInterests,
                    experienceLevel,
                    weeklyGoal,
                    name: user.displayName || 'Usuario',
                    email: user.email || '',
                    uid: user.uid,
                }, { merge: true });

                await Promise.race([savePromise, timeout]);
            } catch (err) {
                console.warn('Onboarding save failed or timed out:', err);
            }
        }

        setIsSaving(false);
        router.replace('/(tabs)/challenges');
    };

    // --- Paso 0: Bienvenida ---
    const renderWelcome = () => (
        <Animated.View
            key="welcome"
            entering={FadeInDown.springify()}
            exiting={SlideOutLeft.duration(300)}
            style={styles.stepContainer}
        >
            <View style={styles.emojiContainer}>
                <LinearGradient
                    colors={Gradients.primary as any}
                    style={styles.bigIconCircle}
                >
                    <Ionicons name="leaf" size={64} color="#FFFFFF" />
                </LinearGradient>
            </View>

            <Text style={[styles.bigTitle, { color: colors.text }]}>
                ¡Hola, {userName}! 🌱
            </Text>
            <Text style={[styles.bigSubtitle, { color: colors.textSecondary }]}>
                Bienvenido a Ecotip, tu compañero para hacer del mundo un lugar más verde.
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
                Vamos a personalizar tu experiencia en solo unos pasos.
            </Text>
        </Animated.View>
    );

    // --- Paso 1: Intereses ---
    const renderInterests = () => (
        <Animated.View
            key="interests"
            entering={SlideInRight.duration(300)}
            exiting={SlideOutLeft.duration(300)}
            style={styles.stepContainer}
        >
            <Text style={[styles.stepTitle, { color: colors.text }]}>
                ¿Qué te interesa? 🎯
            </Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
                Selecciona los temas que más te motivan (puedes elegir varios)
            </Text>

            <View style={styles.interestsGrid}>
                {INTERESTS.map((interest, index) => {
                    const selected = selectedInterests.includes(interest.id);
                    return (
                        <Animated.View
                            key={interest.id}
                            entering={FadeInDown.delay(index * 80).springify()}
                        >
                            <TouchableOpacity
                                onPress={() => toggleInterest(interest.id)}
                                style={[
                                    styles.interestCard,
                                    {
                                        backgroundColor: selected
                                            ? interest.color + '20'
                                            : colors.surface,
                                        borderColor: selected
                                            ? interest.color
                                            : colors.border,
                                    },
                                ]}
                                activeOpacity={0.7}
                            >
                                <View
                                    style={[
                                        styles.interestIcon,
                                        { backgroundColor: interest.color + '20' },
                                    ]}
                                >
                                    <Ionicons
                                        name={interest.icon as any}
                                        size={24}
                                        color={interest.color}
                                    />
                                </View>
                                <Text
                                    style={[
                                        styles.interestLabel,
                                        {
                                            color: selected ? interest.color : colors.text,
                                            fontWeight: selected ? Typography.weight.bold : Typography.weight.medium,
                                        },
                                    ]}
                                >
                                    {interest.label}
                                </Text>
                                {selected && (
                                    <View style={[styles.checkBadge, { backgroundColor: interest.color }]}>
                                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>
        </Animated.View>
    );

    // --- Paso 2: Experiencia ---
    const renderExperience = () => (
        <Animated.View
            key="experience"
            entering={SlideInRight.duration(300)}
            exiting={SlideOutLeft.duration(300)}
            style={styles.stepContainer}
        >
            <Text style={[styles.stepTitle, { color: colors.text }]}>
                ¿Cuánto reciclas? ♻️
            </Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
                Así sabremos desde dónde empezar contigo
            </Text>

            <View style={styles.experienceList}>
                {EXPERIENCE_LEVELS.map((level, index) => {
                    const selected = experienceLevel === level.id;
                    return (
                        <Animated.View
                            key={level.id}
                            entering={FadeInDown.delay(index * 100).springify()}
                        >
                            <TouchableOpacity
                                onPress={() => setExperienceLevel(level.id)}
                                style={[
                                    styles.experienceCard,
                                    {
                                        backgroundColor: selected
                                            ? Palette.green.main + '15'
                                            : colors.surface,
                                        borderColor: selected
                                            ? Palette.green.main
                                            : colors.border,
                                    },
                                ]}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.experienceEmoji}>{level.emoji}</Text>
                                <View style={styles.experienceInfo}>
                                    <Text
                                        style={[
                                            styles.experienceLabel,
                                            {
                                                color: selected ? Palette.green.main : colors.text,
                                                fontWeight: selected ? Typography.weight.bold : Typography.weight.medium,
                                            },
                                        ]}
                                    >
                                        {level.label}
                                    </Text>
                                    <Text style={[styles.experienceDesc, { color: colors.textSecondary }]}>
                                        {level.description}
                                    </Text>
                                </View>
                                {selected && (
                                    <View style={[styles.radioSelected, { borderColor: Palette.green.main }]}>
                                        <View style={[styles.radioInner, { backgroundColor: Palette.green.main }]} />
                                    </View>
                                )}
                                {!selected && (
                                    <View style={[styles.radioUnselected, { borderColor: colors.border }]} />
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>
        </Animated.View>
    );

    // --- Paso 3: Meta semanal ---
    const renderGoal = () => (
        <Animated.View
            key="goal"
            entering={SlideInRight.duration(300)}
            exiting={SlideOutLeft.duration(300)}
            style={styles.stepContainer}
        >
            <Text style={[styles.stepTitle, { color: colors.text }]}>
                Tu meta semanal 🎯
            </Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
                ¿Cuántos items te gustaría reciclar por semana?
            </Text>

            <View style={styles.goalsGrid}>
                {WEEKLY_GOALS.map((goal, index) => {
                    const selected = weeklyGoal === goal.id;
                    return (
                        <Animated.View
                            key={goal.id}
                            entering={FadeInDown.delay(index * 100).springify()}
                        >
                            <TouchableOpacity
                                onPress={() => setWeeklyGoal(goal.id)}
                                style={[
                                    styles.goalCard,
                                    {
                                        backgroundColor: selected
                                            ? goal.color + '20'
                                            : colors.surface,
                                        borderColor: selected
                                            ? goal.color
                                            : colors.border,
                                    },
                                ]}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.goalIconCircle, { backgroundColor: goal.color + '20' }]}>
                                    <Ionicons name={goal.icon as any} size={28} color={goal.color} />
                                </View>
                                <Text
                                    style={[
                                        styles.goalLabel,
                                        {
                                            color: selected ? goal.color : colors.text,
                                            fontWeight: selected ? Typography.weight.bold : Typography.weight.semibold,
                                        },
                                    ]}
                                >
                                    {goal.label}
                                </Text>
                                <Text style={[styles.goalDesc, { color: colors.textSecondary }]}>
                                    {goal.description}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>
        </Animated.View>
    );

    // --- Paso 4: ¡Listo! ---
    const renderReady = () => (
        <Animated.View
            key="ready"
            entering={FadeIn.duration(400)}
            style={styles.stepContainer}
        >
            <View style={styles.emojiContainer}>
                <LinearGradient
                    colors={Gradients.primary as any}
                    style={styles.bigIconCircle}
                >
                    <Ionicons name="rocket" size={64} color="#FFFFFF" />
                </LinearGradient>
            </View>

            <Text style={[styles.bigTitle, { color: colors.text }]}>
                ¡Todo listo! 🚀
            </Text>
            <Text style={[styles.bigSubtitle, { color: colors.textSecondary }]}>
                Tu perfil está configurado. Ahora estás listo para empezar a hacer la diferencia.
            </Text>

            <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.summaryContainer}>
                <LinearGradient
                    colors={[colors.surface, colors.surface] as any}
                    style={[styles.summaryCard, { borderColor: colors.border }]}
                >
                    <View style={styles.summaryRow}>
                        <Ionicons name="heart" size={20} color={Palette.red.main} />
                        <Text style={[styles.summaryText, { color: colors.text }]}>
                            {selectedInterests.length} intereses seleccionados
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Ionicons name="fitness" size={20} color={Palette.green.main} />
                        <Text style={[styles.summaryText, { color: colors.text }]}>
                            Nivel: {EXPERIENCE_LEVELS.find(l => l.id === experienceLevel)?.label}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Ionicons name="flag" size={20} color={Palette.blue.main} />
                        <Text style={[styles.summaryText, { color: colors.text }]}>
                            Meta: {weeklyGoal} items/semana
                        </Text>
                    </View>
                </LinearGradient>
            </Animated.View>
        </Animated.View>
    );

    const renderStep = () => {
        switch (step) {
            case 0: return renderWelcome();
            case 1: return renderInterests();
            case 2: return renderExperience();
            case 3: return renderGoal();
            case 4: return renderReady();
            default: return null;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient
                colors={Gradients.primary as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}
            >
                {/* Progress bar */}
                <View style={styles.progressContainer}>
                    {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.progressDot,
                                {
                                    backgroundColor:
                                        i <= step ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                                    width: i === step ? 28 : 10,
                                },
                            ]}
                        />
                    ))}
                </View>
                <Text style={styles.progressText}>
                    {step + 1} de {TOTAL_STEPS}
                </Text>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {renderStep()}
            </ScrollView>

            {/* Botones de navegación */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
                {step > 0 && step < TOTAL_STEPS - 1 && (
                    <TouchableOpacity
                        onPress={() => setStep(step - 1)}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
                        <Text style={[styles.backText, { color: colors.textSecondary }]}>Atrás</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.nextButtonContainer}>
                    {step < TOTAL_STEPS - 1 ? (
                        <AnimatedButton
                            title={step === 0 ? '¡Vamos!' : 'Siguiente'}
                            onPress={handleNext}
                            icon="arrow-forward"
                            iconPosition="right"
                            disabled={!canProceed()}
                        />
                    ) : (
                        <AnimatedButton
                            title="¡Comenzar!"
                            onPress={handleFinish}
                            loading={isSaving}
                            icon="rocket-outline"
                            iconPosition="right"
                        />
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.lg,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    progressDot: {
        height: 10,
        borderRadius: 5,
    },
    progressText: {
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        fontSize: Typography.size.sm,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.xl,
    },
    stepContainer: {
        flex: 1,
        alignItems: 'center',
    },
    emojiContainer: {
        marginBottom: Spacing.xl,
        marginTop: Spacing.xl,
    },
    bigIconCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bigTitle: {
        fontSize: Typography.size.display,
        fontWeight: Typography.weight.black,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    bigSubtitle: {
        fontSize: Typography.size.lg,
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },
    description: {
        fontSize: Typography.size.md,
        textAlign: 'center',
        lineHeight: 22,
    },
    stepTitle: {
        fontSize: Typography.size.xxl,
        fontWeight: Typography.weight.bold,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    stepSubtitle: {
        fontSize: Typography.size.md,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        paddingHorizontal: Spacing.md,
    },
    // Intereses
    interestsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: Spacing.md,
        width: '100%',
    },
    interestCard: {
        width: (width - Spacing.xl * 2 - Spacing.md) / 2 - 2,
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 2,
        alignItems: 'center',
        position: 'relative',
    },
    interestIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    interestLabel: {
        fontSize: Typography.size.sm,
        textAlign: 'center',
    },
    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Experiencia
    experienceList: {
        width: '100%',
        gap: Spacing.sm,
    },
    experienceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.xl,
        borderWidth: 2,
    },
    experienceEmoji: {
        fontSize: 32,
        marginRight: Spacing.md,
    },
    experienceInfo: {
        flex: 1,
    },
    experienceLabel: {
        fontSize: Typography.size.md,
        marginBottom: 2,
    },
    experienceDesc: {
        fontSize: Typography.size.sm,
    },
    radioSelected: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    radioUnselected: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
    },
    // Metas
    goalsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: Spacing.md,
        width: '100%',
    },
    goalCard: {
        width: (width - Spacing.xl * 2 - Spacing.md) / 2 - 2,
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 2,
        alignItems: 'center',
    },
    goalIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    goalLabel: {
        fontSize: Typography.size.lg,
        marginBottom: 4,
    },
    goalDesc: {
        fontSize: Typography.size.xs,
        textAlign: 'center',
    },
    // Resumen final
    summaryContainer: {
        width: '100%',
        marginTop: Spacing.xl,
    },
    summaryCard: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        gap: Spacing.md,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    summaryText: {
        fontSize: Typography.size.md,
    },
    // Footer
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
        gap: Spacing.md,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
    },
    backText: {
        fontSize: Typography.size.md,
        marginLeft: Spacing.xs,
    },
    nextButtonContainer: {
        flex: 1,
    },
});
