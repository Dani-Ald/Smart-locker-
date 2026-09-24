import React from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { Evento } from '@/services/eventService';

const BRAND = '#208AEF';

// ── Categoría → color ──────────────────────────────────────────────────────

const CATEGORIA_COLORS: Record<string, { bg: string; text: string }> = {
  feria_patronal: { bg: '#fef3c7', text: '#92400e' },
  baile:          { bg: '#ede9fe', text: '#5b21b6' },
  palenque:       { bg: '#fee2e2', text: '#991b1b' },
  charreada:      { bg: '#d1fae5', text: '#065f46' },
  jaripeo:        { bg: '#ffedd5', text: '#9a3412' },
  default:        { bg: '#e0e7ff', text: '#3730a3' },
};

function getCategoriaColor(cat: string) {
  return CATEGORIA_COLORS[cat] ?? CATEGORIA_COLORS.default;
}

function formatCategoria(cat: string) {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatPrecio(precio: number): string {
  if (precio === 0) return 'Gratis';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(precio);
}

// ── Skeleton Loader ────────────────────────────────────────────────────────

export function EventCardSkeleton() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const shimmer = scheme === 'dark' ? '#2a2a2a' : '#e5e7eb';
  const shimmerDark = scheme === 'dark' ? '#333' : '#d1d5db';

  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
      <View style={[styles.skeletonBadge, { backgroundColor: shimmer }]} />
      <View style={[styles.skeletonTitle, { backgroundColor: shimmerDark }]} />
      <View style={[styles.skeletonLine, { backgroundColor: shimmer }]} />
      <View style={[styles.skeletonLine, { backgroundColor: shimmer, width: '60%' }]} />
      <View style={styles.skeletonFooter}>
        <View style={[styles.skeletonPrice, { backgroundColor: shimmerDark }]} />
      </View>
    </View>
  );
}

// ── EventCard ──────────────────────────────────────────────────────────────

interface EventCardProps {
  evento: Evento;
}

export default function EventCard({ evento }: EventCardProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const catColor = getCategoriaColor(evento.categoria);
  const agotado = evento.aforoTotal > 0 && evento.aforoVendido >= evento.aforoTotal;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.backgroundElement }]}
      activeOpacity={0.75}
      onPress={() => router.push(`/evento/${evento._id}` as any)}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalles de ${evento.nombre}`}>

      {/* Badge categoría */}
      <View style={[styles.badge, { backgroundColor: catColor.bg }]}>
        <Text style={[styles.badgeText, { color: catColor.text }]}>
          {formatCategoria(evento.categoria)}
        </Text>
      </View>

      {/* Título */}
      <Text style={[styles.titulo, { color: colors.text }]} numberOfLines={2}>
        {evento.nombre}
      </Text>

      {/* Municipio + ubicación */}
      <Text style={[styles.subtitulo, { color: colors.textSecondary }]} numberOfLines={1}>
        📍 {evento.municipio} · {evento.ubicacion}
      </Text>

      {/* Fecha */}
      <Text style={[styles.fecha, { color: colors.textSecondary }]}>
        🗓 {formatFecha(evento.fechaHora)}
      </Text>

      {/* Footer: precio + aforo */}
      <View style={[styles.footer, { borderTopColor: colors.backgroundSelected }]}>
        <Text style={[styles.precio, { color: agotado ? '#ef4444' : '#059669' }]}>
          {agotado ? 'Agotado' : `Desde ${formatPrecio(evento.precioDesde)}`}
        </Text>

        {/* Barra de aforo */}
        {evento.aforoTotal > 0 && (
          <View style={styles.aforoBar}>
            <View
              style={[
                styles.aforoFill,
                {
                  width: `${Math.min((evento.aforoVendido / evento.aforoTotal) * 100, 100)}%` as any,
                  backgroundColor: agotado ? '#ef4444' : BRAND,
                },
              ]}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.one,
    flex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
      },
      android: { elevation: 2 },
    }),
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  titulo: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 2,
  },
  subtitulo: {
    fontSize: 12,
    lineHeight: 16,
  },
  fecha: {
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    gap: Spacing.one,
  },
  precio: {
    fontSize: 13,
    fontWeight: '700',
  },
  aforoBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  aforoFill: {
    height: '100%',
    borderRadius: 2,
  },
  // Skeleton
  skeletonBadge: {
    height: 18,
    width: 70,
    borderRadius: 6,
  },
  skeletonTitle: {
    height: 16,
    borderRadius: 6,
    marginTop: 4,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    width: '80%',
  },
  skeletonFooter: {
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  skeletonPrice: {
    height: 14,
    width: 80,
    borderRadius: 6,
  },
});
