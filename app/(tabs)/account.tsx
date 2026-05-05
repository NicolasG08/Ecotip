import { ActionSheet } from '@/components/ui/ActionSheet';
import { AlertModal, AlertModalProps } from '@/components/ui/AlertModal';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  Appearance,
  ColorSchemeName,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppStore } from '@/store/AppProvider';
import { useAuth } from '@/store/AuthContext';

type MenuItemType = {
  key: string;
  label: string;
  icon: string;
  color: string;
  hasSwitch?: boolean;
  valueKey?: keyof Preferences;
  options?: string[];
};

type Preferences = {
  notifications: boolean;
  theme: 'Automático' | 'Claro' | 'Oscuro';
  language: 'Español' | 'English' | 'Português';
  units: 'Métrico' | 'Imperial';
};

const DEFAULT_PREFERENCES: Preferences = {
  notifications: true,
  theme: 'Automático',
  language: 'Español',
  units: 'Métrico',
};

const MENU_SECTIONS: { title: string; items: MenuItemType[] }[] = [
  {
    title: 'Cuenta',
    items: [
      { key: 'profile', label: 'Editar Perfil', icon: 'person-outline', color: Palette.blue.main },
      { key: 'notifications', label: 'Notificaciones', icon: 'notifications-outline', color: Palette.orange.main, hasSwitch: true, valueKey: 'notifications' },
      { key: 'privacy', label: 'Privacidad', icon: 'shield-outline', color: Palette.green.main },
      { key: 'security', label: 'Seguridad', icon: 'lock-closed-outline', color: Palette.red.main },
    ],
  },
  {
    title: 'Preferencias',
    items: [
      { key: 'theme', label: 'Tema', icon: 'color-palette-outline', color: Palette.purple.main, valueKey: 'theme', options: ['Automático', 'Claro', 'Oscuro'] },
      { key: 'language', label: 'Idioma', icon: 'language-outline', color: Palette.blue.main, valueKey: 'language', options: ['Español', 'English', 'Português'] },
      { key: 'units', label: 'Unidades', icon: 'options-outline', color: Palette.green.main, valueKey: 'units', options: ['Métrico', 'Imperial'] },
    ],
  },
  {
    title: 'Soporte',
    items: [
      { key: 'help', label: 'Centro de Ayuda', icon: 'help-circle-outline', color: Palette.blue.main },
      { key: 'feedback', label: 'Enviar Feedback', icon: 'chatbubble-outline', color: Palette.green.main },
      { key: 'rate', label: 'Calificar App', icon: 'star-outline', color: Palette.yellow.dark },
      { key: 'about', label: 'Acerca de', icon: 'information-circle-outline', color: Palette.purple.main },
    ],
  },
];

export default function AccountScreen() {
  const { user, achievements, updateUserName, addNotification } = useAppStore();
  const { user: authUser, logout } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(authUser?.displayName || user.name);

  // Modals state
  const [activeSheet, setActiveSheet] = useState<MenuItemType | null>(null);
  const [alertModalConfig, setAlertModalConfig] = useState<AlertModalProps | null>(null);

  // Cargar preferencias
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const stored = await AsyncStorage.getItem('@ecotip_preferences');
        if (stored) {
          const parsed: Preferences = JSON.parse(stored);
          setPreferences(parsed);
          applyTheme(parsed.theme);
        }
      } catch (e) {
        console.error('Error loading preferences', e);
      }
    };
    loadPreferences();
  }, []);

  const applyTheme = (themeValue: Preferences['theme']) => {
    let scheme: ColorSchemeName = null; // Auto
    if (themeValue === 'Claro') scheme = 'light';
    if (themeValue === 'Oscuro') scheme = 'dark';
    Appearance.setColorScheme(scheme);
  };

  const savePreference = async (key: keyof Preferences, value: any) => {
    try {
      const newPrefs = { ...preferences, [key]: value };
      setPreferences(newPrefs);
      await AsyncStorage.setItem('@ecotip_preferences', JSON.stringify(newPrefs));

      if (key === 'theme') {
        applyTheme(value);
      }
    } catch (e) {
      console.error('Error saving preference', e);
    }
  };

  const handleLogout = () => {
    setAlertModalConfig({
      visible: true,
      title: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión de tu cuenta verde?',
      icon: 'log-out',
      iconColor: Colors.light.error,
      danger: true,
      primaryButtonText: 'Cerrar Sesión',
      secondaryButtonText: 'Cancelar',
      onPrimaryPress: async () => {
        setAlertModalConfig(null);
        await logout();
        router.replace('/(auth)/login');
      },
      onClose: () => setAlertModalConfig(null),
    });
  };

  const saveProfile = async () => {
    if (authUser && editName.trim()) {
      try {
        await updateProfile(authUser, { displayName: editName });
        
        // Sync name across all modules (user state + social posts)
        updateUserName(editName.trim());
        
        addNotification({
            type: 'system',
            title: 'Perfil Actualizado',
            message: `Tu nombre se ha cambiado a "${editName.trim()}".`,
            actionable: false,
            icon: 'person-outline',
            gradient: Gradients.gold,
        });
        
        setAlertModalConfig({
          visible: true,
          title: '¡Aprobado!',
          message: 'Tu perfil ha sido actualizado exitosamente. Tu nuevo nombre se reflejará en todas las secciones.',
          icon: 'checkmark-circle',
          iconGradient: [...Gradients.gold],
          primaryButtonText: 'Genial',
          onPrimaryPress: () => setAlertModalConfig(null),
          onClose: () => setAlertModalConfig(null),
        });
      } catch (error) {
        setAlertModalConfig({
          visible: true,
          title: 'Ups...',
          message: 'Hubo un error al actualizar tu perfil. Inténtalo de nuevo.',
          icon: 'alert-circle',
          danger: true,
          primaryButtonText: 'Entendido',
          onPrimaryPress: () => setAlertModalConfig(null),
          onClose: () => setAlertModalConfig(null),
        });
      }
    }
    setIsEditingProfile(false);
  };

  const handleMenuPress = (item: MenuItemType) => {
    switch (item.key) {
      // Editar
      case 'profile':
        setIsEditingProfile(true);
        break;

      // Selectores (Action Sheet)
      case 'theme':
      case 'language':
      case 'units':
        setActiveSheet(item);
        break;

      // Alertas (Alert Modal)
      case 'privacy':
        setAlertModalConfig({
          visible: true,
          title: 'Privacidad Protegida',
          message: 'Tus datos básicos están cifrados. Nunca vendemos tu información personal a terceros. Tus preferencias se guardan de manera local y segura.',
          icon: 'shield-checkmark',
          iconGradient: [Palette.green.light, Palette.green.main],
          primaryButtonText: 'Entendido',
          onPrimaryPress: () => setAlertModalConfig(null),
          onClose: () => setAlertModalConfig(null),
        });
        break;
      case 'security':
        setAlertModalConfig({
          visible: true,
          title: 'Seguridad Activa',
          message: 'Tu sesión está protegida por la infraestructura de Firebase Auth. Todo almacenamiento interno utiliza el sandboxing seguro de tu sistema.',
          icon: 'lock-closed',
          iconGradient: [Palette.red.light, Palette.red.main],
          primaryButtonText: 'Cerrar',
          onPrimaryPress: () => setAlertModalConfig(null),
          onClose: () => setAlertModalConfig(null),
        });
        break;
      case 'help':
        setAlertModalConfig({
          visible: true,
          title: 'Centro de Ayuda',
          message: '¿Problemas con un punto de reciclaje o duda sobre tus puntos XP? ¡Estamos aquí para ayudarte!\n\nEscríbenos a soporte@ecotip.com',
          icon: 'help-buoy',
          iconGradient: [Palette.blue.light, Palette.blue.main],
          primaryButtonText: 'Cerrar',
          onPrimaryPress: () => setAlertModalConfig(null),
          onClose: () => setAlertModalConfig(null),
        });
        break;
      case 'about':
        setAlertModalConfig({
          visible: true,
          title: 'Acerca de Ecotip',
          message: 'Versión 1.0.0\n\nCreado con muchísimo cariño y código limpio para promover una cultura de reciclaje real y cuantificable. 🌱',
          icon: 'planet',
          iconGradient: [...Gradients.primary],
          primaryButtonText: 'Qué genial',
          onPrimaryPress: () => setAlertModalConfig(null),
          onClose: () => setAlertModalConfig(null),
        });
        break;
      case 'feedback':
        setIsEditingProfile(false); // Para asegurar que no haya colisiones
        // Feedback usará el mismo AlertModal pero con un agradecimiento directo para simplificar y mantener la interfaz limpia.
        setAlertModalConfig({
          visible: true,
          title: '¡Gracias por Ayudarnos!',
          message: 'Puedes dejarnos tus sugerencias directamente en nuestras redes sociales o por correo electrónico. ¡Leemos todo!',
          icon: 'heart',
          iconGradient: [Palette.orange.main, Palette.red.main],
          primaryButtonText: 'Entendido',
          onPrimaryPress: () => setAlertModalConfig(null),
          onClose: () => setAlertModalConfig(null),
        });
        break;
      case 'rate':
        setAlertModalConfig({
          visible: true,
          title: '¿Disfrutas Ecotip? ⭐️',
          message: 'Tu calificación de 5 estrellas nos ayuda a llegar a más personas y plantar más árboles digitales.',
          icon: 'star',
          iconGradient: [...Gradients.gold],
          primaryButtonText: 'Calificar App',
          secondaryButtonText: 'Más tarde',
          onPrimaryPress: () => {
            setAlertModalConfig(null);
            setTimeout(() => {
              setAlertModalConfig({
                visible: true,
                title: '¡Infinitas Gracias!',
                message: 'Apreciamos enormemente tu tiempo de calificar nuestro trabajo.',
                icon: 'heart-circle',
                iconGradient: [Palette.red.main, Palette.purple.main],
                primaryButtonText: 'Cerrar',
                onPrimaryPress: () => setAlertModalConfig(null),
                onClose: () => setAlertModalConfig(null),
              });
            }, 500);
          },
          onClose: () => setAlertModalConfig(null),
        });
        break;
    }
  };

  const MenuItemComponent = ({ item, index }: { item: MenuItemType, index: number }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const handlePressIn = () => { scale.value = withSpring(0.98); };
    const handlePressOut = () => { scale.value = withSpring(1); };

    const isSwitch = item.hasSwitch;
    const value = item.valueKey ? preferences[item.valueKey] : undefined;

    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPress={isSwitch ? undefined : () => handleMenuPress(item)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={isSwitch ? 1 : 0.7}
          style={[styles.menuItem, { backgroundColor: colors.surface }]}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon as any} size={20} color={item.color} />
          </View>

          <View style={styles.menuContent}>
            <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
          </View>

          {isSwitch && item.valueKey ? (
            <Switch
              value={Boolean(value)}
              onValueChange={(val) => savePreference(item.valueKey!, val)}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={value ? colors.primary : colors.textSecondary}
            />
          ) : value !== undefined && typeof value === 'string' ? (
            <View style={styles.menuValueContainer}>
              <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{value}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </View>
          ) : (
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header con perfil */}
      <LinearGradient
        colors={[Palette.green.dark, Palette.green.main]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + Spacing.md }]}
      >
        <TouchableOpacity style={styles.settingsButton} onPress={() => setIsEditingProfile(true)}>
          <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {authUser?.photoURL ? (
              <Image source={{ uri: authUser.photoURL }} style={styles.avatarImage} />
            ) : (
              <LinearGradient colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)'] as any} style={styles.avatarGradient}>
                <Text style={styles.avatarText}>
                  {(authUser?.displayName || user.name).split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                </Text>
              </LinearGradient>
            )}
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{user.level}</Text>
            </View>
          </View>

          <Text style={styles.userName}>{authUser?.displayName || user.name}</Text>
          <Text style={styles.userJoinDate}>Usuario desde {user.joinDate}</Text>

          <View style={styles.xpContainer}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpLabel}>Nivel {user.level}</Text>
              <Text style={styles.xpValue}>{user.xp} / {user.xpToNextLevel} XP</Text>
            </View>
            <View style={styles.xpTrack}>
              <LinearGradient
                colors={Gradients.gold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.xpFill, { width: `${(user.xp / user.xpToNextLevel) * 100}%` }]}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <View style={styles.quickStatIcon}><Ionicons name="cube" size={20} color="#FFFFFF" /></View>
            <Text style={styles.quickStatValue}>{user.totalRecycled}</Text>
            <Text style={styles.quickStatLabel}>Reciclados</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.quickStatItem}>
            <View style={styles.quickStatIcon}><Ionicons name="leaf" size={20} color="#FFFFFF" /></View>
            <Text style={styles.quickStatValue}>{user.co2Saved}</Text>
            <Text style={styles.quickStatLabel}>CO₂ Evitado</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.quickStatItem}>
            <View style={styles.quickStatIcon}><Ionicons name="trophy" size={20} color="#FFFFFF" /></View>
            <Text style={styles.quickStatValue}>{user.rank}</Text>
            <Text style={styles.quickStatLabel}>Ranking</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logros */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <IconBadge icon="medal" size="small" colors={[...Gradients.gold]} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Logros Destacados</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsScroll}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={[styles.achievementItem, !achievement.unlocked && styles.achievementLocked]}>
                <LinearGradient
                  colors={achievement.unlocked ? (achievement.gradient as any) : [colors.border, colors.border]}
                  style={styles.achievementIcon}
                >
                  <Ionicons name={achievement.unlocked ? (achievement.icon as any) : 'lock-closed'} size={24} color={achievement.unlocked ? '#FFFFFF' : colors.textSecondary} />
                </LinearGradient>
                <Text style={[styles.achievementTitle, { color: achievement.unlocked ? colors.text : colors.textSecondary }]}>{achievement.title}</Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Secciones del menú */}
        {MENU_SECTIONS.map((section, sectionIndex) => (
          <Animated.View key={section.title} entering={FadeInUp.delay(400 + sectionIndex * 100).springify()}>
            <Text style={[styles.menuSectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
            <GradientCard colors={colorScheme === 'dark' ? [colors.surface, colors.surface] : ['#FFFFFF', '#FAFAFA']} style={styles.menuSection}>
              {section.items.map((item, index) => (
                <View key={item.key}>
                  <MenuItemComponent item={item} index={index} />
                  {index < section.items.length - 1 && <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />}
                </View>
              ))}
            </GradientCard>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInUp.delay(700).springify()}>
          <AnimatedButton title="Cerrar Sesión" onPress={handleLogout} variant="outline" icon="log-out-outline" style={styles.logoutButton} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(800).springify()}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>Ecotip v1.0.0</Text>
          <Text style={[styles.copyrightText, { color: colors.textSecondary }]}>Hecho con 💚 para el planeta</Text>
        </Animated.View>
      </ScrollView>

      {/* Modal Editar Perfil — Premium Bottom Sheet */}
      <Modal visible={isEditingProfile} animationType="none" transparent onRequestClose={() => setIsEditingProfile(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsEditingProfile(false)}>
            <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)} style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <Animated.View
            entering={SlideInDown.springify().damping(18).stiffness(140).mass(0.8)}
            style={[
              styles.modalContent,
              {
                backgroundColor: colorScheme === 'dark' ? 'rgba(26,46,26,0.97)' : 'rgba(255,255,255,0.97)',
                paddingBottom: Math.max(insets.bottom, Spacing.xl) + Spacing.md,
              },
            ]}
          >
            {/* Drag handle */}
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }]} />
            </View>

            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
                <LinearGradient colors={Gradients.primary as any} style={styles.modalHeaderIcon}>
                  <Ionicons name="person" size={16} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Editar Perfil</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditingProfile(false)}
                style={[styles.iconButton, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
              >
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nombre de Usuario</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: colors.border, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Tu nombre completo"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>Correo Electrónico (Solo Lectura)</Text>
              <TextInput
                style={[styles.textInput, styles.textInputDisabled, { color: colors.textSecondary, borderColor: colors.border, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}
                value={authUser?.email || user.email}
                editable={false}
              />

              <AnimatedButton title="Guardar Cambios" onPress={saveProfile} style={{ marginTop: Spacing.xxl }} />
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Action Sheet para Selectores */}
      <ActionSheet
        visible={activeSheet !== null}
        onClose={() => setActiveSheet(null)}
        title={activeSheet ? `Seleccionar ${activeSheet.label}` : ''}
        options={activeSheet?.options || []}
        selectedValue={activeSheet?.valueKey ? String(preferences[activeSheet.valueKey]) : undefined}
        onSelect={(value) => {
          if (activeSheet?.valueKey) {
            savePreference(activeSheet.valueKey, value);
          }
        }}
      />

      {/* Alert Modal para Info/Confirmaciones */}
      {alertModalConfig && <AlertModal {...alertModalConfig} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, borderBottomLeftRadius: BorderRadius.xxl, borderBottomRightRadius: BorderRadius.xxl },
  settingsButton: { alignSelf: 'flex-end', padding: Spacing.sm },
  profileSection: { alignItems: 'center', marginBottom: Spacing.lg },
  avatarContainer: { position: 'relative', marginBottom: Spacing.md },
  avatarGradient: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarImage: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarText: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.bold, color: '#FFFFFF' },
  levelBadge: { position: 'absolute', bottom: -5, right: -5, width: 32, height: 32, borderRadius: 16, backgroundColor: Palette.yellow.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  levelBadgeText: { fontSize: Typography.size.sm, fontWeight: Typography.weight.bold, color: '#FFFFFF' },
  userName: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: '#FFFFFF', marginBottom: Spacing.xs },
  userJoinDate: { fontSize: Typography.size.xs, color: 'rgba(255,255,255,0.8)', marginBottom: Spacing.md },
  xpContainer: { width: '100%', maxWidth: 280 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  xpLabel: { fontSize: Typography.size.sm, color: 'rgba(255,255,255,0.8)' },
  xpValue: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold, color: '#FFFFFF' },
  xpTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 3 },
  quickStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.xl, padding: Spacing.md },
  quickStatItem: { flex: 1, alignItems: 'center' },
  quickStatIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  quickStatValue: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: '#FFFFFF' },
  quickStatLabel: { fontSize: Typography.size.xs, color: 'rgba(255,255,255,0.8)' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: Spacing.sm },
  scrollView: { flex: 1, marginTop: -BorderRadius.lg },
  content: { padding: Spacing.lg, paddingTop: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, marginLeft: Spacing.sm },
  seeAllText: { fontSize: Typography.size.sm, fontWeight: Typography.weight.medium },
  achievementsScroll: { paddingBottom: Spacing.sm },
  achievementItem: { alignItems: 'center', marginRight: Spacing.lg, width: 80 },
  achievementLocked: { opacity: 0.5 },
  achievementIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm, ...Shadows.md },
  achievementTitle: { fontSize: Typography.size.xs, fontWeight: Typography.weight.medium, textAlign: 'center' },
  menuSectionTitle: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold, marginTop: Spacing.lg, marginBottom: Spacing.sm, marginLeft: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuSection: { padding: 0, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  menuIconContainer: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: Typography.size.md },
  menuValueContainer: { flexDirection: 'row', alignItems: 'center' },
  menuValue: { fontSize: Typography.size.sm, marginRight: Spacing.xs },
  menuDivider: { height: 1, marginLeft: 68 },
  logoutButton: { marginTop: Spacing.xl, borderColor: Palette.red.main },
  versionText: { textAlign: 'center', fontSize: Typography.size.sm, marginTop: Spacing.xl },
  copyrightText: { textAlign: 'center', fontSize: Typography.size.xs, marginTop: Spacing.xs, marginBottom: Spacing.xl },
  // Modal styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalContent: { width: '100%', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: Spacing.xl, ...Shadows.float },
  handleContainer: { alignItems: 'center', paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  handle: { width: 40, height: 4, borderRadius: 2 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.md, marginBottom: Spacing.lg },
  modalHeaderIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, letterSpacing: -0.3 },
  iconButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modalBody: { gap: Spacing.sm, paddingBottom: Spacing.sm },
  inputLabel: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold, marginBottom: 4, letterSpacing: -0.1 },
  textInput: { height: 52, borderWidth: 1.5, borderRadius: 16, paddingHorizontal: Spacing.lg, fontSize: Typography.size.md },
  textInputDisabled: { opacity: 0.5 },
});