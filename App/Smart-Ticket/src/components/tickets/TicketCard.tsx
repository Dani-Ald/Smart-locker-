import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { Duration, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useWalletTheme } from '@/hooks/use-wallet-theme';
import type { WalletTicket } from '@/types/ticket';

type Props = { ticket: WalletTicket; featured?: boolean; now: number };
const welcomed = new Set<string>();

export function TicketCard({ ticket, featured = false, now }: Props) {
  const colors = useWalletTheme();
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const progress = useSharedValue(1);
  const past = new Date(ticket.evento.fechaHora).getTime() < now;
  const active = !past && ticket.estado === 'pagado' && !!ticket.qrPayload;
  const key = `${ticket.ownerId}:${ticket.id}`;

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (mounted) setReduceMotion(value); });
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { mounted = false; listener.remove(); };
  }, []);
  useFocusEffect(useCallback(() => {
    if (featured && reduceMotion === false && !welcomed.has(key)) {
      welcomed.add(key);
      progress.set(0);
      progress.set(withTiming(1, { duration: Duration.ticket, easing: Easing.out(Easing.cubic) }));
    }
    const settle = () => { cancelAnimation(progress); progress.set(1); };
    if (reduceMotion) settle();
    const listener = AppState.addEventListener('change', (state) => { if (state !== 'active') settle(); });
    return () => { settle(); listener.remove(); };
  }, [featured, key, progress, reduceMotion]));
  const entrance = useAnimatedStyle(() => ({
    opacity: 0.4 + progress.get() * 0.6,
    transform: [{ perspective: 1000 }, { translateY: (1 - progress.get()) * 16 }, { rotateX: `${(1 - progress.get()) * 5}deg` }],
  }));
  const reflection = useAnimatedStyle(() => ({
    opacity: Math.sin(progress.get() * Math.PI) * 0.45,
    transform: [{ translateX: -160 + progress.get() * 650 }, { rotate: '18deg' }],
  }));
  const date = new Date(ticket.evento.fechaHora);
  const formattedDate = Number.isNaN(date.getTime()) ? 'Fecha por confirmar' : new Intl.DateTimeFormat('es-MX', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(date);

  return (
    <Animated.View style={entrance}>
      <Pressable
        accessibilityLabel={`Abrir boleto para ${ticket.evento.nombre}, ${ticket.tipoBoleto}, ${formattedDate}, ${ticket.evento.ubicacion || ticket.evento.municipio}`}
        accessibilityRole="button"
        onPress={() => router.push({ pathname: '/boleto/[id]', params: { id: ticket.id } })}
        style={({ pressed }) => pressed && (reduceMotion ? styles.pressedStill : styles.pressed)}>
        <GlassSurface style={styles.card}>
          <View style={styles.topRow}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>SMART TICKET / ACCESO</Text>
            <View style={[styles.status, { backgroundColor: active ? colors.successSoft : colors.surfaceMuted }]}>
              <Text style={[styles.statusText, { color: active ? colors.success : colors.textSecondary }]}>
                {active ? 'Listo' : past ? 'Finalizado' : ticket.estado}
              </Text>
            </View>
          </View>
          <Text style={[styles.title, featured && styles.featuredTitle, { color: colors.text }]}>{ticket.evento.nombre}</Text>
          <Text style={[styles.type, { color: colors.textSecondary }]}>{ticket.tipoBoleto}</Text>
          <View style={[styles.divider, { borderColor: colors.border }]} />
          <View style={styles.metaRow}>
            <SymbolView name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }} size={20} tintColor={colors.primary} />
            <Text style={[styles.meta, { color: colors.text }]}>{formattedDate}</Text>
          </View>
          <View style={styles.metaRow}>
            <SymbolView name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }} size={20} tintColor={colors.primary} />
            <Text style={[styles.meta, { color: colors.textSecondary }]}>{ticket.evento.ubicacion || ticket.evento.municipio}</Text>
          </View>
          <View style={[styles.footer, { borderColor: colors.border }]}>
            <Text style={[styles.openText, { color: colors.primary }]}>Ver mi boleto</Text>
            <View style={[styles.open, { backgroundColor: colors.primarySoft }]}>
              <SymbolView name={{ ios: 'arrow.up.right', android: 'north_east', web: 'north_east' }} size={22} tintColor={colors.primary} />
            </View>
          </View>
          {featured && reduceMotion === false ? <Animated.View pointerEvents="none" style={[styles.reflection, reflection]}>
            <LinearGradient colors={['transparent', colors.cyan, 'transparent']} style={StyleSheet.absoluteFill} />
          </Animated.View> : null}
        </GlassSurface>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.four, gap: Spacing.three },
  topRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  eyebrow: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 1.4 },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  featuredTitle: { fontSize: FontSize['3xl'], letterSpacing: -0.6 },
  type: { fontSize: FontSize.base, fontWeight: FontWeight.medium },
  status: { borderRadius: Radius.full, paddingHorizontal: Spacing.two, paddingVertical: Spacing.one },
  statusText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, textTransform: 'capitalize' },
  divider: { borderTopWidth: 1, borderStyle: 'dashed', marginVertical: Spacing.one },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  meta: { flex: 1, fontSize: FontSize.base, lineHeight: 22 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.three, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  open: { width: 44, height: 44, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  openText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  pressed: { transform: [{ scale: 0.99 }], opacity: 0.9 },
  pressedStill: { opacity: 0.9 },
  reflection: { position: 'absolute', width: 100, top: -40, bottom: -40 },
});
