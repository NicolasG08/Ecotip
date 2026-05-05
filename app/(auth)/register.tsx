import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { auth, db } from '@/config/firebase';
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
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const insets = useSafeAreaInsets();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '723789085904-p9frbasso8cq1tljrnl1v60b4q5jguto.apps.googleusercontent.com',
        });
    }, []);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Actualizar el perfil con el nombre
            await updateProfile(user, {
                displayName: name,
            });

            // Guardar el usuario en Firestore
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                createdAt: new Date(),
                level: 1,
                xp: 0,
                completedChallenges: 0,
            });

            router.replace('/');
        } catch (error: any) {
            // Manejo básico de errores de Firebase
            let mensaje = 'Ocurrió un error al crear la cuenta.';
            if (error.code === 'auth/email-already-in-use') mensaje = 'El correo ya está registrado.';
            if (error.code === 'auth/invalid-email') mensaje = 'El formato del correo es inválido.';

            Alert.alert('Error', mensaje);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setIsGoogleLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            const idToken = response.data?.idToken;

            if (!idToken) {
                throw new Error('No se pudo obtener el token de Google.');
            }

            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);
            const user = userCredential.user;

            // Verificar si el usuario ya existe en Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (!userDoc.exists()) {
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    name: user.displayName || 'Usuario de Ecotip',
                    email: user.email,
                    createdAt: new Date(),
                    level: 1,
                    xp: 0,
                    completedChallenges: 0,
                });
            }

            router.replace('/');
        } catch (error: any) {
            if (error.code !== '12501') {
                Alert.alert('Error de Google', error.message || 'Error al registrar con Google');
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Fondo con gradiente */}
            <LinearGradient
                colors={(colorScheme === 'dark' ? Gradients.screenDark : ['#E8F5E9', '#C8E6C9', '#A5D6A7']) as [string, string, ...string[]]}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Decoraciones flotantes */}
            <View style={styles.decorations}>
                {[...Array(4)].map((_, i) => (
                    <Animated.View
                        key={i}
                        entering={FadeInDown.delay(i * 200).springify()}
                        style={[
                            styles.floatingCircle,
                            {
                                left: Math.random() * width,
                                top: Math.random() * (height * 0.4),
                                width: 30 + Math.random() * 80,
                                height: 30 + Math.random() * 80,
                                backgroundColor: [
                                    Palette.green.light,
                                    Palette.blue.light,
                                    Palette.yellow.light,
                                    Palette.orange.light,
                                ][i % 4] + '30',
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
                        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Botón Volver */}
                    <Animated.View entering={FadeInDown.delay(100).springify()}>
                        <Ionicons
                            name="arrow-back"
                            size={28}
                            color={colors.text}
                            style={styles.backButton}
                            onPress={() => router.back()}
                        />
                    </Animated.View>

                    {/* Formulario con efecto glass */}
                    <Animated.View
                        entering={FadeInUp.delay(300).springify()}
                        style={[styles.formContainer, Shadows.lg, { marginTop: Spacing.xl }]}
                    >
                        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
                            <LinearGradient
                                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                                style={styles.formGradient}
                            >
                                <View style={styles.header}>
                                    <Text style={[styles.formTitle, { color: colors.text }]}>
                                        Únete a Ecotip
                                    </Text>
                                    <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
                                        Comienza a hacer la diferencia
                                    </Text>
                                </View>

                                {/* Input Name */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                        Nombre Completo
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
                                            placeholder="Juan Pérez"
                                            placeholderTextColor={colors.textSecondary}
                                            value={name}
                                            onChangeText={setName}
                                            autoCapitalize="words"
                                        />
                                    </View>
                                </View>

                                {/* Input Email */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                        Correo Electrónico
                                    </Text>
                                    <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                                        <Ionicons
                                            name="mail-outline"
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
                                    title="Crear Cuenta"
                                    onPress={handleRegister}
                                    loading={isLoading}
                                    icon="leaf-outline"
                                    iconPosition="right"
                                />

                                {/* Divider */}
                                <View style={styles.divider}>
                                    <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                                    <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
                                        o regístrate con
                                    </Text>
                                    <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                                </View>

                                {/* Google Button */}
                                <AnimatedButton
                                    title="Registrarse con Google"
                                    onPress={handleGoogleRegister}
                                    loading={isGoogleLoading}
                                    variant="outline"
                                    icon="logo-google"
                                />
                            </LinearGradient>
                        </BlurView>
                    </Animated.View>

                    {/* Login Link */}
                    <Animated.View
                        entering={FadeInUp.delay(500).springify()}
                        style={styles.loginSection}
                    >
                        <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                            ¿Ya tienes cuenta?
                        </Text>
                        <AnimatedButton
                            title="Iniciar Sesión"
                            onPress={() => router.back()}
                            variant="outline"
                            icon="log-in-outline"
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
    backButton: {
        marginBottom: Spacing.md,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
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
        fontSize: Typography.size.xxl,
        fontWeight: Typography.weight.bold,
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    formSubtitle: {
        fontSize: Typography.size.md,
        textAlign: 'center',
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
    loginSection: {
        alignItems: 'center',
    },
    loginText: {
        fontSize: Typography.size.sm,
        marginBottom: Spacing.md,
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
});
