import React, { useEffect, useRef } from 'react';
import { View, useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider, Stack, router, usePathname, useRootNavigationState, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { TicketLoader } from '@/components/TicketLoader';
import { BiometricGate } from '@/components/security/BiometricGate';
import ErrorState from '@/components/ErrorState';
import { ToastRoot } from '@/components/Toast';
import { Colors } from '@/constants/theme';
import { SessionProvider, useSessionContext } from '@/context/SessionContext';
import { useOtaUpdate } from '@/hooks/use-ota-update';
import { WalletProvider } from '@/hooks/use-wallet';
import { destinoBoleto } from '@/navigation/routes';
import { precalentarApi } from '@/services/apiWarmupService';

void SplashScreen.preventAutoHideAsync();

export const unstable_settings = { anchor: '(tabs)' };

function RootNavigator() {
  const { session, isLoading, storageError, logoutError, retrySession, clearSession } = useSessionContext();
  const pathname = usePathname();
  const navigation = useRootNavigationState();
  const pendiente = useRef<Href | null>(null);
  const tuvoSesion = useRef(false);
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    if (!session) {
      // Un logout nunca debe guardar como destino la pantalla que se abandona.
      if (tuvoSesion.current) pendiente.current = null;
      else pendiente.current = destinoBoleto(pathname) ?? pendiente.current;
      if (pathname === '/login' || pathname === '/register') tuvoSesion.current = false;
    } else if (!isLoading && navigation?.key && pendiente.current) {
      const destino = pendiente.current;
      pendiente.current = null;
      router.navigate(destino, { withAnchor: true });
    }
    if (session) tuvoSesion.current = true;
  }, [session, isLoading, pathname, navigation?.key]);

  if (isLoading || storageError || logoutError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        {logoutError ? (
          <ErrorState title="No se pudo borrar la sesión guardada" message={logoutError} onRetry={() => {
            // El hook conserva el error visible si el reintento también falla.
            void clearSession().catch(() => {});
          }} />
        ) : storageError ? (
          <ErrorState title="No se pudo leer la sesión" message={storageError} onRetry={() => void retrySession()} />
        ) : <TicketLoader />}
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="boleto/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useOtaUpdate();

  useEffect(() => {
    void precalentarApi();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <SessionProvider>
        <AnimatedSplashOverlay />
        <BiometricGate>
          <WalletProvider>
            <RootNavigator />
          </WalletProvider>
        </BiometricGate>
        <ToastRoot />
      </SessionProvider>
    </ThemeProvider>
  );
}
