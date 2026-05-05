import { db } from '@/config/firebase';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/store/AuthContext';
import SplashScreen from '@/components/SplashScreen';
import { Redirect } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const isAppReady = !loading && !checkingOnboarding;

  useEffect(() => {
    let cancelled = false;

    const checkOnboarding = async () => {
      if (user) {
        try {
          // Timeout de 5 segundos para evitar carga infinita
          const timeout = new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), 5000)
          );
          const docPromise = getDoc(doc(db, 'users', user.uid));

          const result: any = await Promise.race([docPromise, timeout]);

          if (!cancelled) {
            if (result && result.exists && result.exists() && result.data()?.onboardingCompleted) {
              setOnboardingDone(true);
            } else {
              setOnboardingDone(false);
            }
          }
        } catch {
          if (!cancelled) {
            setOnboardingDone(false);
          }
        }
      }
      if (!cancelled) {
        setCheckingOnboarding(false);
      }
    };

    if (!loading) {
      if (user) {
        checkOnboarding();
      } else {
        setCheckingOnboarding(false);
      }
    }

    return () => { cancelled = true; };
  }, [user, loading]);

  const handleSplashFinished = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Determine redirect destination
  const getRedirect = () => {
    if (!isAppReady) return null;
    if (user) {
      if (onboardingDone) {
        return <Redirect href="/(tabs)/challenges" />;
      }
      return <Redirect href="/(auth)/onboarding" />;
    }
    return <Redirect href="/(auth)/login" />;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Render the destination redirect (behind splash) */}
      {getRedirect()}

      {/* Splash overlays everything, fades out when ready */}
      {showSplash && (
        <SplashScreen
          isReady={isAppReady}
          onFinished={handleSplashFinished}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});