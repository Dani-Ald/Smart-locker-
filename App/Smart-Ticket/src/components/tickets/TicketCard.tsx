import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useWalletTheme } from '@/hooks/use-wallet-theme';
import type { WalletTicket } from '@/types/ticket';

type Props = {
  ticket: WalletTicket;
  featured?: boolean;
  now: number;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
}

export function TicketCard({ ticket, featured = false, now }: Props) {
  const colors = useWalletTheme();
  const past = new Date(ticket.evento.fechaHora).getTime() < now;
  const active = !past && ticket.estado === 'pagado' && !!ticket.qrPayload;

  return (
    <Pressable
      accessibilityLabel={`Boleto para ${ticket.evento.nombre}`}
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/boleto/[id]', params: { id: ticket.id } })}
      style={({ pressed }) => [
        styles.card,
        featured && styles.featured,
        { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.accent, { backgroundColor: active ? colors.primary : colors.textSecondary }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.copy}>
            <Text numberOfLines={2} style={[styles.title, featured && styles.featuredTitle, { color: colors.text }]}>
              {ticket.evento.nombre}
            </Text>
            <Text style={[styles.type, { color: colors.textSecondary }]}>{ticket.tipoBoleto}</Text>
          </View>
          <View style={[styles.status, { backgroundColor: active ? colors.successSoft : colors.surfaceMuted }]}>
            <Text style={[styles.statusText, { color: active ? colors.success : colors.textSecondary }]}>
              {active ? 'Listo' : past ? 'Finalizado' : ticket.estado}
            </Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <SymbolView
            name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }}
            size={17}
            tintColor={colors.primary}
          />
          <Text style={[styles.meta, { color: colors.textSecondary }]}>{formatDate(ticket.evento.fechaHora)}</Text>
        </View>
        <View style={styles.metaRow}>
          <SymbolView
            name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }}
            size={17}
            tintColor={colors.primary}
          />
          <Text numberOfLines={1} style={[styles.meta, { color: colors.textSecondary }]}>
            {ticket.evento.ubicacion || ticket.evento.municipio}
          </Text>
        </View>
      </View>
      <View style={[styles.open, { backgroundColor: colors.primarySoft }]}>
        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={18}
          tintColor={colors.primary}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 150,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  featured: { minHeight: 190 },
  pressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  accent: { width: 6 },
  content: { flex: 1, padding: Spacing.three, gap: Spacing.two },
  topRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  copy: { flex: 1, gap: Spacing.one },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  featuredTitle: { fontSize: FontSize['2xl'] },
  type: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  status: { borderRadius: Radius.full, paddingHorizontal: Spacing.two, paddingVertical: Spacing.one },
  statusText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, textTransform: 'capitalize' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  meta: { flex: 1, fontSize: FontSize.base },
  open: { width: 44, alignItems: 'center', justifyContent: 'center' },
});
