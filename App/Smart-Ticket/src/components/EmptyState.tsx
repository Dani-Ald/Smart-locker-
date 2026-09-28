/**
 * EmptyState.tsx — Componente reutilizable de estado vacío (Fase 7.3).
 *
 * Uso:
 *   <EmptyState
 *     emoji="🔎"
 *     title="Sin resultados"
 *     subtitle="Prueba con otra búsqueda o categoría"
 *   />
 *
 *   // Con botón de acción
 *   <EmptyState
 *     emoji="🎪"
 *     title="Sin eventos"
 *     subtitle="Aún no hay eventos publicados."
 *     actionLabel="Crear evento"
 *     onAction={() => router.push('/create-event')}
 *   />
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

interface EmptyStateProps {
  /** Emoji grande como ícono visual */
  emoji: string;
  /** Título principal */
  title: string;
  /** Descripción secundaria (opcional) */
  subtitle?: string;
  /** Etiqueta del botón de acción (opcional) */
  actionLabel?: string;
  /** Callback del botón de acción (opcional) */
  onAction?: () => void;
  /** Delay de la animación de entrada en ms (default: 0) */
  delay?: number;
}

export default function EmptyState({
  emoji,
  title,
  subtitle,
  actionLabel,
  onAction,
  delay = 0,
}: EmptyStateProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={styles.container}
    >
      <Text style={styles.emoji}>{emoji}</Text>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      {!!subtitle && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}

      {!!actionLabel && !!onAction && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: Brand.blue }]}
          onPress={onAction}
          activeOpacity={0.85}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  emoji: {
    fontSize: 52,
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionBtn: {
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: 12,
    borderRadius: Radius.lg,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
