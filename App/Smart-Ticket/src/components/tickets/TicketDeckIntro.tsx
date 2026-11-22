import { useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSequence, withTiming, type SharedValue } from 'react-native-reanimated';

import { HoloTicket } from '@/components/tickets/HoloTicket';
import { WalletLayout } from '@/constants/theme';
import { useWalletTheme } from '@/hooks/use-wallet-theme';
import type { WalletTicket } from '@/types/ticket';

// Una presentación por cuenta y apertura de la app, también con boletos de caché.
const presented = new Set<string>();

export function TicketDeckIntro({ tickets, width, now }: { tickets: WalletTicket[]; width: number; now: number }) {
  const owner = tickets[0]?.ownerId ?? '';
  const colors = useWalletTheme();
  const reduceMotion = useReducedMotion();
  const [finished, setFinished] = useState(() => presented.has(owner));
  const spread = useSharedValue(0);
  const enabled = !finished && !reduceMotion && tickets.length > 1;

  useEffect(() => {
    if (!enabled) return;
    const finish = () => {
      presented.add(owner);
      setFinished(true);
    };
    spread.set(0);
    spread.set(withSequence(
      withTiming(1, { duration: WalletLayout.deckOpen }),
      withDelay(WalletLayout.deckHold, withTiming(0, { duration: WalletLayout.deckClose })),
    ));
    const timer = setTimeout(finish, WalletLayout.deckOpen + WalletLayout.deckHold + WalletLayout.deckClose);
    const listener = AppState.addEventListener('change', (state) => {
      if (state !== 'active') finish();
    });
    return () => {
      clearTimeout(timer);
      listener.remove();
      cancelAnimation(spread);
    };
  }, [enabled, owner, spread]);

  if (!enabled) return null;

  return (
    <View
      onTouchStart={() => { presented.add(owner); setFinished(true); }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.deck, { backgroundColor: colors.background }]}>
      {tickets.map((ticket, index) => (
        <DeckCard key={ticket.id} ticket={ticket} index={index} count={tickets.length} width={width} now={now} spread={spread} />
      ))}
    </View>
  );
}

function DeckCard({ ticket, index, count, width, now, spread }: {
  ticket: WalletTicket; index: number; count: number; width: number; now: number; spread: SharedValue<number>;
}) {
  const position = index / Math.max(1, count - 1) * 2 - 1;
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: index === 0 ? 1 : spread.get(),
    transform: [
      { translateX: position * WalletLayout.deckSpread * spread.get() },
      { translateY: Math.abs(position) * 16 * spread.get() },
      { scale: 1 - (1 - WalletLayout.deckScale) * spread.get() },
      { rotateZ: `${position * WalletLayout.deckAngle * spread.get()}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.card, { zIndex: count - index }, animatedStyle]}>
      <HoloTicket ticket={ticket} variant="featured" cardWidth={width} now={now} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  deck: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', zIndex: 3 },
  card: { position: 'absolute' },
});
