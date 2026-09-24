import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from 'react-native-reanimated';

import { Colors, Spacing } from '@/constants/theme';
import { Evento, getEventoById } from '@/services/eventService';

const BRAND = '#208AEF';
const { width: SCREEN_W } = Dimensions.get('window');

// ── Helpers ────────────────────────────────────────────────────────────────

const CATEGORIA_META: Record<string, { emoji: string; color: string; label: string }> = {
  feria_patronal: { emoji: '🎡', color: '#b45309', label: 'Feria Patronal' },
  baile:          { emoji: '💃', color: '#7c3aed', label: 'Baile' },
  palenque:       { emoji: '🐓', color: '#991b1b', label: 'Palenque' },
  charreada:      { emoji: '🤠', color: '#065f46', label: 'Charreada' },
  jaripeo:        { emoji: '🐂', color: '#9a3412', label: 'Jaripeo' },
};

function getCatMeta(cat: string) {
  return CATEGORIA_META[cat] ?? { emoji: '🎪', color: BRAND, label: cat };
}

function formatFechaCompleta(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch { return iso; }
}

function formatHora(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function formatPrecio(precio: number): string {
  if (precio === 0) return 'Gratis';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN', minimumFractionDigits: 0,
  }).format(precio);
}

// ── InfoRow ────────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.icon}>{icon}</Text>
      <View style={infoStyles.texts}>
        <Text style={[infoStyles.label, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[infoStyles.value, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  icon: { fontSize: 20, marginTop: 1 },
  texts: { flex: 1, gap: 2 },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
  value: { fontSize: 15, fontWeight: '500', lineHeight: 20 },
});

// ── EventDetailScreen ──────────────────────────────────────────────────────

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [evento, setEvento] = useState<Evento | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setError('ID de evento no válido.'); setCargando(false); return; }
    getEventoById(id)
      .then(setEvento)
      .catch(err => setError(err instanceof Error ? err.message : 'Error desconocido.'))
      .finally(() => setCargando(false));
  }, [id]);

  const bg = colors.background;
  const textColor = colors.text;
  const textSecondary = colors.textSecondary;
  const cardBg = colors.backgroundElement;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (cargando) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: BRAND }]}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BRAND} />
          <Text style={[styles.loadingText, { color: textSecondary }]}>Cargando evento…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !evento) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: BRAND }]}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={[styles.errorTitulo, { color: textColor }]}>Algo salió mal</Text>
          <Text style={[styles.errorSub, { color: textSecondary }]}>
            {error ?? 'No se pudo cargar el evento.'}
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: BRAND }]}
            onPress={() => router.back()}>
            <Text style={styles.retryText}>Regresar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Datos del evento ─────────────────────────────────────────────────────
  const cat = getCatMeta(evento.categoria);
  const agotado = evento.aforoTotal > 0 && evento.aforoVendido >= evento.aforoTotal;
  const porcentajeAforo = evento.aforoTotal > 0
    ? Math.min((evento.aforoVendido / evento.aforoTotal) * 100, 100)
    : 0;
  const disponibles = Math.max(evento.aforoTotal - evento.aforoVendido, 0);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={true}>

        {/* Hero banner */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[styles.hero, { backgroundColor: cat.color }]}>

          {/* Botón volver superpuesto */}
          <TouchableOpacity
            style={styles.heroBack}
            onPress={() => router.back()}
            accessibilityLabel="Volver">
            <View style={styles.heroBackBubble}>
              <Text style={styles.heroBackIcon}>←</Text>
            </View>
          </TouchableOpacity>

          {/* Contenido del hero */}
          <Text style={styles.heroEmoji}>{cat.emoji}</Text>
          <Animated.Text entering={FadeInUp.delay(150)} style={styles.heroCat}>
            {cat.label.toUpperCase()}
          </Animated.Text>
        </Animated.View>

        {/* Cuerpo */}
        <View style={[styles.body, { backgroundColor: bg }]}>

          {/* Nombre del evento */}
          <Animated.Text
            entering={FadeInDown.delay(100).springify()}
            style={[styles.nombre, { color: textColor }]}>
            {evento.nombre}
          </Animated.Text>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.backgroundSelected }]} />

          {/* Info rows */}
          <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.infoSection}>
            <InfoRow icon="📅" label="Fecha" value={formatFechaCompleta(evento.fechaHora)} colors={colors} />
            <InfoRow icon="🕐" label="Hora" value={formatHora(evento.fechaHora)} colors={colors} />
            <InfoRow icon="📍" label="Municipio" value={evento.municipio} colors={colors} />
            <InfoRow icon="🏟️" label="Lugar" value={evento.ubicacion} colors={colors} />
          </Animated.View>

          <View style={[styles.divider, { backgroundColor: colors.backgroundSelected }]} />

          {/* Descripción */}
          <Animated.View entering={FadeInDown.delay(220).springify()} style={styles.descSection}>
            <Text style={[styles.sectionTitle, { color: textSecondary }]}>DESCRIPCIÓN</Text>
            <Text style={[styles.descripcion, { color: textColor }]}>{evento.descripcion}</Text>
          </Animated.View>

          <View style={[styles.divider, { backgroundColor: colors.backgroundSelected }]} />

          {/* Aforo */}
          <Animated.View
            entering={FadeInDown.delay(280).springify()}
            style={[styles.aforoCard, { backgroundColor: cardBg }]}>
            <View style={styles.aforoHeader}>
              <Text style={[styles.sectionTitle, { color: textSecondary }]}>DISPONIBILIDAD</Text>
              <Text style={[styles.aforoNums, { color: agotado ? '#ef4444' : '#059669' }]}>
                {agotado ? 'AGOTADO' : `${disponibles} de ${evento.aforoTotal}`}
              </Text>
            </View>
            <View style={styles.aforoBarBg}>
              <Animated.View
                entering={SlideInRight.delay(350).duration(600)}
                style={[
                  styles.aforoBarFill,
                  {
                    width: `${porcentajeAforo}%`,
                    backgroundColor: agotado ? '#ef4444' : BRAND,
                  },
                ]}
              />
            </View>
            {!agotado && (
              <Text style={[styles.aforoSub, { color: textSecondary }]}>
                {disponibles} lugar{disponibles !== 1 ? 'es' : ''} disponible{disponibles !== 1 ? 's' : ''}
              </Text>
            )}
          </Animated.View>

        </View>
      </ScrollView>

      {/* Footer sticky: precio + CTA */}
      <Animated.View
        entering={FadeInUp.delay(300).springify()}
        style={[styles.footer, { backgroundColor: bg, borderTopColor: colors.backgroundSelected }]}>
        <View style={styles.footerLeft}>
          <Text style={[styles.footerDesde, { color: textSecondary }]}>Precio desde</Text>
          <Text style={[styles.footerPrecio, { color: agotado ? '#ef4444' : textColor }]}>
            {formatPrecio(evento.precioDesde)}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.ctaBtn,
            { backgroundColor: agotado ? colors.backgroundElement : BRAND },
          ]}
          disabled={agotado}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={agotado ? 'Evento agotado' : 'Comprar boleto'}>
          <Text style={[styles.ctaText, { color: agotado ? textSecondary : '#fff' }]}>
            {agotado ? 'Agotado' : '🎟️  Comprar boleto'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, padding: Spacing.four },

  // Back button (pantalla de error/loading)
  backBtn: { padding: Spacing.four, paddingBottom: 0 },
  backText: { fontSize: 16, fontWeight: '600' },
  loadingText: { fontSize: 14 },

  // Hero
  hero: {
    width: SCREEN_W,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    position: 'relative',
  },
  heroBack: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
  },
  heroBackBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBackIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
  heroEmoji: { fontSize: 72 },
  heroCat: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },

  // Body
  body: { padding: Spacing.four, gap: Spacing.three },
  nombre: { fontSize: 26, fontWeight: '800', lineHeight: 32 },
  divider: { height: 1, marginVertical: 2 },
  infoSection: { gap: Spacing.three },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: Spacing.two },
  descSection: {},
  descripcion: { fontSize: 15, lineHeight: 24 },

  // Aforo
  aforoCard: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  aforoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aforoNums: { fontSize: 14, fontWeight: '700' },
  aforoBarBg: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  aforoBarFill: { height: '100%', borderRadius: 4 },
  aforoSub: { fontSize: 12 },

  // Footer sticky
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    paddingBottom: Platform.OS === 'ios' ? 28 : Spacing.three,
    borderTopWidth: 1,
    gap: Spacing.three,
  },
  footerLeft: { flex: 1 },
  footerDesde: { fontSize: 11, fontWeight: '600' },
  footerPrecio: { fontSize: 22, fontWeight: '800' },
  ctaBtn: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontSize: 16, fontWeight: '700' },

  // Error
  errorEmoji: { fontSize: 52 },
  errorTitulo: { fontSize: 20, fontWeight: '700' },
  errorSub: { fontSize: 14, textAlign: 'center' },
  retryBtn: { marginTop: Spacing.two, paddingHorizontal: Spacing.four, paddingVertical: 12, borderRadius: 14 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
