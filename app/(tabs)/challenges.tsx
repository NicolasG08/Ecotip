import { AlertModal } from '@/components/ui/AlertModal';
import { AnimatedListItem } from '@/components/ui/AnimatedListItem';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { GradientCard } from '@/components/ui/GradientCard';
import { IconBadge } from '@/components/ui/IconBadge';
import { StatCard } from '@/components/ui/StatCard';
import {
  BorderRadius,
  Colors,
  Gradients,
  Palette,
  Spacing,
  Typography
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '@/store/AppProvider';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Map challenge IDs to tab routes for navigation
const CHALLENGE_NAV_MAP: Record<number, { route: string; label: string }> = {
  1: { route: '/(tabs)/map', label: 'Mapa' },
  2: { route: '/(tabs)/map', label: 'Mapa' },
  3: { route: '/(tabs)/map', label: 'Mapa' },
  4: { route: '/(tabs)/social', label: 'Social' },
  5: { route: '/(tabs)/education', label: 'Aprende' },
  6: { route: '/(tabs)/map', label: 'Mapa' },
  7: { route: '/(tabs)/map', label: 'Mapa' },
};

export default function ChallengesScreen() {
  const { challenges, completeChallenge, user, achievements, addNotification } = useAppStore();
  const dailyChallenges = challenges.filter(c => c.type === 'daily');
  const weeklyChallenges = challenges.filter(c => c.type === 'weekly');

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [alertConfig, setAlertConfig] = useState<any>(null);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const completedDaily = dailyChallenges.filter((c) => c.completed).length;
  const completedAll = challenges.filter((c) => c.completed).length;
  const totalPoints = challenges.filter((c) => c.completed).reduce(
    (acc, c) => acc + c.points,
    0
  );
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  // Streak = number of daily challenges completed (simulated as ongoing streak)
  const streak = completedDaily;

  const handleChallengePress = (challengeId: number, completed: boolean) => {
    if (!completed) {
      // Complete then optionally navigate
      completeChallenge(challengeId);
      const nav = CHALLENGE_NAV_MAP[challengeId];
      if (nav) {
        setTimeout(() => {
          setAlertConfig({
            visible: true,
            title: '🎉 ¡Reto Completado!',
            message: `¡Bien hecho! Para seguir tus logros, puedes ir a la sección de ${nav.label}.`,
            icon: 'checkmark-circle',
            iconGradient: [...Gradients.primary],
            primaryButtonText: `Ir a ${nav.label}`,
            secondaryButtonText: 'Quedarme aquí',
            onPrimaryPress: () => {
              setAlertConfig(null);
              router.push(nav.route as any);
            },
            onSecondaryPress: () => setAlertConfig(null),
            onClose: () => setAlertConfig(null),
          });
        }, 300);
      }
    } else {
      // Already completed — navigate to relevant section
      const nav = CHALLENGE_NAV_MAP[challengeId];
      if (nav) {
        router.push(nav.route as any);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={Gradients.primary as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + Spacing.md }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <IconBadge
              icon="leaf"
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)'] as any}
              size="medium"
              animated
            />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Ecotip</Text>
              <Text style={styles.headerSubtitle}>¡Haz del mundo un lugar mejor!</Text>
            </View>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame-outline" size={20} color={Palette.orange.main} />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        </View>

        {/* Stats rápidas */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{completedDaily}/{dailyChallenges.length}</Text>
            <Text style={styles.quickStatLabel}>Hoy</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{totalPoints}</Text>
            <Text style={styles.quickStatLabel}>Puntos</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <TouchableOpacity style={styles.quickStatItem} onPress={() => router.push('/(tabs)/metrics' as any)}>
            <Text style={styles.quickStatValue}>{unlockedAchievements}/{achievements.length}</Text>
            <Text style={styles.quickStatLabel}>Logros</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Progreso del día */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <GradientCard
            colors={(colorScheme === 'dark' ? colors.cardChallenges : ['#FFFFFF', '#F8FFF8']) as any}
            glowColor={Palette.green.main}
          >
            <View style={styles.progressSection}>
              <CircularProgress
                progress={(completedDaily / dailyChallenges.length) * 100}
                size={100}
                label="Completado"
              />
              <View style={styles.progressInfo}>
                <Text style={[styles.progressTitle, { color: colors.text }]}>
                  {completedDaily === dailyChallenges.length ? '¡Todos completados! 🏆' : '¡Vas genial hoy! 🌟'}
                </Text>
                <Text style={[styles.progressSubtitle, { color: colors.textSecondary }]}>
                  {completedDaily === dailyChallenges.length
                    ? '¡Felicidades! Has completado todos los retos del día.'
                    : `Completa ${dailyChallenges.length - completedDaily} retos más para obtener el bonus diario`}
                </Text>
                <View style={styles.bonusBadge}>
                  <Ionicons name="gift-outline" size={16} color={Palette.yellow.gold} />
                  <Text style={styles.bonusText}>+50 puntos bonus</Text>
                </View>
              </View>
            </View>
          </GradientCard>
        </Animated.View>

        {/* Retos Diarios */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <IconBadge
                icon="today"
                size="small"
                colors={Gradients.primary as any}
              />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Retos Diarios
              </Text>
            </View>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Se reinician en 8h 24m
            </Text>
          </View>

          {dailyChallenges.map((challenge, index) => (
            <AnimatedListItem
              key={challenge.id}
              title={challenge.title}
              subtitle={CHALLENGE_NAV_MAP[challenge.id] ? `Ir a ${CHALLENGE_NAV_MAP[challenge.id].label}` : undefined}
              icon={challenge.icon as any}
              iconColors={challenge.colors}
              points={challenge.points}
              completed={challenge.completed}
              index={index}
              onPress={() => handleChallengePress(challenge.id, challenge.completed)}
            />
          ))}
        </Animated.View>

        {/* Retos Semanales */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <IconBadge
                icon="calendar"
                size="small"
                colors={Gradients.ocean as any}
              />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Retos Semanales
              </Text>
            </View>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              4 días restantes
            </Text>
          </View>

          {weeklyChallenges.map((challenge, index) => (
            <GradientCard
              key={challenge.id}
              colors={(colorScheme === 'dark' ? colors.cardMetrics : ['#FFFFFF', '#F0F8FF']) as any}
              style={styles.weeklyCard}
            >
              <View style={styles.weeklyContent}>
                <View style={styles.weeklyHeader}>
                  <IconBadge
                    icon={challenge.icon as any}
                    size="medium"
                    colors={challenge.colors as any}
                  />
                  <View style={styles.weeklyInfo}>
                    <Text style={[styles.weeklyTitle, { color: colors.text }]}>
                      {challenge.title}
                    </Text>
                    <View style={styles.weeklyPoints}>
                      <Ionicons name="star" size={14} color={Palette.yellow.gold} />
                      <Text style={[styles.weeklyPointsText, { color: Palette.yellow.dark }]}>
                        {challenge.points} pts
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.weeklyProgress}>
                  <View style={styles.weeklyProgressHeader}>
                    <Text style={[styles.weeklyProgressLabel, { color: colors.textSecondary }]}>
                      Progreso
                    </Text>
                    <Text style={[styles.weeklyProgressValue, { color: colors.primary }]}>
                      {challenge.progress}%
                    </Text>
                  </View>
                  <View style={[styles.weeklyProgressTrack, { backgroundColor: colors.border }]}>
                    <LinearGradient
                      colors={challenge.colors as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.weeklyProgressFill, { width: `${challenge.progress || 0}%` }]}
                    />
                  </View>
                </View>
              </View>
            </GradientCard>
          ))}
        </Animated.View>

        {/* Estadísticas resumen */}
        <Animated.View entering={FadeInUp.delay(500).springify()}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <IconBadge
                icon="trophy"
                size="small"
                colors={Gradients.gold as any}
              />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Tu Progreso
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              icon="checkmark-circle-outline"
              value={completedAll.toString()}
              label="Retos Completados"
              colors={[Palette.green.main, Palette.green.light]}
              trend="up"
              trendValue={`${completedAll} de ${challenges.length}`}
            />
            <StatCard
              icon="star-outline"
              value={user.xp.toString()}
              label="Puntos Totales"
              colors={[Palette.yellow.dark, Palette.yellow.main]}
              trend="up"
              trendValue={`Nivel ${user.level}`}
            />
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {/* Alert Modal */}
      {alertConfig && (
        <AlertModal
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          icon={alertConfig.icon}
          iconGradient={alertConfig.iconGradient}
          primaryButtonText={alertConfig.primaryButtonText}
          secondaryButtonText={alertConfig.secondaryButtonText}
          onPrimaryPress={alertConfig.onPrimaryPress}
          onSecondaryPress={alertConfig.onSecondaryPress}
          onClose={alertConfig.onClose}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
  },
  streakText: {
    color: '#FFFFFF',
    fontWeight: Typography.weight.bold,
    marginLeft: 4,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: '#FFFFFF',
  },
  quickStatLabel: {
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: Spacing.md,
  },
  scrollView: {
    flex: 1,
    marginTop: -BorderRadius.xl,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  progressTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
  },
  progressSubtitle: {
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  bonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.yellow.cream,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
  },
  bonusText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Palette.yellow.dark,
    marginLeft: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginLeft: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: Typography.size.sm,
  },
  weeklyCard: {
    marginBottom: Spacing.md,
  },
  weeklyContent: {},
  weeklyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  weeklyInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  weeklyTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.xs,
  },
  weeklyPoints: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weeklyPointsText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    marginLeft: 4,
  },
  weeklyProgress: {},
  weeklyProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  weeklyProgressLabel: {
    fontSize: Typography.size.sm,
  },
  weeklyProgressValue: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  weeklyProgressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  weeklyProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});