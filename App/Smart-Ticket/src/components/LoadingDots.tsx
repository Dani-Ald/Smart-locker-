/**
 * LoadingDots.tsx — Animación de puntos pulsantes (Fase 7.4).
 *
 * Usa react-native-reanimated para animar tres puntos en secuencia,
 * creando un efecto de "cargando" premium sin depender de ActivityIndicator.
 *
 * Uso:
 *   // Tamaño mediano (default)
 *   <LoadingDots />
 *
 *   // Grande, en color verde
 *   <LoadingDots size={14} color="#059669" />
 *
 *   // Centrado verticalmente en pantalla completa
 *   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
 *     <LoadingDots />
 *   </View>
 */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Brand } from '@/constants/theme';

interface LoadingDotsProps {
  /** Color de los puntos (default: azul de marca) */
  color?: string;
  /** Tamaño de cada punto en px (default: 10) */
  size?: number;
  /** Gap entre puntos en px (default: 6) */
  gap?: number;
}

const DURATION = 420; // ms por ciclo de subida
const TRAVEL   = 8;   // px de desplazamiento vertical

function Dot({
  color,
  size,
  delayMs,
}: {
  color: string;
  size: number;
  delayMs: number;
}) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(-TRAVEL, { duration: DURATION, easing: Easing.out(Easing.quad) }),
          withTiming(0,       { duration: DURATION, easing: Easing.in(Easing.quad) }),
        ),
        -1, // infinito
        false,
      ),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width:        size,
          height:       size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
}

export default function LoadingDots({
  color = Brand.blue,
  size  = 10,
  gap   = 6,
}: LoadingDotsProps) {
  return (
    <View style={[styles.row, { gap }]}>
      <Dot color={color} size={size} delayMs={0} />
      <Dot color={color} size={size} delayMs={140} />
      <Dot color={color} size={size} delayMs={280} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    justifyContent:'center',
  },
});
