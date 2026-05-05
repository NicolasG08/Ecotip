import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { auth } from '@/config/firebase';
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
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '723789085904-p9frbasso8cq1tljrnl1v60b4q5jguto.apps.googleusercontent.com',
    });
  }, []);

  // Animación del logo
  const leafRotation = useSharedValue(0);
  const leafScale = useSharedValue(1);

  React.useEffect(() => {
    leafRotation.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 2000 }),
        withTiming(-10, { duration: 2000 })
      ),
      -1,
      true
    );

    leafScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const leafAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${leafRotation.value}deg` },
      { scale: leafScale.value },
    ],
  }));

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa tu correo y contraseña');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/');
    } catch (error: any) {
      // Manejo básico de errores de Firebase
      let mensaje = 'Ocurrió un error al iniciar sesión.';
      if (error.code === 'auth/invalid-credential') mensaje = 'Credenciales incorrectas.';
      if (error.code === 'auth/user-not-found') mensaje = 'Usuario no encontrado.';
      if (error.code === 'auth/wrong-password') mensaje = 'Contraseña incorrecta.';

      Alert.alert('Error', mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;

      if (!idToken) {
        throw new Error('No se pudo obtener el token de Google.');
      }

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      router.replace('/');
    } catch (error: any) {
      if (error.code !== '12501') {
        // 12501 = usuario canceló el selector de cuentas
        Alert.alert('Error de Google', error.message || 'Error al iniciar sesión con Google');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Fondo con gradiente */}
      <LinearGradient
        colors={colorScheme === 'dark' ? Gradients.screenDark : ['#E8F5E9', '#C8E6C9', '#A5D6A7']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decoraciones flotantes */}
      <View style={styles.decorations}>
        {[...Array(6)].map((_, i) => (
          <Animated.View
            key={i}
            entering={FadeInDown.delay(i * 200).springify()}
            style={[
              styles.floatingCircle,
              {
                left: Math.random() * width,
                top: Math.random() * (height * 0.4),
                width: 20 + Math.random() * 60,
                height: 20 + Math.random() * 60,
                backgroundColor: [
                  Palette.green.light,
                  Palette.blue.light,
                  Palette.yellow.light,
                  Palette.orange.light,
                ][i % 4] + '40',
              },
            ]}
          />
        ))}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo animado */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.logoSection}
          >
            <Animated.View style={[styles.logoContainer, leafAnimatedStyle]}>
              <LinearGradient
                colors={Gradients.primary}
                style={styles.logoGradient}
              >
                <Ionicons name="leaf" size={60} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>

            <Text style={[styles.appName, { color: colors.text }]}>Ecotip</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              Tu compañero de reciclaje
            </Text>
          </Animated.View>

          {/* Formulario con efecto glass */}
          <Animated.View
            entering={FadeInUp.delay(300).springify()}
            style={[styles.formContainer, Shadows.lg]}
          >
            <BlurView intensity={80} tint="light" style={styles.blurContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                style={styles.formGradient}
              >
                <Text style={[styles.formTitle, { color: colors.text }]}>
                  Iniciar Sesión
                </Text>

                {/* Input Email */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Usuario o Correo
                  </Text>
                  <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="tu@email.com"
                      placeholderTextColor={colors.textSecondary}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                {/* Input Password */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Contraseña
                  </Text>
                  <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="••••••••"
                      placeholderTextColor={colors.textSecondary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>
                </View>

                <AnimatedButton
                  title="Iniciar Sesión"
                  onPress={handleLogin}
                  loading={isLoading}
                  icon="arrow-forward"
                  iconPosition="right"
                />

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                  <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
                    o continúa con
                  </Text>
                  <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                </View>

                {/* Google Button */}
                <AnimatedButton
                  title="Continuar con Google"
                  onPress={handleGoogleLogin}
                  loading={isGoogleLoading}
                  variant="outline"
                  icon="logo-google"
                />
              </LinearGradient>
            </BlurView>
          </Animated.View>

          {/* Register Link */}
          <Animated.View
            entering={FadeInUp.delay(500).springify()}
            style={styles.registerSection}
          >
            <Text style={[styles.registerText, { color: colors.textSecondary }]}>
              ¿No tienes cuenta?
            </Text>
            <AnimatedButton
              title="Crear Cuenta"
              onPress={() => router.push('/(auth)/register' as any)}
              variant="outline"
              icon="person-add-outline"
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorations: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 100,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  appName: {
    fontSize: Typography.size.display,
    fontWeight: Typography.weight.black,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: Typography.size.md,
  },
  formContainer: {
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  blurContainer: {
    overflow: 'hidden',
    borderRadius: BorderRadius.xxl,
  },
  formGradient: {
    padding: Spacing.xl,
  },
  formTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  inputIcon: {
    paddingLeft: Spacing.md,
  },
  input: {
    flex: 1,
    padding: Spacing.md,
    fontSize: Typography.size.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
    fontSize: Typography.size.sm,
  },
  registerSection: {
    alignItems: 'center',
  },
  registerText: {
    fontSize: Typography.size.sm,
    marginBottom: Spacing.md,
  },
});