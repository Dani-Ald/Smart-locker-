import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { ToastRoot } from '@/components/Toast';
import { SessionProvider } from '@/context/SessionContext';
import { useOtaUpdate } from '@/hooks/use-ota-update';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Busca y aplica updates OTA al arrancar
  useOtaUpdate();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SessionProvider>
        <AnimatedSplashOverlay />
        <AppTabs />
        {/* Toast global — debe estar al final para quedar encima de todo */}
        <ToastRoot />
      </SessionProvider>
    </ThemeProvider>
  );
}
