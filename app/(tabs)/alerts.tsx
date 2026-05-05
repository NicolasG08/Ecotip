import { EmptyState } from '@/components/ui/EmptyState';
import { GradientCard } from '@/components/ui/GradientCard';
import { IconBadge } from '@/components/ui/IconBadge';
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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, {
    FadeInDown,
    FadeInRight,
    Layout,
    SlideOutRight
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore, Notification } from '@/store/AppProvider';

const TABS = [
  { key: 'all', label: 'Todas' },
  { key: 'challenges', label: 'Retos' },
  { key: 'rewards', label: 'Premios' },
  { key: 'community', label: 'Comunidad' },
];

// Componente de notificación individual
function NotificationItem({
  notification,
  index,
  onDismiss,
  onAction,
}: {
  notification: Notification;
  index: number;
  onDismiss: (id: string) => void;
  onAction: (notification: Notification) => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.swipeAction}
      onPress={() => onDismiss(notification.id)}
    >
      <LinearGradient
        colors={[Palette.red.main, Palette.red.dark]}
        style={styles.swipeActionGradient}
      >
        <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).springify()}
      exiting={SlideOutRight.springify()}
      layout={Layout.springify()}
    >
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => notification.actionable && onAction(notification)}
          style={[
            styles.notificationCard,
            { backgroundColor: colors.surface },
            !notification.read && styles.unreadCard,
            Shadows.sm,
          ]}
        >
          {/* Indicador de no leído */}
          {!notification.read && (
            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
          )}

          {/* Icono */}
          <LinearGradient
            colors={notification.gradient}
            style={styles.notificationIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={notification.icon} size={22} color="#FFFFFF" />
          </LinearGradient>

          {/* Contenido */}
          <View style={styles.notificationContent}>
            <Text
              style={[
                styles.notificationTitle,
                { color: colors.text },
                !notification.read && styles.unreadTitle,
              ]}
            >
              {notification.title}
            </Text>
            <Text
              style={[styles.notificationMessage, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {notification.message}
            </Text>
            <View style={styles.notificationFooter}>
              <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                {notification.time}
              </Text>
              {notification.points && (
                <View style={styles.pointsBadge}>
                  <Ionicons name="star" size={12} color={Palette.yellow.gold} />
                  <Text style={styles.pointsText}>+{notification.points}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Acción */}
          {notification.actionable && (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
              style={styles.chevron}
            />
          )}
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );
}

export default function AlertsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useAppStore();
  
  const [activeTab, setActiveTab] = useState('all');
  
  // Settings State
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [silentNightEnabled, setSilentNightEnabled] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;
  
  // Badge Counts
  const achievementsCount = notifications.filter((n) => n.type === 'achievement' && !n.read).length;
  const rewardsCount = notifications.filter((n) => n.type === 'reward' && !n.read).length;
  const socialCount = notifications.filter((n) => n.type === 'community' && !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'challenges') return n.type === 'challenge' || n.type === 'achievement';
    if (activeTab === 'rewards') return n.type === 'reward';
    if (activeTab === 'community') return n.type === 'community' || n.type === 'system';
    return true;
  });

  const handleDismiss = (id: string) => {
    deleteNotification(id);
  };

  const handleAction = (notification: Notification) => {
    // Marcar como leída
    markNotificationRead(notification.id);
    
    // Navegación basada en el tipo o contenido (mock interactivo)
    if (notification.icon === 'map') {
        router.push('/(tabs)/map');
    } else if (notification.icon === 'school') {
        router.push('/(tabs)/education');
    } else if (notification.type === 'achievement') {
        router.push('/(tabs)/account');
    } else if (notification.type === 'community') {
        router.push('/(tabs)/social');
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
  };

    return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={Gradients.sunrise}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + Spacing.md }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Notificaciones</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día ✨'}
            </Text>
          </View>
          
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllRead}
            >
              <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
              <Text style={styles.markAllText}>Marcar todo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Badge de notificaciones */}
        <View style={styles.headerBadges}>
          <TouchableOpacity 
            style={styles.badgeItem} 
            activeOpacity={0.7}
            onPress={() => setActiveTab('challenges')}
          >
            <View style={[styles.badgeIcon, { backgroundColor: achievementsCount > 0 ? Palette.yellow.dark : 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="trophy" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.badgeCount}>{achievementsCount}</Text>
            <Text style={styles.badgeLabel}>Logros</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.badgeItem}
            activeOpacity={0.7}
            onPress={() => setActiveTab('rewards')}
          >
            <View style={[styles.badgeIcon, { backgroundColor: rewardsCount > 0 ? Palette.orange.main : 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="gift" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.badgeCount}>{rewardsCount}</Text>
            <Text style={styles.badgeLabel}>Premios</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.badgeItem}
            activeOpacity={0.7}
            onPress={() => setActiveTab('community')}
          >
            <View style={[styles.badgeIcon, { backgroundColor: socialCount > 0 ? Palette.blue.main : 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="people" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.badgeCount}>{socialCount}</Text>
            <Text style={styles.badgeLabel}>Social</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surface }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tabButton,
                activeTab === tab.key && { backgroundColor: colors.primary + '20' },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab.key ? colors.primary : colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
              {activeTab === tab.key && (
                <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de notificaciones */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length > 0 ? (
          <>
            {/* Notificaciones no leídas */}
            {filteredNotifications.some((n) => !n.read) && (
              <Animated.View entering={FadeInDown.delay(100).springify()}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Nuevas
                  </Text>
                </View>
                {filteredNotifications
                  .filter((n) => !n.read)
                  .map((notification, index) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      index={index}
                      onDismiss={handleDismiss}
                      onAction={handleAction}
                    />
                  ))}
              </Animated.View>
            )}

            {/* Notificaciones leídas */}
            {filteredNotifications.some((n) => n.read) && (
              <Animated.View entering={FadeInDown.delay(200).springify()}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Anteriores
                  </Text>
                </View>
                {filteredNotifications
                  .filter((n) => n.read)
                  .map((notification, index) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      index={index}
                      onDismiss={handleDismiss}
                      onAction={handleAction}
                    />
                  ))}
              </Animated.View>
            )}
          </>
        ) : (
          <EmptyState
            icon="notifications-off-outline"
            title="No hay notificaciones"
            description="Cuando tengas nuevas notificaciones, aparecerán aquí"
          />
        )}

        {/* Configuración rápida */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <GradientCard
            colors={(colorScheme === 'dark' ? colors.cardAlerts : ['#FFFFFF', '#FFF8F0']) as any}
            style={styles.settingsCard}
          >
            <View style={styles.settingsHeader}>
              <IconBadge icon="settings" size="small" colors={Gradients.sunrise as any} />
              <Text style={[styles.settingsTitle, { color: colors.text }]}>
                Configuración rápida
              </Text>
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications" size={22} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Notificaciones push
                </Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={colors.primary}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="mail" size={22} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Resumen por email
                </Text>
              </View>
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={emailEnabled ? colors.primary : colors.textSecondary}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon" size={22} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Modo silencioso nocturno
                </Text>
              </View>
              <Switch
                value={silentNightEnabled}
                onValueChange={setSilentNightEnabled}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={silentNightEnabled ? colors.primary : colors.textSecondary}
              />
            </View>
          </GradientCard>
        </Animated.View>
      </ScrollView>
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
  headerTitle: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
  },
  markAllText: {
    color: '#FFFFFF',
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    marginLeft: Spacing.xs,
  },
  headerBadges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  badgeItem: {
    alignItems: 'center',
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  badgeCount: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: '#FFFFFF',
  },
  badgeLabel: {
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  tabsContainer: {
    marginTop: -BorderRadius.lg,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.md,
    ...Shadows.sm,
  },
  tabsScroll: {
    paddingHorizontal: Spacing.lg,
  },
  tabButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.pill,
    position: 'relative',
  },
  tabText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: Spacing.lg,
    right: Spacing.lg,
    height: 3,
    borderRadius: 1.5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: Palette.orange.main,
  },
  unreadDot: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    marginBottom: 2,
  },
  unreadTitle: {
    fontWeight: Typography.weight.semibold,
  },
  notificationMessage: {
    fontSize: Typography.size.sm,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: Typography.size.xs,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.yellow.cream,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  pointsText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Palette.yellow.dark,
    marginLeft: 2,
  },
  chevron: {
    marginLeft: Spacing.sm,
  },
  swipeAction: {
    justifyContent: 'center',
    marginLeft: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  swipeActionGradient: {
    width: 70,
    height: '100%',
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsCard: {
    marginTop: Spacing.xl,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  settingsTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    marginLeft: Spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: Typography.size.sm,
    marginLeft: Spacing.md,
  },
});