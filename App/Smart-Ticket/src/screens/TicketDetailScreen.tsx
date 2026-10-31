import * as Brightness from 'expo-brightness';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FontSize, FontWeight, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { SUPPORT_WHATSAPP_NUMBER } from '@/constants/web';
import { useSessionContext } from '@/context/SessionContext';
import { getLocalTicket } from '@/data/ticketRepository';
import { useCurrentTime } from '@/hooks/use-current-time';
import { useWalletTheme } from '@/hooks/use-wallet-theme';
import { openMap } from '@/services/externalNavigation';
import type { WalletTicket } from '@/types/ticket';

export default function TicketDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const { session } = useSessionContext();
  const userId = session?.id ?? '';
  const colors = useWalletTheme();
  const [ticket, setTicket] = useState<WalletTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brightnessError, setBrightnessError] = useState<string | null>(null);
  const now = useCurrentTime();

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    if (!id || !userId) {
      setError('Boleto inválido.');
      setLoading(false);
      return () => { active = false; };
    }
    getLocalTicket(id, userId)
      .then((value) => {
        if (!active) return;
        setTicket(value);
        setError(value ? null : 'Este boleto no está guardado en el dispositivo.');
      })
      .catch(() => { if (active) setError('No fue posible abrir el boleto guardado.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, userId]));

  const canShowQr = !!ticket?.qrPayload
    && ticket.estado === 'pagado'
    && new Date(ticket.evento.fechaHora).getTime() >= now;

  useFocusEffect(useCallback(() => {
    if (!canShowQr) return undefined;
    let previous: number | null = null;
    let mounted = true;
    Brightness.getBrightnessAsync()
      .then((value) => {
        previous = value;
        return Brightness.setBrightnessAsync(1);
      })
      .catch(() => { if (mounted) setBrightnessError('No se pudo aumentar el brillo automáticamente.'); });
    return () => {
      mounted = false;
      if (previous !== null) {
        void Brightness.setBrightnessAsync(previous).catch((err) => console.warn('[brightness] No se pudo restaurar el brillo.', err));
      }
    };
  }, [canShowQr]));

  if (loading) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} /></View>;
  }

  if (!ticket || error) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.text }]}>No pudimos abrir este boleto</Text>
        <Text style={[styles.errorCopy, { color: colors.textSecondary }]}>{error}</Text>
        <Pressable onPress={() => router.back()} style={[styles.action, { backgroundColor: colors.primary }]}>
          <Text style={[styles.actionText, { color: colors.onPrimary }]}>Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Volver" onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.surface }]}>
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={22} tintColor={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Tu acceso</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.ticket, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <View style={styles.ticketHeader}>
            <Text style={[styles.eventName, { color: colors.text }]}>{ticket.evento.nombre}</Text>
            <Text style={[styles.ticketType, { color: colors.primary }]}>{ticket.tipoBoleto}</Text>
          </View>

          <View style={[styles.dashed, { borderColor: colors.border }]} />

          {canShowQr && ticket.qrPayload ? (
            <View style={styles.qrSection}>
              <View style={[styles.qrFrame, { backgroundColor: colors.qrBackground }]}>
                <QRCode
                  value={ticket.qrPayload}
                  size={230}
                  color={colors.qrForeground}
                  backgroundColor={colors.qrBackground}
                  ecl="M"
                  quietZone={8}
                />
              </View>
              <Text style={[styles.qrHint, { color: colors.textSecondary }]}>Presenta este código en el acceso</Text>
              <View style={[styles.offlineBadge, { backgroundColor: colors.successSoft }]}>
                <SymbolView name={{ ios: 'checkmark.shield', android: 'verified_user', web: 'verified_user' }} size={18} tintColor={colors.success} />
                <Text style={[styles.offlineText, { color: colors.success }]}>Disponible sin conexión</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.inactiveQr, { backgroundColor: colors.surfaceMuted }]}>
              <SymbolView name={{ ios: 'qrcode', android: 'qr_code_2', web: 'qr_code_2' }} size={64} tintColor={colors.textSecondary} />
              <Text style={[styles.inactiveTitle, { color: colors.text }]}>Código QR inactivo</Text>
              <Text style={[styles.inactiveCopy, { color: colors.textSecondary }]}>El evento terminó o este boleto ya no está activo.</Text>
            </View>
          )}

          <View style={[styles.dashed, { borderColor: colors.border }]} />
          <View style={styles.details}>
            <Detail label="Fecha" value={new Intl.DateTimeFormat('es-MX', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(ticket.evento.fechaHora))} colors={colors} />
            <Detail label="Lugar" value={`${ticket.evento.ubicacion || ticket.evento.municipio}`} colors={colors} />
            <Detail label="Folio" value={ticket.id.toUpperCase()} colors={colors} />
          </View>
        </View>

        {brightnessError ? <Text style={[styles.warning, { color: colors.warning }]}>{brightnessError}</Text> : null}

        <View style={styles.actionsRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => void openMap(`${ticket.evento.ubicacion}, ${ticket.evento.municipio}`)}
            style={[styles.secondaryAction, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <SymbolView name={{ ios: 'map', android: 'map', web: 'map' }} size={22} tintColor={colors.primary} />
            <Text style={[styles.secondaryText, { color: colors.text }]}>Cómo llegar</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !SUPPORT_WHATSAPP_NUMBER }}
            disabled={!SUPPORT_WHATSAPP_NUMBER}
            onPress={() => SUPPORT_WHATSAPP_NUMBER && void Linking.openURL(`https://wa.me/${SUPPORT_WHATSAPP_NUMBER}`)}
            style={[styles.secondaryAction, { backgroundColor: colors.surface, borderColor: colors.border }, !SUPPORT_WHATSAPP_NUMBER && styles.disabled]}>
            <SymbolView name={{ ios: 'message', android: 'chat', web: 'chat' }} size={22} tintColor={colors.primary} />
            <Text style={[styles.secondaryText, { color: colors.text }]}>Soporte</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Detail({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useWalletTheme> }) {
  return <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text><Text selectable style={[styles.detailValue, { color: colors.text }]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, padding: Spacing.four },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 44, height: 44, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold }, headerSpacer: { width: 44 },
  ticket: { overflow: 'hidden', borderRadius: Radius.xl + 8, borderWidth: StyleSheet.hairlineWidth, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 5 },
  ticketHeader: { padding: Spacing.four, gap: Spacing.one }, eventName: { fontSize: FontSize['2xl'], fontWeight: FontWeight.heavy }, ticketType: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  dashed: { borderTopWidth: 1, borderStyle: 'dashed', marginHorizontal: Spacing.three },
  qrSection: { alignItems: 'center', padding: Spacing.four, gap: Spacing.two }, qrFrame: { padding: Spacing.two, borderRadius: Radius.lg },
  qrHint: { fontSize: FontSize.sm }, offlineBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, borderRadius: Radius.full, paddingVertical: Spacing.one, paddingHorizontal: Spacing.two }, offlineText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  inactiveQr: { alignItems: 'center', margin: Spacing.four, padding: Spacing.four, gap: Spacing.two, borderRadius: Radius.xl }, inactiveTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold }, inactiveCopy: { textAlign: 'center', fontSize: FontSize.base },
  details: { padding: Spacing.four, gap: Spacing.three }, detailRow: { gap: Spacing.one }, detailLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium }, detailValue: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  actionsRow: { flexDirection: 'row', gap: Spacing.two }, secondaryAction: { minHeight: 56, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth }, secondaryText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold }, disabled: { opacity: 0.45 },
  warning: { fontSize: FontSize.sm, textAlign: 'center' }, errorTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center' }, errorCopy: { fontSize: FontSize.base, textAlign: 'center' },
  action: { minHeight: 48, borderRadius: Radius.full, justifyContent: 'center', paddingHorizontal: Spacing.four }, actionText: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
});
