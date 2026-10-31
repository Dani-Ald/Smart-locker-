import { SymbolView } from 'expo-symbols';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useSessionContext } from '@/context/SessionContext';
import { useWalletTheme } from '@/hooks/use-wallet-theme';
import { authenticateWithBiometrics, isBiometricEnabled } from '@/services/biometricService';

export function BiometricGate({ children }: PropsWithChildren) {
  const colors = useWalletTheme();
  const { session, isLoading } = useSessionContext();
  const userId = session?.id ?? null;
  const [locked, setLocked] = useState(false);
  const [evaluatedUserId, setEvaluatedUserId] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const appState = useRef(AppState.currentState);

  const unlockIfNeeded = useCallback(async () => {
    if (!userId) {
      return;
    }
    const enabled = await isBiometricEnabled(userId);
    setBiometricEnabledState(enabled);
    setEvaluatedUserId(userId);
    if (!enabled) {
      setLocked(false);
      return;
    }
    setLocked(true);
    if (await authenticateWithBiometrics()) setLocked(false);
  }, [userId]);

  useEffect(() => {
    if (!isLoading && userId) {
      void isBiometricEnabled(userId).then(() => unlockIfNeeded());
    }
  }, [isLoading, userId, unlockIfNeeded]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') void unlockIfNeeded();
      if (biometricEnabled && next.match(/inactive|background/) && evaluatedUserId === userId) setLocked(true);
      appState.current = next;
    });
    return () => subscription.remove();
  }, [biometricEnabled, evaluatedUserId, userId, unlockIfNeeded]);

  if (!isLoading && userId && evaluatedUserId !== userId) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }
  if (!locked) return children;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
        <SymbolView name={{ ios: 'lock.shield', android: 'shield_lock', web: 'shield_lock' }} size={38} tintColor={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Wallet bloqueada</Text>
      <Text style={[styles.copy, { color: colors.textSecondary }]}>Confirma tu identidad para acceder a tus boletos.</Text>
      <Pressable onPress={() => void unlockIfNeeded()} style={[styles.button, { backgroundColor: colors.primary }]}>
        <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Desbloquear</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four, gap: Spacing.three },
  icon: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.heavy },
  copy: { maxWidth: 320, textAlign: 'center', fontSize: FontSize.base },
  button: { minHeight: 50, minWidth: 180, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full },
  buttonText: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
});
