/**
 * ErrorState.tsx — Componente reutilizable de estado de error (Fase 7.3).
 *
 * Uso:
 *   <ErrorState
 *     message="No se pudo conectar a la API"
 *     onRetry={() => cargarEventos()}
 *   />
 *
 *   // Sin botón de reintentar
 *   <ErrorState message="ID de evento no válido." />
 *
 *   // Con emoji personalizado
 *   <ErrorState emoji="😕" message="Algo salió mal" onRetry={handleRetry} />
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

interface ErrorStateProps {
  /** Mensaje de error a mostrar */
  message: string;
  /** Emoji representativo (default: 📡) */
  emoji?: string;
  /** Título visible (default: 'Sin conexión') */
  title?: string;
  /** Callback para reintentar la operación (opcional) */
  onRetry?: () => void;
  /** Etiqueta del botón de reintento (default: 'Reintentar') */
  retryLabel?: string;
  /** Delay de la animación de entrada en ms (default: 0) */
  delay?: number;
}

export default function ErrorState({
  message,
  emoji = '📡',
  title = 'Sin conexión',
  onRetry,
  retryLabel = 'Reintentar',
  delay = 0,
}: ErrorStateProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={styles.container}
    >
      <Text style={styles.emoji}>{emoji}</Text>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>

      {!!onRetry && (
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: Brand.blue }]}
          onPress={onRetry}
          activeOpacity={0.85}
        >
          <Text style={styles.retryText}>{retryLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  emoji: {
    fontSize: 56,
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: 12,
    borderRadius: Radius.lg,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
