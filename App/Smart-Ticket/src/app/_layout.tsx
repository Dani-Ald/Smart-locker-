import React, { useEffect } from 'react';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider, Slot, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { ToastRoot } from '@/components/Toast';
import { SessionProvider, useSessionContext } from '@/context/SessionContext';
import { useOtaUpdate } from '@/hooks/use-ota-update';

SplashScreen.preventAutoHideAsync();

function AuthGuard() {
  const { session, isLoading } = useSessionContext();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as string) === '(auth)';

    if (!session && !inAuthGroup) {
      // Redirigir obligatoriamente a la pantalla de Login si no hay sesión activa
      router.replace('/(auth)/login' as any);
    } else if (session && inAuthGroup) {
      // Redirigir a la pantalla principal si ya hay sesión activa
      router.replace('/');
    }
  }, [session, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  // Si no hay sesión activa, mostrar únicamente las pantallas de autenticación (Login/Registro)
  if (!session) {
    return <Slot />;
  }

  // Si hay sesión activa, mostrar la aplicación principal con sus pestañas de navegación
  return (
    <>
      <AppTabs />
      {/* Toast global — debe estar al final para quedar encima de todo */}
      <ToastRoot />
    </>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Busca y aplica updates OTA al arrancar
  useOtaUpdate();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SessionProvider>
        <AnimatedSplashOverlay />
        <AuthGuard />
      </SessionProvider>
    </ThemeProvider>
  );
}
