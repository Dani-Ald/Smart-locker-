import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
} from 'react-native-reanimated';

import EventCard, { EventCardSkeleton } from '@/components/EventCard';
import { useSessionContext } from '@/context/SessionContext';
import { Colors, Spacing } from '@/constants/theme';
import { Evento, getEventos } from '@/services/eventService';

const BRAND = '#208AEF';
const BRAND_LIGHT = '#e0f0ff';

// ── Helpers ────────────────────────────────────────────────────────────────

function inicialDe(nombre: string): string {
  return nombre.trim().charAt(0).toUpperCase();
}

function colorDeAvatar(nombre: string): string {
  const colores = ['#208AEF', '#7c3aed', '#059669', '#b45309', '#991b1b', '#0e7490'];
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) hash += nombre.charCodeAt(i);
  return colores[hash % colores.length];
}

function eventosProximos30(eventos: Evento[]): number {
  const ahora = Date.now();
  const limite = ahora + 30 * 24 * 60 * 60 * 1000;
  return eventos.filter(e => {
    const t = new Date(e.fechaHora).getTime();
    return t >= ahora && t <= limite;
  }).length;
}

function categoriaUnicas(eventos: Evento[]): number {
  return new Set(eventos.map(e => e.categoria)).size;
}

// ── StatCard ───────────────────────────────────────────────────────────────

function StatCard({
  valor,
  label,
  emoji,
  delay,
  colors,
}: {
  valor: number | string;
  label: string;
  emoji: string;
  delay: number;
  colors: typeof Colors.light;
}) {
  return (
    <Animated.View
      entering={FadeInRight.delay(delay).springify()}
      style={[statStyles.card, { backgroundColor: colors.backgroundElement }]}>
      <Text style={statStyles.emoji}>{emoji}</Text>
      <Text style={[statStyles.valor, { color: BRAND }]}>{valor}</Text>
      <Text style={[statStyles.label, { color: colors.textSecondary }]}>{label}</Text>
    </Animated.View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.three,
    alignItems: 'center',
    gap: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  emoji: { fontSize: 28 },
  valor: { fontSize: 26, fontWeight: '800' },
  label: { fontSize: 11, fontWeight: '600', textAlign: 'center', letterSpacing: 0.2 },
});

// ── DashboardScreen ────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { session, clearSession, isLoading: sessionLoading } = useSessionContext();

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  const cargarEventos = useCallback(async (esRefresh = false) => {
    setError(null);
    if (esRefresh) setRefrescando(true);
    else setCargando(true);

    try {
      const data = await getEventos();
      setEventos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar eventos.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    // Si no hay sesión y ya terminó de cargar → redirigir a login
    if (!sessionLoading && !session) {
      router.replace('/(auth)/login');
      return;
    }
    cargarEventos();
  }, [sessionLoading, session, cargarEventos]);

  async function handleLogout() {
    setCerrandoSesion(true);
    await clearSession();
    router.replace('/(auth)/login');
  }

  // Stats calculadas en cliente
  const stats = useMemo(() => ({
    total: eventos.length,
    proximos30: eventosProximos30(eventos),
    categorias: categoriaUnicas(eventos),
  }), [eventos]);

  const bg = colors.background;
  const textColor = colors.text;
  const textSecondary = colors.textSecondary;
  const nombre = session?.nombre ?? '';
  const correo = session?.correo ?? '';
  const avatarColor = colorDeAvatar(nombre);

  // ── Header del FlatList ──────────────────────────────────────────────────

  const ListHeader = (
    <View style={{ gap: Spacing.three }}>

      {/* Navbar con avatar + logout */}
      <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.navbar}>
        {/* Avatar circular */}
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{inicialDe(nombre)}</Text>
        </View>

        {/* Info del usuario */}
        <View style={styles.navInfo}>
          <Text style={[styles.navNombre, { color: textColor }]} numberOfLines={1}>
            {nombre}
          </Text>
          <Text style={[styles.navCorreo, { color: textSecondary }]} numberOfLines={1}>
            {correo}
          </Text>
        </View>

        {/* Botón logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.backgroundElement }]}
          onPress={handleLogout}
          disabled={cerrandoSesion}
          activeOpacity={0.75}
          accessibilityLabel="Cerrar sesión">
          {cerrandoSesion ? (
            <ActivityIndicator size="small" color={textSecondary} />
          ) : (
            <Text style={[styles.logoutText, { color: textSecondary }]}>Salir</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Hero de bienvenida */}
      <Animated.View
        entering={FadeInDown.delay(80).springify()}
        style={[styles.heroCard, { backgroundColor: BRAND }]}>
        <Text style={styles.heroGreet}>¡Hola, {nombre.split(' ')[0]}! 👋</Text>
        <Text style={styles.heroSub}>Aquí tienes un resumen de lo que hay en Smart Ticket</Text>
      </Animated.View>

      {/* Stats bar */}
      {cargando ? (
        <View style={styles.statsRow}>
          {[...Array(3)].map((_, i) => (
            <View
              key={i}
              style={[styles.statSkeleton, { backgroundColor: colors.backgroundElement }]}
            />
          ))}
        </View>
      ) : (
        <View style={styles.statsRow}>
          <StatCard valor={stats.total}      label="Eventos" emoji="🎪" delay={100} colors={colors} />
          <StatCard valor={stats.proximos30} label="Próx. 30 días" emoji="📅" delay={160} colors={colors} />
          <StatCard valor={stats.categorias} label="Categorías" emoji="🗂️" delay={220} colors={colors} />
        </View>
      )}

      {/* Título de sección */}
      <Animated.View entering={FadeInUp.delay(250).springify()}>
        <Text style={[styles.sectionTitle, { color: textSecondary }]}>CATÁLOGO DE EVENTOS</Text>
      </Animated.View>
    </View>
  );

  // ── Render ───────────────────────────────────────────────────────────────

  if (sessionLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {ListHeader}
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>📡</Text>
            <Text style={[styles.errorTitulo, { color: textColor }]}>Sin conexión</Text>
            <Text style={[styles.errorSub, { color: textSecondary }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: BRAND }]}
              onPress={() => cargarEventos()}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <FlatList
        data={cargando ? (Array(4).fill(null) as null[]) : eventos}
        keyExtractor={(item, index) => (item ? item._id : `skel-${index}`)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => cargarEventos(true)}
            tintColor={BRAND}
            colors={[BRAND]}
          />
        }
        renderItem={({ item, index }) =>
          item === null ? (
            <View style={styles.gridItem}>
              <EventCardSkeleton />
            </View>
          ) : (
            <Animated.View
              entering={FadeInDown.delay(index * 50).springify()}
              style={styles.gridItem}>
              <EventCard evento={item} />
            </Animated.View>
          )
        }
        ListEmptyComponent={
          !cargando ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🎪</Text>
              <Text style={[styles.emptyTitulo, { color: textColor }]}>Sin eventos por ahora</Text>
              <Text style={[styles.emptySub, { color: textSecondary }]}>
                Vuelve pronto para ver nuevos eventos
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.four, paddingBottom: 100, gap: Spacing.three },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Navbar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  navInfo: { flex: 1 },
  navNombre: { fontSize: 15, fontWeight: '700' },
  navCorreo: { fontSize: 12 },
  logoutBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 54,
    alignItems: 'center',
  },
  logoutText: { fontSize: 13, fontWeight: '600' },

  // Hero
  heroCard: {
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  heroGreet: { color: '#fff', fontSize: 22, fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.80)', fontSize: 13, lineHeight: 18 },

  // Stats
  statsRow: { flexDirection: 'row', gap: Spacing.two },
  statSkeleton: {
    flex: 1,
    height: 90,
    borderRadius: 16,
  },

  // Sección
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Grid
  row: { gap: Spacing.two },
  gridItem: { flex: 1 },

  // Error
  errorContainer: { alignItems: 'center', paddingVertical: Spacing.five, gap: Spacing.two },
  errorEmoji: { fontSize: 52 },
  errorTitulo: { fontSize: 20, fontWeight: '700' },
  errorSub: { fontSize: 14, textAlign: 'center' },
  retryBtn: { marginTop: Spacing.two, paddingHorizontal: Spacing.four, paddingVertical: 12, borderRadius: 14 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Empty
  emptyContainer: { alignItems: 'center', paddingVertical: Spacing.five, gap: Spacing.two },
  emptyEmoji: { fontSize: 48 },
  emptyTitulo: { fontSize: 18, fontWeight: '700' },
  emptySub: { fontSize: 14, textAlign: 'center' },
});
