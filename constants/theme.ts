// constants/theme.ts
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// 🌈 Paleta Kurzgesagt - Colores vibrantes y orgánicos
export const Palette = {
  // Verdes naturales
  green: {
    light: '#7ED957',
    main: '#4CAF50',
    dark: '#2E7D32',
    vibrant: '#00E676',
    forest: '#1B5E20',
    mint: '#B9F6CA',
  },
  // Azules profundos
  blue: {
    light: '#64B5F6',
    main: '#2196F3',
    dark: '#1565C0',
    deep: '#0D47A1',
    sky: '#81D4FA',
    ocean: '#006064',
  },
  // Naranjas cálidos
  orange: {
    light: '#FFB74D',
    main: '#FF9800',
    dark: '#F57C00',
    sunset: '#FF6D00',
    peach: '#FFCCBC',
  },
  // Amarillos energéticos
  yellow: {
    light: '#FFF59D',
    main: '#FFEB3B',
    dark: '#FBC02D',
    gold: '#FFD600',
    cream: '#FFFDE7',
  },
  // Rojos y rosas
  red: {
    light: '#EF9A9A',
    main: '#F44336',
    dark: '#C62828',
    coral: '#FF8A80',
  },
  // Púrpuras místicos
  purple: {
    light: '#CE93D8',
    main: '#9C27B0',
    dark: '#6A1B9A',
    lavender: '#E1BEE7',
  },
  // Neutrales con personalidad
  neutral: {
    white: '#FFFFFF',
    cream: '#FAFAFA',
    lightGray: '#F5F5F5',
    gray: '#9E9E9E',
    darkGray: '#424242',
    charcoal: '#263238',
    black: '#121212',
  },
};

// 🌅 Gradientes espectaculares
export const Gradients = {
  // Gradientes principales
  primary: ['#4CAF50', '#81C784', '#A5D6A7'] as const,
  sunrise: ['#FF9800', '#FFB74D', '#FFCC80'] as const,
  ocean: ['#2196F3', '#64B5F6', '#90CAF9'] as const,
  sunset: ['#FF6D00', '#FF9800', '#FFCA28'] as const,
  forest: ['#1B5E20', '#2E7D32', '#4CAF50'] as const,
  aurora: ['#4CAF50', '#2196F3', '#9C27B0'] as const,

  // Fondos de pantalla
  screenLight: ['#E8F5E9', '#F1F8E9', '#FFFDE7'] as const,
  screenDark: ['#1B5E20', '#004D40', '#263238'] as const,

  // Cards especiales
  cardGreen: ['#E8F5E9', '#C8E6C9'] as const,
  cardBlue: ['#E3F2FD', '#BBDEFB'] as const,
  cardOrange: ['#FFF3E0', '#FFE0B2'] as const,
  cardPurple: ['#F3E5F5', '#E1BEE7'] as const,

  // Achievements
  gold: ['#FFD700', '#FFA000', '#FF6F00'] as const,
  silver: ['#E0E0E0', '#BDBDBD', '#9E9E9E'] as const,
  bronze: ['#CD7F32', '#A0522D', '#8B4513'] as const,
};

// 🎯 Tema claro
export const Colors = {
  light: {
    // Principales
    primary: Palette.green.main,
    primaryLight: Palette.green.light,
    primaryDark: Palette.green.dark,

    secondary: Palette.blue.main,
    secondaryLight: Palette.blue.light,

    accent: Palette.orange.main,
    accentLight: Palette.orange.light,

    // Fondos
    background: '#F0F4F0',
    backgroundGradient: Gradients.screenLight,
    surface: Palette.neutral.white,
    surfaceVariant: Palette.neutral.cream,

    // Textos
    text: Palette.neutral.charcoal,
    textSecondary: Palette.neutral.gray,
    textOnPrimary: Palette.neutral.white,

    // Estados
    success: Palette.green.vibrant,
    warning: Palette.yellow.main,
    error: Palette.red.main,
    info: Palette.blue.main,

    // Bordes y sombras
    border: '#E0E0E0',
    shadow: 'rgba(76, 175, 80, 0.15)',
    shadowDark: 'rgba(0, 0, 0, 0.1)',

    // Tab bar
    tabBar: Palette.neutral.white,
    tabBarActive: Palette.green.main,
    tabBarInactive: Palette.neutral.gray,

    // Cards por categoría
    cardChallenges: Gradients.cardGreen,
    cardMetrics: Gradients.cardBlue,
    cardAlerts: Gradients.cardOrange,
    cardSocial: Gradients.cardPurple,

    tint: Palette.green.main,
  },
  dark: {
    primary: Palette.green.light,
    primaryLight: Palette.green.mint,
    primaryDark: Palette.green.main,

    secondary: Palette.blue.light,
    secondaryLight: Palette.blue.sky,

    accent: Palette.orange.light,
    accentLight: Palette.orange.peach,

    background: '#0A1F0A',
    backgroundGradient: Gradients.screenDark,
    surface: '#1A2E1A',
    surfaceVariant: '#243424',

    text: Palette.neutral.cream,
    textSecondary: '#A5D6A7',
    textOnPrimary: Palette.neutral.charcoal,

    success: Palette.green.vibrant,
    warning: Palette.yellow.light,
    error: Palette.red.coral,
    info: Palette.blue.light,

    border: '#2E7D32',
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowDark: 'rgba(0, 0, 0, 0.5)',

    tabBar: '#1A2E1A',
    tabBarActive: Palette.green.light,
    tabBarInactive: '#6B8E6B',

    cardChallenges: ['#1B5E20', '#2E7D32'] as const,
    cardMetrics: ['#0D47A1', '#1565C0'] as const,
    cardAlerts: ['#E65100', '#F57C00'] as const,
    cardSocial: ['#4A148C', '#6A1B9A'] as const,

    tint: Palette.green.light,
  },
};

// 📐 Espaciado con ritmo visual
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
};

// 🔲 Border radius generosos (estilo Kurzgesagt)
export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  pill: 50,
  circle: 9999,
};

// 📝 Tipografía expresiva
export const Typography = {
  // Tamaños
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
    hero: 56,
  },
  // Pesos
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// 🌟 Sombras con color (estilo Kurzgesagt)
export const Shadows = {
  sm: {
    shadowColor: Palette.green.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Palette.green.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Palette.green.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  }),
  float: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
};

// 📱 Dimensiones útiles
export const Layout = {
  window: { width, height },
  isSmallDevice: width < 375,
  contentPadding: Spacing.lg,
  cardPadding: Spacing.xl,
  headerHeight: 60,
  tabBarHeight: 70,
  bottomSafeArea: 34,
};

// 🎬 Configuración de animaciones
export const Animation = {
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  timing: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};