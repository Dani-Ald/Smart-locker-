import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TicketCard } from '@/components/tickets/TicketCard';
import { WalletBackdrop } from '@/components/ui/GlassSurface';
import { FontSize, FontWeight, MaxContentWidth, Radius, Spacing, WalletPalette } from '@/constants/theme';
import { WEB_EVENTS_URL } from '@/constants/web';
import { useSessionContext } from '@/context/SessionContext';
import { useCurrentTime } from '@/hooks/use-current-time';
import { useWallet } from '@/hooks/use-wallet';
import { useWalletTheme } from '@/hooks/use-wallet-theme';
import { openWebPage } from '@/services/externalNavigation';

type DiagnosticLevel = 'info' | 'success' | 'warning' | 'error';

type DiagnosticEntry = {
  level: DiagnosticLevel;
  message: string;
};

export default function WalletScreen() {
  const colors = useWalletTheme();
  const { session } = useSessionContext();
  const wallet = useWallet();
  const now = useCurrentTime();
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const cancelled = wallet.tickets.filter((ticket) => ticket.estado === 'cancelado');
  const invalidDate = wallet.tickets.filter((ticket) => Number.isNaN(new Date(ticket.evento.fechaHora).getTime()));
  const expired = wallet.tickets.filter((ticket) => {
    const eventTime = new Date(ticket.evento.fechaHora).getTime();
    return !Number.isNaN(eventTime) && eventTime < now && ticket.estado !== 'cancelado';
  });
  const future = wallet.tickets
    .filter((ticket) => new Date(ticket.evento.fechaHora).getTime() >= now && ticket.estado !== 'cancelado')
    .sort((a, b) => new Date(a.evento.fechaHora).getTime() - new Date(b.evento.fechaHora).getTime());
  const [next, ...later] = future;
  const synced = wallet.diagnostics.stage === 'sincronizado' && !wallet.error && !wallet.offline;
  const syncLabel = wallet.error ? 'Sin actualizar' : wallet.offline ? 'Sin conexión' : synced ? 'Sincronizado' : 'Sincronizando…';
  const diagnostics = buildDiagnostics({
    hasSession: Boolean(session?.id && session?.token),
    wallet,
    visibleCount: future.length,
    cancelledCount: cancelled.length,
    expiredCount: expired.length,
    invalidDateCount: invalidDate.length,
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <WalletBackdrop />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={wallet.refreshing}
            onRefresh={() => void wallet.refresh()}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>SMART TICKET WALLET</Text>
            <Text style={[styles.heading, { color: colors.text }]}>Mis boletos</Text>
          </View>
          <View accessibilityLiveRegion="polite" style={[styles.syncBadge, { backgroundColor: synced ? colors.successSoft : colors.surfaceMuted }]}>
            <SymbolView
              name={wallet.offline
                ? { ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' }
                : synced ? { ios: 'checkmark.icloud', android: 'cloud_done', web: 'cloud_done' }
                  : { ios: 'arrow.clockwise', android: 'sync', web: 'sync' }}
              size={18}
              tintColor={synced ? colors.success : colors.textSecondary}
            />
            <Text style={[styles.syncText, { color: synced ? colors.success : colors.textSecondary }]}>
              {syncLabel}
            </Text>
          </View>
        </View>

        {wallet.error ? (
          <View style={[styles.notice, { backgroundColor: colors.warningSoft }]}>
            <Text style={[styles.noticeText, { color: colors.warning }]}>{wallet.error}</Text>
            <Pressable accessibilityRole="button" disabled={wallet.refreshing} onPress={() => void wallet.refresh()} style={styles.retryButton}>
              <Text style={[styles.retryButtonText, { color: colors.warning }]}>Reintentar</Text>
            </Pressable>
          </View>
        ) : null}

        {next ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Tu próximo acceso</Text>
            <TicketCard ticket={next} featured now={now} />
          </View>
        ) : wallet.loading ? (
          <View style={[styles.loadingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.loadingLineLarge, { backgroundColor: colors.surfaceMuted }]} />
            <View style={[styles.loadingLine, { backgroundColor: colors.surfaceMuted }]} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Buscando tus boletos guardados…</Text>
          </View>
        ) : (
          <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
              <SymbolView
                name={{ ios: 'ticket', android: 'confirmation_number', web: 'confirmation_number' }}
                size={34}
                tintColor={colors.primary}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{wallet.error ? 'No pudimos cargar tus boletos' : wallet.offline ? 'Sin boletos guardados' : 'Tu próxima experiencia empieza aquí'}</Text>
            <Text style={[styles.emptyCopy, { color: colors.textSecondary }]}>
              Tus próximos accesos aparecerán aquí. Abre la app con conexión después de comprar para guardarlos en este dispositivo.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void openWebPage(WEB_EVENTS_URL)}
              style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}>
              <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>Explorar cartelera</Text>
              <SymbolView
                name={{ ios: 'arrow.up.right', android: 'open_in_new', web: 'open_in_new' }}
                size={18}
                tintColor={colors.onPrimary}
              />
            </Pressable>
          </View>
        )}

        {later.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Próximamente</Text>
            {later.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} now={now} />)}
          </View>
        ) : null}

        {__DEV__ ? <View style={styles.diagnosticsSection}>
          <Pressable
            accessibilityLabel={showDiagnostics ? 'Ocultar diagnóstico de boletos' : 'Mostrar diagnóstico de boletos'}
            accessibilityRole="button"
            accessibilityState={{ expanded: showDiagnostics }}
            onPress={() => setShowDiagnostics((current) => !current)}
            style={({ pressed }) => [
              styles.diagnosticsToggle,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && styles.pressed,
            ]}>
            <View style={styles.diagnosticsToggleLabel}>
              <SymbolView
                name={{ ios: 'stethoscope', android: 'troubleshoot', web: 'troubleshoot' }}
                size={20}
                tintColor={colors.primary}
              />
              <Text style={[styles.diagnosticsToggleText, { color: colors.text }]}>Diagnóstico temporal</Text>
            </View>
            <SymbolView
              name={showDiagnostics
                ? { ios: 'chevron.up', android: 'keyboard_arrow_up', web: 'keyboard_arrow_up' }
                : { ios: 'chevron.down', android: 'keyboard_arrow_down', web: 'keyboard_arrow_down' }}
              size={22}
              tintColor={colors.textSecondary}
            />
          </Pressable>

          {showDiagnostics ? (
            <View
              accessibilityLiveRegion="polite"
              style={[styles.diagnosticsPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.diagnosticsHeader}>
                <View>
                  <Text style={[styles.diagnosticsTitle, { color: colors.text }]}>Log de sincronización</Text>
                  <Text style={[styles.diagnosticsCaption, { color: colors.textSecondary }]}>No muestra tokens ni datos personales.</Text>
                </View>
                <View style={[styles.temporaryBadge, { backgroundColor: colors.warningSoft }]}>
                  <Text style={[styles.temporaryBadgeText, { color: colors.warning }]}>TEMPORAL</Text>
                </View>
              </View>

              <View style={styles.diagnosticsList}>
                {diagnostics.map((entry, index) => (
                  <View key={`${entry.message}-${index}`} style={styles.diagnosticsRow}>
                    <View style={[styles.diagnosticsDot, { backgroundColor: diagnosticColor(entry.level, colors) }]} />
                    <Text style={[styles.diagnosticsMessage, { color: colors.textSecondary }]}>{entry.message}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                accessibilityLabel="Reintentar sincronización de boletos"
                accessibilityRole="button"
                disabled={wallet.refreshing}
                onPress={() => void wallet.refresh()}
                style={({ pressed }) => [
                  styles.retryButton,
                  { backgroundColor: colors.primarySoft },
                  pressed && styles.pressed,
                  wallet.refreshing && styles.disabled,
                ]}>
                <SymbolView
                  name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
                  size={18}
                  tintColor={colors.primary}
                />
                <Text style={[styles.retryButtonText, { color: colors.primary }]}>
                  {wallet.refreshing ? 'Sincronizando…' : 'Reintentar sincronización'}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

type WalletState = ReturnType<typeof useWallet>;

function buildDiagnostics({
  hasSession,
  wallet,
  visibleCount,
  cancelledCount,
  expiredCount,
  invalidDateCount,
}: {
  hasSession: boolean;
  wallet: WalletState;
  visibleCount: number;
  cancelledCount: number;
  expiredCount: number;
  invalidDateCount: number;
}): DiagnosticEntry[] {
  const entries: DiagnosticEntry[] = [];
  entries.push({
    level: hasSession ? 'success' : 'error',
    message: hasSession ? 'Sesión disponible para consultar la wallet.' : 'No hay una sesión válida para consultar boletos.',
  });
  entries.push({ level: 'info', message: `Etapa actual: ${stageLabel(wallet.diagnostics.stage)}.` });

  if (wallet.offline) entries.push({ level: 'warning', message: 'La wallet está usando la caché local o detectó un fallo de red.' });
  else entries.push({ level: 'info', message: 'No se ha detectado desconexión; esto no confirma disponibilidad del servicio.' });

  if (wallet.error) entries.push({ level: 'error', message: `Último error: ${wallet.error}` });
  if (wallet.loading) entries.push({ level: 'info', message: 'La carga inicial todavía no termina.' });
  if (wallet.refreshing) entries.push({ level: 'info', message: 'Hay una sincronización manual en curso.' });

  if (wallet.diagnostics.remoteTicketCount !== null) {
    entries.push({ level: 'info', message: `La API devolvió ${wallet.diagnostics.remoteTicketCount} boleto(s).` });
  }
  entries.push({ level: 'info', message: `La caché local contiene ${wallet.diagnostics.localTicketCount} boleto(s).` });
  entries.push({
    level: visibleCount > 0 ? 'success' : 'warning',
    message: `${visibleCount} boleto(s) cumplen las condiciones para mostrarse en “Mis boletos”.`,
  });

  if (cancelledCount > 0) entries.push({ level: 'warning', message: `${cancelledCount} boleto(s) están cancelados y se ocultan.` });
  if (expiredCount > 0) entries.push({ level: 'warning', message: `${expiredCount} boleto(s) pertenecen a eventos pasados y se ocultan aquí.` });
  if (invalidDateCount > 0) entries.push({ level: 'error', message: `${invalidDateCount} boleto(s) tienen una fecha de evento inválida.` });

  const missingQrCount = wallet.tickets.filter(
    (ticket) => ['pagado', 'usado'].includes(ticket.estado) && !ticket.qrPayload,
  ).length;
  if (missingQrCount > 0) entries.push({ level: 'warning', message: `${missingQrCount} boleto(s) pagados todavía no tienen QR firmado.` });

  if (!wallet.loading && !wallet.error && wallet.tickets.length === 0) {
    entries.push({ level: 'warning', message: 'No hay boletos en la respuesta remota ni en la caché de este dispositivo.' });
  }

  if (wallet.diagnostics.lastAttemptAt) {
    entries.push({ level: 'info', message: `Último intento: ${formatDiagnosticDate(wallet.diagnostics.lastAttemptAt)}.` });
  }
  if (wallet.diagnostics.lastSuccessAt) {
    entries.push({ level: 'success', message: `Última sincronización correcta: ${formatDiagnosticDate(wallet.diagnostics.lastSuccessAt)}.` });
  }

  return entries;
}

function stageLabel(stage: WalletState['diagnostics']['stage']): string {
  const labels: Record<WalletState['diagnostics']['stage'], string> = {
    inicializando: 'inicializando',
    'comprobando-red': 'comprobando conexión',
    'leyendo-cache': 'leyendo caché local',
    'consultando-api': 'consultando la API',
    'guardando-cache': 'guardando boletos localmente',
    sincronizado: 'sincronización completada',
    'sin-conexion': 'sin conexión',
    error: 'error de sincronización',
  };
  return labels[stage];
}

function diagnosticColor(level: DiagnosticLevel, colors: WalletPalette): string {
  if (level === 'success') return colors.success;
  if (level === 'warning') return colors.warning;
  if (level === 'error') return colors.danger;
  return colors.primary;
}

function formatDiagnosticDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'fecha inválida' : date.toLocaleString('es-MX');
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.four, paddingBottom: 120, gap: Spacing.four },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  eyebrow: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, letterSpacing: 1.1 },
  heading: { fontSize: FontSize['4xl'], fontWeight: FontWeight.heavy, letterSpacing: -0.7 },
  syncBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, paddingHorizontal: Spacing.two, minHeight: 36, borderRadius: Radius.full },
  syncText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  notice: { borderRadius: Radius.lg, padding: Spacing.three },
  noticeText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  section: { gap: Spacing.three },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, letterSpacing: 0.8, textTransform: 'uppercase' },
  loadingCard: { height: 190, padding: Spacing.four, gap: Spacing.three, borderRadius: Radius.xl, borderWidth: StyleSheet.hairlineWidth },
  loadingLineLarge: { width: '70%', height: 24, borderRadius: Radius.sm },
  loadingLine: { width: '45%', height: 16, borderRadius: Radius.sm },
  loadingText: { marginTop: 'auto', fontSize: FontSize.sm },
  empty: { alignItems: 'center', padding: Spacing.four, gap: Spacing.three, borderRadius: Radius.xl, borderWidth: StyleSheet.hairlineWidth },
  emptyIcon: { width: 72, height: 72, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  emptyCopy: { maxWidth: 420, textAlign: 'center', fontSize: FontSize.base, lineHeight: 21 },
  primaryButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, alignSelf: 'stretch', borderRadius: Radius.full, paddingHorizontal: Spacing.three },
  primaryButtonText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  diagnosticsSection: { gap: Spacing.two },
  diagnosticsToggle: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two, paddingHorizontal: Spacing.three, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth },
  diagnosticsToggleLabel: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  diagnosticsToggleText: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  diagnosticsPanel: { gap: Spacing.three, padding: Spacing.three, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth },
  diagnosticsHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.two },
  diagnosticsTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  diagnosticsCaption: { marginTop: Spacing.one, fontSize: FontSize.sm },
  temporaryBadge: { minHeight: 28, justifyContent: 'center', paddingHorizontal: Spacing.two, borderRadius: Radius.full },
  temporaryBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.heavy, letterSpacing: 0.7 },
  diagnosticsList: { gap: Spacing.two },
  diagnosticsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  diagnosticsDot: { width: 8, height: 8, marginTop: 5, borderRadius: Radius.full },
  diagnosticsMessage: { flex: 1, fontSize: FontSize.sm, lineHeight: 18 },
  retryButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, borderRadius: Radius.full, paddingHorizontal: Spacing.three },
  retryButtonText: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.55 },
});
