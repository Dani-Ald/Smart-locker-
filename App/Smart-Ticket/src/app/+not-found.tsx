import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import EmptyState from '@/components/EmptyState';
import { useSessionContext } from '@/context/SessionContext';
import { Colors } from '@/constants/theme';

export default function NotFoundScreen() {
  const { session } = useSessionContext();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
      <EmptyState
        emoji="🧭"
        title="Página no encontrada"
        subtitle="El enlace no corresponde a una pantalla disponible."
        actionLabel={session ? 'Ir a Inicio' : 'Iniciar sesión'}
        onAction={() => router.replace(session ? '/' : '/(auth)/login')}
      />
    </SafeAreaView>
  );
}
