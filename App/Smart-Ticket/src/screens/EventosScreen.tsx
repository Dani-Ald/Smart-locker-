import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import EventCard, { EventCardSkeleton } from '@/components/EventCard';
import { Colors, Spacing } from '@/constants/theme';
import { Evento, getEventos } from '@/services/eventService';

const BRAND = '#208AEF';
const { width: SCREEN_W } = Dimensions.get('window');

// ── Categorías disponibles ─────────────────────────────────────────────────

const CATEGORIAS = [
  { key: 'todas',          label: '🎪 Todas' },
  { key: 'feria_patronal', label: '🎡 Feria' },
  { key: 'baile',          label: '💃 Baile' },
  { key: 'palenque',       label: '🐓 Palenque' },
  { key: 'charreada',      label: '🤠 Charreada' },
  { key: 'jaripeo',        label: '🐂 Jaripeo' },
];

// ── Carrusel hero ──────────────────────────────────────────────────────────

const SLIDES = [
  { emoji: '🎡', titulo: 'Ferias Patronales', sub: 'Tradición y fiesta en el Valle', color: '#208AEF' },
  { emoji: '💃', titulo: 'Bailes y Conciertos', sub: 'Los mejores artistas del momento', color: '#7c3aed' },
  { emoji: '🐓', titulo: 'Palenques', sub: 'Emoción y tradición mezquitalense', color: '#b45309' },
  { emoji: '🤠', titulo: 'Charreadas', sub: 'La esencia de la charrería mexicana', color: '#065f46' },
  { emoji: '🐂', titulo: 'Jaripeos', sub: 'Adrenalina al máximo', color: '#991b1b' },
];

function HeroCarousel({ colors }: { colors: typeof Colors.light }) {
  const [slide, setSlide] = useState(0);
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (slide + 1) % SLIDES.length;
      setSlide(next);
      flatRef.current?.scrollToIndex({ index: next, animated: true });
    }, 3500);
    return () => clearInterval(timer);
  }, [slide]);

  return (
    <View style={heroStyles.wrapper}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={[heroStyles.slide, { backgroundColor: item.color }]}>
            <Text style={heroStyles.emoji}>{item.emoji}</Text>
            <Text style={heroStyles.titulo}>{item.titulo}</Text>
            <Text style={heroStyles.sub}>{item.sub}</Text>
          </View>
        )}
      />
      {/* Indicadores */}
      <View style={heroStyles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[heroStyles.dot, i === slide && heroStyles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const heroStyles = StyleSheet.create({
  wrapper: { borderRadius: 20, overflow: 'hidden', marginBottom: Spacing.three },
  slide: {
    width: SCREEN_W - Spacing.four * 2,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  emoji: { fontSize: 48 },
  titulo: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center' },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.82)', textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 10, position: 'absolute', bottom: 0, width: '100%' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#fff', width: 18 },
});

// ── Chip de filtro ─────────────────────────────────────────────────────────

function FilterChip({
  label,
  selected,
  onPress,
  colors,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: typeof Colors.light;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  function handlePress() {
    scale.value = withSpring(0.92, {}, () => { scale.value = withSpring(1); });
    onPress();
  }

  return (
    <Animated.View style={animStyle}>
      <Pressable
        style={[
          chipStyles.chip,
          selected
            ? { backgroundColor: BRAND }
            : { backgroundColor: colors.backgroundElement },
        ]}
        onPress={handlePress}>
        <Text style={[chipStyles.label, { color: selected ? '#fff' : colors.textSecondary }]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  label: { fontSize: 13, fontWeight: '600' },
});

// ── Pantalla principal ─────────────────────────────────────────────────────

export default function EventosScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');

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

  useEffect(() => { cargarEventos(); }, [cargarEventos]);

  // Filtrado en tiempo real
  const eventosFiltrados = useMemo(() => {
    let lista = eventos;
    if (categoriaSeleccionada !== 'todas') {
      lista = lista.filter(e => e.categoria === categoriaSeleccionada);
    }
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter(
        e =>
          e.nombre.toLowerCase().includes(q) ||
          e.municipio.toLowerCase().includes(q) ||
          e.ubicacion.toLowerCase().includes(q),
      );
    }
    return lista;
  }, [eventos, categoriaSeleccionada, busqueda]);

  const bg = colors.background;
  const cardBg = colors.backgroundElement;
  const textColor = colors.text;
  const textSecondary = colors.textSecondary;

  // ── Render item del grid ──────────────────────────────────────────────────

  const renderItem = useCallback(({ item, index }: { item: Evento; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()} style={styles.gridItem}>
      <EventCard evento={item} />
    </Animated.View>
  ), []);

  // ── Header del FlatList (carrusel + buscador + filtros) ───────────────────

  const ListHeader = (
    <View>
      {/* Carrusel hero */}
      <HeroCarousel colors={colors} />

      {/* Buscador */}
      <View style={[styles.searchRow, { backgroundColor: cardBg }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Buscar eventos, municipio…"
          placeholderTextColor={textSecondary}
          value={busqueda}
          onChangeText={setBusqueda}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {busqueda.length > 0 && Platform.OS !== 'ios' && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Text style={{ color: textSecondary, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Chips de categoría */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}>
        {CATEGORIAS.map(cat => (
          <FilterChip
            key={cat.key}
            label={cat.label}
            selected={categoriaSeleccionada === cat.key}
            onPress={() => setCategoriaSeleccionada(cat.key)}
            colors={colors}
          />
        ))}
      </ScrollView>

      {/* Contador de resultados */}
      <Animated.View entering={FadeInUp.springify()}>
        <Text style={[styles.contador, { color: textSecondary }]}>
          {cargando
            ? 'Cargando…'
            : `${eventosFiltrados.length} evento${eventosFiltrados.length !== 1 ? 's' : ''} encontrado${eventosFiltrados.length !== 1 ? 's' : ''}`}
        </Text>
      </Animated.View>
    </View>
  );

  // ── Skeletons ─────────────────────────────────────────────────────────────

  if (cargando) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <HeroCarousel colors={colors} />
          <View style={[styles.searchRow, { backgroundColor: cardBg }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <View style={[styles.skeletonSearch, { backgroundColor: colors.backgroundSelected }]} />
          </View>
          <View style={styles.grid}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={styles.gridItem}>
                <EventCardSkeleton />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>📡</Text>
          <Text style={[styles.errorTitulo, { color: textColor }]}>Sin conexión</Text>
          <Text style={[styles.errorSub, { color: textSecondary }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: BRAND }]}
            onPress={() => cargarEventos()}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Lista principal ───────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <FlatList
        data={eventosFiltrados}
        keyExtractor={item => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => cargarEventos(true)}
            tintColor={BRAND}
            colors={[BRAND]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔎</Text>
            <Text style={[styles.emptyTitulo, { color: textColor }]}>Sin resultados</Text>
            <Text style={[styles.emptySub, { color: textSecondary }]}>
              Prueba con otra búsqueda o categoría
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.four, paddingBottom: 100, gap: Spacing.three },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  row: { gap: Spacing.two },
  gridItem: { flex: 1 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.OS === 'ios' ? 12 : 4,
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15 },
  skeletonSearch: { flex: 1, height: 18, borderRadius: 8 },
  chipsRow: { flexDirection: 'row', gap: Spacing.two, paddingBottom: Spacing.two },
  contador: { fontSize: 13, fontWeight: '600', marginBottom: Spacing.two },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, padding: Spacing.four },
  errorEmoji: { fontSize: 52 },
  errorTitulo: { fontSize: 20, fontWeight: '700' },
  errorSub: { fontSize: 14, textAlign: 'center' },
  retryBtn: { marginTop: Spacing.two, paddingHorizontal: Spacing.four, paddingVertical: 12, borderRadius: 14 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emptyContainer: { alignItems: 'center', paddingVertical: Spacing.five, gap: Spacing.two },
  emptyEmoji: { fontSize: 48 },
  emptyTitulo: { fontSize: 18, fontWeight: '700' },
  emptySub: { fontSize: 14, textAlign: 'center' },
});
