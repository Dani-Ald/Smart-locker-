import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, AppState, Pressable, StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { HoloTicket } from '@/components/tickets/HoloTicket';
import { Duration } from '@/constants/theme';
import type { WalletTicket } from '@/types/ticket';

type Props = { ticket: WalletTicket; featured?: boolean; now: number };
const welcomed = new Set<string>();

export function TicketCard({ ticket, featured = false, now }: Props) {
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const progress = useSharedValue(1);
  const hoverY = useSharedValue(0);
  const hoverScale = useSharedValue(1);

  const key = `${ticket.ownerId}:${ticket.id}`;

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduceMotion(value);
    });
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      listener.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (featured && reduceMotion === false && !welcomed.has(key)) {
        welcomed.add(key);
        progress.set(0);
        progress.set(withTiming(1, { duration: Duration.ticket, easing: Easing.out(Easing.cubic) }));
      }

      if (featured && reduceMotion === false) {
        hoverY.set(
          withRepeat(
            withTiming(-7, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
            -1,
            true
          )
        );
        hoverScale.set(
          withRepeat(
            withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
            -1,
            true
          )
        );
      } else {
        hoverY.set(0);
        hoverScale.set(1);
      }

      const settle = () => {
        cancelAnimation(progress);
        cancelAnimation(hoverY);
        cancelAnimation(hoverScale);
        progress.set(1);
        hoverY.set(0);
        hoverScale.set(1);
      };

      if (reduceMotion) settle();
      const listener = AppState.addEventListener('change', (state) => {
        if (state !== 'active') settle();
      });
      return () => {
        settle();
        listener.remove();
      };
    }, [featured, key, progress, hoverY, hoverScale, reduceMotion])
  );

  const cardStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + progress.get() * 0.6,
    transform: [
      { perspective: 1000 },
      { translateY: (1 - progress.get()) * 16 + hoverY.get() },
      { scale: hoverScale.get() },
      { rotateX: `${(1 - progress.get()) * 5}deg` },
    ],
  }));

  const date = new Date(ticket.evento.fechaHora);
  const formattedDate = Number.isNaN(date.getTime())
    ? 'Fecha por confirmar'
    : new Intl.DateTimeFormat('es-MX', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);

  return (
    <Animated.View style={cardStyle}>
      <Pressable
        accessibilityLabel={`Abrir boleto para ${ticket.evento.nombre}, ${ticket.tipoBoleto}, ${formattedDate}, ${ticket.evento.ubicacion || ticket.evento.municipio}`}
        accessibilityRole="button"
        onPress={() => router.push({ pathname: '/boleto/[id]', params: { id: ticket.id } })}
        style={({ pressed }) => pressed && (reduceMotion ? styles.pressedStill : styles.pressed)}>
        <HoloTicket
          ticket={ticket}
          variant={featured ? 'featured' : 'compact'}
          now={now}
          animated={featured && reduceMotion === false}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
  pressedStill: { opacity: 0.9 },
});
