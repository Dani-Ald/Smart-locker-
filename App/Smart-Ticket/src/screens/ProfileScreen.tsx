import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassSurface, WalletBackdrop } from '@/components/ui/GlassSurface';

import { FontSize, FontWeight, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useSessionContext } from '@/context/SessionContext';
import { useWalletTheme } from '@/hooks/use-wallet-theme';
import { logoutRemote } from '@/services/authService';
import { authenticateWithBiometrics, canUseBiometrics, isBiometricEnabled, setBiometricEnabled } from '@/services/biometricService';

export default function ProfileScreen() {
  const colors = useWalletTheme();
  const { session, clearSession } = useSessionContext();
  const [available, setAvailable] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [loadingPreference, setLoadingPreference] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.id) return;
    Promise.all([canUseBiometrics(), isBiometricEnabled(session.id)])
      .then(([canUse, enabled]) => { setAvailable(canUse); setBiometric(enabled); })
      .catch(() => setMessage('No fue posible consultar la seguridad biométrica.'))
      .finally(() => setLoadingPreference(false));
  }, [session?.id]);

  async function toggleBiometric(value: boolean) {
    if (!session?.id || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      if (value && !(await authenticateWithBiometrics())) {
        setMessage('No se confirmó la identidad. La biometría sigue desactivada.');
        return;
      }
      await setBiometricEnabled(session.id, value);
      setBiometric(value);
      setMessage(value ? 'Protección biométrica activada.' : 'Protección biométrica desactivada.');
    } catch {
      setMessage('No fue posible actualizar la protección biométrica.');
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    if (!session || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      await logoutRemote(session.token);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'La sesión se cerrará solo en este dispositivo.');
    } finally {
      try { await clearSession(); } finally { setBusy(false); }
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <WalletBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>CUENTA Y SEGURIDAD</Text>
          <Text style={[styles.heading, { color: colors.text }]}>Perfil</Text>
        </View>
        <GlassSurface style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{session?.nombre.trim().charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={[styles.name, { color: colors.text }]}>{session?.nombre}</Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>{session?.correo}</Text>
          </View>
        </GlassSurface>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Seguridad</Text>
        <View style={[styles.setting, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.settingIcon, { backgroundColor: colors.primarySoft }]}>
            <SymbolView name={{ ios: 'faceid', android: 'fingerprint', web: 'fingerprint' }} size={24} tintColor={colors.primary} />
          </View>
          <View style={styles.settingCopy}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Bloqueo biométrico</Text>
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{available ? 'Solicitar Face ID o huella al abrir la wallet.' : 'No disponible o no configurado en este dispositivo.'}</Text>
          </View>
          {loadingPreference ? <ActivityIndicator color={colors.primary} /> : (
            <Switch
              accessibilityLabel="Bloqueo biométrico"
              disabled={!available || busy}
              onValueChange={(value) => void toggleBiometric(value)}
              trackColor={{ false: colors.surfaceMuted, true: colors.primarySoft }}
              thumbColor={biometric ? colors.primary : colors.textSecondary}
              value={biometric}
            />
          )}
        </View>

        {message ? <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text> : null}
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={() => void logout()}
          style={[styles.logout, { backgroundColor: colors.dangerSoft }, busy && styles.disabled]}>
          {busy ? <ActivityIndicator color={colors.danger} /> : <>
            <SymbolView name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }} size={21} tintColor={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>Cerrar sesión</Text>
          </>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.four, paddingBottom: 120, gap: Spacing.three },
  eyebrow: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, letterSpacing: 1.1 }, heading: { fontSize: FontSize['4xl'], fontWeight: FontWeight.heavy },
  profileCard: { minHeight: 96, flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three, borderRadius: Radius.xl, borderWidth: StyleSheet.hairlineWidth }, avatar: { width: 60, height: 60, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' }, avatarText: { fontSize: FontSize['2xl'], fontWeight: FontWeight.heavy }, profileCopy: { flex: 1, gap: Spacing.one }, name: { fontSize: FontSize.lg, fontWeight: FontWeight.bold }, email: { fontSize: FontSize.base },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.8 }, setting: { minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three, borderRadius: Radius.xl, borderWidth: StyleSheet.hairlineWidth }, settingIcon: { width: 48, height: 48, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' }, settingCopy: { flex: 1, gap: Spacing.one }, settingTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold }, settingSubtitle: { fontSize: FontSize.sm, lineHeight: 18 }, message: { fontSize: FontSize.sm, textAlign: 'center' },
  logout: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, borderRadius: Radius.full, marginTop: Spacing.three }, logoutText: { fontSize: FontSize.base, fontWeight: FontWeight.bold }, disabled: { opacity: 0.55 },
});
