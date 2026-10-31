import { SymbolView } from 'expo-symbols';
import { RefreshControl, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TicketCard } from '@/components/tickets/TicketCard';
import { FontSize, FontWeight, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { WEB_EVENTS_URL } from '@/constants/web';
import { useSessionContext } from '@/context/SessionContext';
import { useCurrentTime } from '@/hooks/use-current-time';
import { useWallet } from '@/hooks/use-wallet';
import { useWalletTheme } from '@/hooks/use-wallet-theme';
import { openWebPage } from '@/services/externalNavigation';

export default function WalletScreen() {
  const colors = useWalletTheme();
  const { session } = useSessionContext();
  const wallet = useWallet(session?.id ?? '', session?.token ?? '');
  const now = useCurrentTime();
  const future = wallet.tickets
    .filter((ticket) => new Date(ticket.evento.fechaHora).getTime() >= now && ticket.estado !== 'cancelado')
    .sort((a, b) => new Date(a.evento.fechaHora).getTime() - new Date(b.evento.fechaHora).getTime());
  const [next, ...later] = future;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
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
          <View style={[styles.syncBadge, { backgroundColor: wallet.offline ? colors.warningSoft : colors.successSoft }]}>
            <SymbolView
              name={wallet.offline
                ? { ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' }
                : { ios: 'checkmark.icloud', android: 'cloud_done', web: 'cloud_done' }}
              size={18}
              tintColor={wallet.offline ? colors.warning : colors.success}
            />
            <Text style={[styles.syncText, { color: wallet.offline ? colors.warning : colors.success }]}>
              {wallet.offline ? 'Sin conexión' : 'Sincronizado'}
            </Text>
          </View>
        </View>

        {wallet.error && wallet.tickets.length > 0 ? (
          <View style={[styles.notice, { backgroundColor: colors.warningSoft }]}>
            <Text style={[styles.noticeText, { color: colors.warning }]}>{wallet.error}</Text>
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
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Tu wallet está lista</Text>
            <Text style={[styles.emptyCopy, { color: colors.textSecondary }]}>
              Cuando compres un boleto en Smart Ticket aparecerá aquí y podrás abrirlo incluso sin internet.
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.four, paddingBottom: 120, gap: Spacing.four },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
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
  pressed: { opacity: 0.78 },
});
