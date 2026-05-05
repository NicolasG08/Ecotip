import { AlertModal } from '@/components/ui/AlertModal';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { GradientCard } from '@/components/ui/GradientCard';
import { IconBadge } from '@/components/ui/IconBadge';
import { StatCard } from '@/components/ui/StatCard';
import {
  BorderRadius,
  Colors,
  Gradients,
  Palette,
  Shadows,
  Spacing,
  Typography,
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '@/store/AppProvider';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Datos del gráfico semanal
const WEEKLY_DATA = [
  { day: 'L', value: 45, items: 12 },
  { day: 'M', value: 70, items: 18 },
  { day: 'X', value: 55, items: 14 },
  { day: 'J', value: 90, items: 24 },
  { day: 'V', value: 85, items: 22 },
  { day: 'S', value: 60, items: 15 },
  { day: 'D', value: 40, items: 10 },
];

// Desglose por categorías
const CATEGORY_BREAKDOWN = [
  { name: 'Plástico', value: 45, color: Palette.blue.main, icon: 'water' },
  { name: 'Papel', value: 25, color: Palette.yellow.dark, icon: 'newspaper' },
  { name: 'Vidrio', value: 15, color: Palette.green.main, icon: 'wine' },
  { name: 'Metal', value: 10, color: Palette.orange.main, icon: 'hardware-chip' },
  { name: 'Orgánico', value: 5, color: Palette.green.dark, icon: 'leaf' },
];

// Logros recientes
function getRecentAchievements(achievements: any[]) {
  return achievements.filter(a => a.unlocked).slice(-3);
}

// Componente de gráfico de barras animado
function AnimatedBarChart({ data }: { data: typeof WEEKLY_DATA }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const maxValue = Math.max(...data.map((d) => d.value));
  const barWidth = (width - Spacing.lg * 2 - Spacing.xl * 2 - Spacing.sm * 6) / 7;

  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.barsContainer}>
        {data.map((item, index) => (
          <Animated.View
            key={item.day}
            entering={FadeInUp.delay(index * 100).springify()}
            style={chartStyles.barWrapper}
          >
            <View style={[chartStyles.barBackground, { backgroundColor: colors.border }]}>
              <LinearGradient
                colors={Gradients.primary as any}
                style={[
                  chartStyles.barFill,
                  { height: `${(item.value / maxValue) * 100}%` },
                ]}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
              />
            </View>
            <Text style={[chartStyles.barLabel, { color: colors.textSecondary }]}>
              {item.day}
            </Text>
          </Animated.View>
        ))}
      </View>

      {/* Tooltip del día seleccionado */}
      <View style={[chartStyles.tooltip, { backgroundColor: colors.surface }, Shadows.md]}>
        <Text style={[chartStyles.tooltipTitle, { color: colors.text }]}>Jueves</Text>
        <Text style={[chartStyles.tooltipValue, { color: colors.primary }]}>24 items</Text>
        <Text style={[chartStyles.tooltipSubtext, { color: colors.textSecondary }]}>
          Tu mejor día 🎉
        </Text>
      </View>
    </View>
  );
}

// Componente de categoría
function CategoryItem({
  item,
  index,
}: {
  item: typeof CATEGORY_BREAKDOWN[0];
  index: number;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).springify()}
      style={categoryStyles.item}
    >
      <View style={[categoryStyles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={20} color={item.color} />
      </View>
      <View style={categoryStyles.info}>
        <Text style={[categoryStyles.name, { color: colors.text }]}>{item.name}</Text>
        <View style={[categoryStyles.progressTrack, { backgroundColor: colors.border }]}>
          <View
            style={[categoryStyles.progressFill, { width: `${item.value}%`, backgroundColor: item.color }]}
          />
        </View>
      </View>
      <Text style={[categoryStyles.value, { color: item.color }]}>{item.value}%</Text>
    </Animated.View>
  );
}

export default function MetricsScreen() {
  const { user, achievements, challenges, posts } = useAppStore();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [alertConfig, setAlertConfig] = useState<any>(null);
  const recentAchievements = getRecentAchievements(achievements);

  // Real data connections
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const completedChallenges = challenges.filter(c => c.completed).length;
  const totalPosts = posts.length;
  const friendsCount = user?.friends?.length || 0;
  
  const showShareAlert = () => {
    setAlertConfig({
      visible: true,
      title: `📸 Función en desarrollo: Compartir Métrica`,
      message: `La función de compartir estará disponible en la próxima versión. ¡Sigue reciclando!`,
      icon: 'share-social',
      iconGradient: [...Gradients.ocean],
      primaryButtonText: 'Entendido',
      onPrimaryPress: () => setAlertConfig(null),
      onClose: () => setAlertConfig(null),
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={Gradients.ocean}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + Spacing.md }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Estadísticas</Text>
            <Text style={styles.headerSubtitle}>Tu impacto ambiental</Text>
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={showShareAlert}>
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Selector de periodo */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setSelectedPeriod(period)}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : 'Año'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Métricas principales */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={styles.mainMetrics}>
            <GradientCard
              colors={(colorScheme === 'dark' ? colors.cardMetrics : ['#FFFFFF', '#F0F8FF']) as any}
              style={styles.mainMetricCard}
            >
              <View style={styles.mainMetricContent}>
                <CircularProgress
                  progress={Math.round((user.xp / user.xpToNextLevel) * 100)}
                  size={140}
                  strokeWidth={14}
                  label="Progreso Nivel"
                  gradientColors={Gradients.ocean as any}
                />
                <View style={styles.mainMetricInfo}>
                  <Text style={[styles.mainMetricTitle, { color: colors.text }]}>
                    Nivel {user.level}
                  </Text>
                  <Text style={[styles.mainMetricSubtitle, { color: colors.textSecondary }]}>
                    {user.xp} / {user.xpToNextLevel} XP para subir
                  </Text>
                  <View style={styles.metricHighlight}>
                    <Ionicons name="trending-up" size={20} color={Palette.green.vibrant} />
                    <Text style={styles.metricHighlightText}>+23% vs mes anterior</Text>
                  </View>
                </View>
              </View>
            </GradientCard>
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={styles.statsGrid}>
            <StatCard
              icon="trash-outline"
              value={user.totalRecycled.toString()}
              label="Items Reciclados"
              colors={[Palette.green.main, Palette.green.light]}
              trend="up"
              trendValue={`+${user.totalRecycled}`}
            />
            <StatCard
              icon="cloud-outline"
              value={user.co2Saved}
              label="CO₂ Evitado"
              colors={[Palette.blue.main, Palette.blue.light]}
              trend="up"
              trendValue={`${user.co2Saved}`}
            />
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              icon="trophy-outline"
              value={unlockedAchievements.toString()}
              label="Logros"
              colors={[Palette.yellow.dark, Palette.yellow.main]}
              trend={unlockedAchievements > 0 ? 'up' : 'neutral'}
              trendValue={`${unlockedAchievements} de ${achievements.length}`}
            />
            <StatCard
              icon="flame-outline"
              value={completedChallenges.toString()}
              label="Retos Completados"
              colors={[Palette.orange.main, Palette.orange.light]}
              trend={completedChallenges > 0 ? 'up' : 'neutral'}
              trendValue={`${completedChallenges} de ${challenges.length}`}
            />
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              icon="chatbubbles-outline"
              value={totalPosts.toString()}
              label="Publicaciones"
              colors={[Palette.purple.main, Palette.purple.light]}
              trend={totalPosts > 0 ? 'up' : 'neutral'}
              trendValue={`${totalPosts} posts`}
            />
            <StatCard
              icon="people-outline"
              value={friendsCount.toString()}
              label="Amigos"
              colors={[Palette.blue.dark, Palette.blue.main]}
              trend={friendsCount > 0 ? 'up' : 'neutral'}
              trendValue={`${friendsCount} conectados`}
            />
          </View>
        </Animated.View>

        {/* Gráfico semanal */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <View style={styles.sectionHeader}>
            <IconBadge icon="bar-chart" size="small" colors={Gradients.ocean as any} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Actividad Semanal
            </Text>
          </View>

          <GradientCard colors={(colorScheme === 'dark' ? colors.cardMetrics : ['#FFFFFF', '#F8FCFF']) as any}>
            <AnimatedBarChart data={WEEKLY_DATA} />
          </GradientCard>
        </Animated.View>

        {/* Desglose por categorías */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <View style={styles.sectionHeader}>
            <IconBadge icon="pie-chart" size="small" colors={Gradients.primary as any} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Por Categoría
            </Text>
          </View>

          <GradientCard colors={(colorScheme === 'dark' ? colors.cardChallenges : ['#FFFFFF', '#F8FFF8']) as any}>
            {CATEGORY_BREAKDOWN.map((item, index) => (
              <CategoryItem key={item.name} item={item} index={index} />
            ))}
          </GradientCard>
        </Animated.View>

        {/* Logros recientes */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <View style={styles.sectionHeader}>
            <IconBadge icon="medal" size="small" colors={Gradients.gold as any} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Logros Recientes
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsScroll}
          >
            {recentAchievements.map((achievement, index) => (
              <Animated.View
                key={achievement.id}
                entering={FadeInRight.delay(index * 150).springify()}
              >
                <LinearGradient
                  colors={achievement.gradient as any}
                  style={[styles.achievementCard, Shadows.md]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.achievementIcon}>
                    <Ionicons name={achievement.icon as any} size={32} color="#FFFFFF" />
                  </View>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                </LinearGradient>
              </Animated.View>
            ))}

            {/* Ver todos */}
            <TouchableOpacity
              style={[styles.viewAllCard, { backgroundColor: colors.surface }, Shadows.sm]}
            >
              <Ionicons name="arrow-forward" size={24} color={colors.primary} />
              <Text style={[styles.viewAllText, { color: colors.primary }]}>Ver todos</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        {/* Compartir progreso */}
        <Animated.View entering={FadeInUp.delay(600).springify()}>
          <GradientCard colors={Gradients.aurora as any} style={styles.shareCard}>
            <View style={styles.shareContent}>
              <View style={styles.shareIcon}>
                <Ionicons name="share-social" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.shareInfo}>
                <Text style={styles.shareTitle}>¡Comparte tu progreso!</Text>
                <Text style={styles.shareSubtitle}>
                  Inspira a otros a unirse al movimiento verde
                </Text>
              </View>
            </View>
            <AnimatedButton
              title="Compartir"
              onPress={showShareAlert}
              variant="outline"
              icon="share-outline"
              style={styles.shareButton2}
            />
          </GradientCard>
        </Animated.View>
      </ScrollView>

      {/* Alerta de Feature en Desarrollo */}
      {alertConfig && (
        <AlertModal
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          icon={alertConfig.icon}
          iconGradient={alertConfig.iconGradient}
          primaryButtonText={alertConfig.primaryButtonText}
          onPrimaryPress={alertConfig.onPrimaryPress}
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
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.pill,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.pill,
  },
  periodButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  periodButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  periodButtonTextActive: {
    color: Palette.blue.main,
  },
  scrollView: {
    flex: 1,
    marginTop: -BorderRadius.lg,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  mainMetrics: {
    marginBottom: Spacing.lg,
  },
  mainMetricCard: {
    marginBottom: 0,
  },
  mainMetricContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainMetricInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  mainMetricTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
  },
  mainMetricSubtitle: {
    fontSize: Typography.size.sm,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  metricHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.green.mint,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  metricHighlightText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Palette.green.dark,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginLeft: Spacing.sm,
  },
  achievementsScroll: {
    paddingRight: Spacing.lg,
  },
  achievementCard: {
    width: 120,
    height: 140,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginRight: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  achievementTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  viewAllCard: {
    width: 100,
    height: 140,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    marginTop: Spacing.xs,
  },
  shareCard: {
    marginTop: Spacing.lg,
  },
  shareContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  shareIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  shareInfo: {
    flex: 1,
  },
  shareTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  shareSubtitle: {
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  shareButton2: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'transparent',
  },
});

const chartStyles = StyleSheet.create({
  container: {
    paddingTop: Spacing.md,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    marginBottom: Spacing.lg,
  },
  barWrapper: {
    alignItems: 'center',
  },
  barBackground: {
    width: 32,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 16,
  },
  barLabel: {
    marginTop: Spacing.sm,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
  },
  tooltip: {
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  tooltipTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  tooltipValue: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  tooltipSubtext: {
    fontSize: Typography.size.xs,
  },
});

const categoryStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
    marginRight: Spacing.md,
  },
  name: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    marginBottom: Spacing.xs,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  value: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    minWidth: 45,
    textAlign: 'right',
  },
});