import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useSessionContext } from '@/context/SessionContext';
import { createEvento } from '@/services/eventService';
import { Colors, Spacing } from '@/constants/theme';

const BRAND = '#208AEF';
const BRAND_DARK = '#1A6EC4';

// ── Categorías ─────────────────────────────────────────────────────────────

const CATEGORIAS = [
  { key: 'feria_patronal', label: '🎡 Feria Patronal' },
  { key: 'baile',          label: '💃 Baile' },
  { key: 'palenque',       label: '🐓 Palenque' },
  { key: 'charreada',      label: '🤠 Charreada' },
  { key: 'jaripeo',        label: '🐂 Jaripeo' },
];

// ── Municipios del Valle del Mezquital (top) ───────────────────────────────

const MUNICIPIOS = [
  'Ixmiquilpan', 'Tula de Allende', 'Actopan', 'Mixquiahuala',
  'Chilcuautla', 'Tasquillo', 'Cardonal', 'Zimapán',
  'Alfajayucan', 'Tecozautla', 'El Arenal', 'Tepetitlán',
];

// ── Helpers ────────────────────────────────────────────────────────────────

/** Convierte "DD/MM/YYYY HH:MM" → ISO 8601 o lanza error */
function parseDateTime(fecha: string, hora: string): string {
  const [d, m, y] = fecha.split('/').map(Number);
  const [hh, mm] = hora.split(':').map(Number);
  if (
    !d || !m || !y || isNaN(hh) || isNaN(mm) ||
    m < 1 || m > 12 || d < 1 || d > 31 ||
    hh < 0 || hh > 23 || mm < 0 || mm > 59
  ) throw new Error('Formato de fecha u hora inválido.');
  return new Date(y, m - 1, d, hh, mm).toISOString();
}

// ── Sub-componentes ────────────────────────────────────────────────────────

function FormLabel({ children, colors }: { children: string; colors: typeof Colors.light }) {
  return (
    <Text style={[formStyles.label, { color: colors.textSecondary }]}>{children}</Text>
  );
}

function FormInput({
  colors,
  ...props
}: React.ComponentProps<typeof TextInput> & { colors: typeof Colors.light }) {
  return (
    <TextInput
      style={[formStyles.input, {
        backgroundColor: colors.background,
        color: colors.text,
        borderColor: colors.backgroundSelected,
      }]}
      placeholderTextColor={colors.textSecondary}
      {...props}
    />
  );
}

const formStyles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
  },
});

// ── CreateEventScreen ──────────────────────────────────────────────────────

export default function CreateEventScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { session } = useSessionContext();

  // ── Campos del formulario ────────────────────────────────────────────────
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [municipioCustom, setMunicipioCustom] = useState('');
  const [fecha, setFecha] = useState('');           // DD/MM/YYYY
  const [hora, setHora] = useState('');             // HH:MM
  const [ubicacion, setUbicacion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [aforo, setAforo] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');

  // ── Estado UI ────────────────────────────────────────────────────────────
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [mostrarMunicipios, setMostrarMunicipios] = useState(false);

  const municipioFinal = municipio === '__custom__' ? municipioCustom : municipio;

  // ── Validación ───────────────────────────────────────────────────────────
  function validar(): string | null {
    if (!nombre.trim())      return 'El nombre del evento es obligatorio.';
    if (!categoria)          return 'Selecciona una categoría.';
    if (!municipioFinal.trim()) return 'El municipio es obligatorio.';
    if (!fecha.trim())       return 'La fecha es obligatoria (DD/MM/YYYY).';
    if (!hora.trim())        return 'La hora es obligatoria (HH:MM).';
    if (!ubicacion.trim())   return 'El lugar del evento es obligatorio.';
    if (!descripcion.trim()) return 'La descripción es obligatoria.';
    if (!aforo.trim() || isNaN(Number(aforo)) || Number(aforo) < 1)
      return 'El aforo debe ser un número mayor a 0.';
    if (precio.trim() && (isNaN(Number(precio)) || Number(precio) < 0))
      return 'El precio debe ser un número mayor o igual a 0.';
    try { parseDateTime(fecha, hora); } catch { return 'Formato de fecha/hora inválido.'; }
    return null;
  }

  // ── Enviar ───────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setError(null);
    const mensajeError = validar();
    if (mensajeError) { setError(mensajeError); return; }

    setCargando(true);
    try {
      await createEvento({
        nombre:       nombre.trim(),
        categoria,
        municipio:    municipioFinal.trim(),
        fechaHora:    parseDateTime(fecha, hora),
        ubicacion:    ubicacion.trim(),
        descripcion:  descripcion.trim(),
        precioDesde:  Number(precio) || 0,
        aforoTotal:   Number(aforo),
        imagenUrl:    imagenUrl.trim() || undefined,
        organizadorId: session?.id,
      });

      setExito(true);
      setTimeout(() => router.replace('/eventos'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el evento.');
    } finally {
      setCargando(false);
    }
  }

  const bg = colors.background;
  const cardBg = colors.backgroundElement;
  const textColor = colors.text;
  const textSecondary = colors.textSecondary;

  // ── Pantalla de éxito ────────────────────────────────────────────────────
  if (exito) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
        <View style={styles.exitoContainer}>
          <Text style={styles.exitoEmoji}>🎉</Text>
          <Text style={[styles.exitoTitulo, { color: textColor }]}>¡Evento creado!</Text>
          <Text style={[styles.exitoSub, { color: textSecondary }]}>
            Tu evento fue guardado como borrador.{'\n'}Redirigiendo a Eventos…
          </Text>
          <ActivityIndicator color={BRAND} style={{ marginTop: Spacing.three }} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Formulario ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.pageHeader}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.backLink, { color: BRAND }]}>← Volver</Text>
            </TouchableOpacity>
            <Text style={[styles.pageTitle, { color: textColor }]}>Nuevo evento</Text>
            <Text style={[styles.pageSub, { color: textSecondary }]}>
              Los eventos se crean en estado borrador
            </Text>
          </Animated.View>

          {/* ── Sección: Info general ── */}
          <Animated.View entering={FadeInDown.delay(60).springify()} style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textSecondary }]}>INFO GENERAL</Text>

            <View style={styles.field}>
              <FormLabel colors={colors}>Nombre del evento *</FormLabel>
              <FormInput
                colors={colors}
                placeholder="Ej. Feria Patronal de Ixmiquilpan 2027"
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
                editable={!cargando}
              />
            </View>

            {/* Categoría — chips */}
            <View style={styles.field}>
              <FormLabel colors={colors}>Categoría *</FormLabel>
              <View style={styles.chipsGrid}>
                {CATEGORIAS.map(cat => (
                  <Pressable
                    key={cat.key}
                    style={[
                      styles.chip,
                      categoria === cat.key
                        ? { backgroundColor: BRAND }
                        : { backgroundColor: colors.background, borderColor: colors.backgroundSelected, borderWidth: 1.5 },
                    ]}
                    onPress={() => setCategoria(cat.key)}>
                    <Text style={[styles.chipText, { color: categoria === cat.key ? '#fff' : textSecondary }]}>
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Descripción */}
            <View style={styles.field}>
              <FormLabel colors={colors}>Descripción *</FormLabel>
              <TextInput
                style={[styles.textarea, {
                  backgroundColor: colors.background,
                  color: textColor,
                  borderColor: colors.backgroundSelected,
                }]}
                placeholder="Descripción del evento, artistas, actividades…"
                placeholderTextColor={textSecondary}
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!cargando}
              />
            </View>
          </Animated.View>

          {/* ── Sección: Lugar y fecha ── */}
          <Animated.View entering={FadeInDown.delay(120).springify()} style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textSecondary }]}>LUGAR Y FECHA</Text>

            {/* Municipio — selector */}
            <View style={styles.field}>
              <FormLabel colors={colors}>Municipio *</FormLabel>
              <TouchableOpacity
                style={[styles.selector, {
                  backgroundColor: colors.background,
                  borderColor: colors.backgroundSelected,
                }]}
                onPress={() => setMostrarMunicipios(!mostrarMunicipios)}>
                <Text style={[styles.selectorText, { color: municipioFinal ? textColor : textSecondary }]}>
                  {municipioFinal || 'Selecciona un municipio…'}
                </Text>
                <Text style={[styles.selectorArrow, { color: textSecondary }]}>
                  {mostrarMunicipios ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
              {mostrarMunicipios && (
                <View style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.backgroundSelected }]}>
                  {MUNICIPIOS.map(m => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.dropdownItem, { borderBottomColor: colors.backgroundElement }]}
                      onPress={() => { setMunicipio(m); setMostrarMunicipios(false); }}>
                      <Text style={[styles.dropdownText, { color: textColor }]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={[styles.dropdownItem, { borderBottomColor: 'transparent' }]}
                    onPress={() => { setMunicipio('__custom__'); setMostrarMunicipios(false); }}>
                    <Text style={[styles.dropdownText, { color: BRAND }]}>✏️ Otro municipio…</Text>
                  </TouchableOpacity>
                </View>
              )}
              {municipio === '__custom__' && (
                <FormInput
                  colors={colors}
                  placeholder="Escribe el municipio"
                  value={municipioCustom}
                  onChangeText={setMunicipioCustom}
                  autoCapitalize="words"
                  style={{ marginTop: Spacing.two, height: 48, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: Spacing.three, fontSize: 15, backgroundColor: colors.background, color: textColor, borderColor: colors.backgroundSelected }}
                  editable={!cargando}
                />
              )}
            </View>

            {/* Lugar específico */}
            <View style={styles.field}>
              <FormLabel colors={colors}>Lugar específico *</FormLabel>
              <FormInput
                colors={colors}
                placeholder="Ej. Palenque Municipal, Lienzo Charro"
                value={ubicacion}
                onChangeText={setUbicacion}
                autoCapitalize="words"
                editable={!cargando}
              />
            </View>

            {/* Fecha + Hora en fila */}
            <View style={styles.rowFields}>
              <View style={[styles.field, { flex: 1 }]}>
                <FormLabel colors={colors}>Fecha * (DD/MM/AAAA)</FormLabel>
                <FormInput
                  colors={colors}
                  placeholder="15/10/2027"
                  value={fecha}
                  onChangeText={setFecha}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                  editable={!cargando}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <FormLabel colors={colors}>Hora * (HH:MM)</FormLabel>
                <FormInput
                  colors={colors}
                  placeholder="20:00"
                  value={hora}
                  onChangeText={setHora}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  editable={!cargando}
                />
              </View>
            </View>
          </Animated.View>

          {/* ── Sección: Boletaje ── */}
          <Animated.View entering={FadeInDown.delay(180).springify()} style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textSecondary }]}>BOLETAJE</Text>

            <View style={styles.rowFields}>
              <View style={[styles.field, { flex: 1 }]}>
                <FormLabel colors={colors}>Precio desde (MXN)</FormLabel>
                <FormInput
                  colors={colors}
                  placeholder="0 = Gratis"
                  value={precio}
                  onChangeText={setPrecio}
                  keyboardType="numeric"
                  editable={!cargando}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <FormLabel colors={colors}>Aforo total *</FormLabel>
                <FormInput
                  colors={colors}
                  placeholder="500"
                  value={aforo}
                  onChangeText={setAforo}
                  keyboardType="numeric"
                  editable={!cargando}
                />
              </View>
            </View>
          </Animated.View>

          {/* ── Sección: Imagen (opcional) ── */}
          <Animated.View entering={FadeInDown.delay(240).springify()} style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textSecondary }]}>IMAGEN (OPCIONAL)</Text>
            <View style={styles.field}>
              <FormLabel colors={colors}>URL de imagen</FormLabel>
              <FormInput
                colors={colors}
                placeholder="https://ejemplo.com/imagen.jpg"
                value={imagenUrl}
                onChangeText={setImagenUrl}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!cargando}
              />
            </View>
          </Animated.View>

          {/* Error */}
          {error && (
            <Animated.View entering={FadeInDown} style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </Animated.View>
          )}

          {/* Botón publicar */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: cargando ? BRAND_DARK : BRAND }]}
              onPress={handleSubmit}
              disabled={cargando}
              activeOpacity={0.85}>
              {cargando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>🎪 Crear evento</Text>
              )}
            </TouchableOpacity>

            <Text style={[styles.footnote, { color: textSecondary }]}>
              El evento se guardará como borrador y podrás publicarlo desde el panel de organizador.
            </Text>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.four, gap: Spacing.three, paddingBottom: 60 },

  pageHeader: { gap: 4 },
  backLink: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  pageTitle: { fontSize: 28, fontWeight: '800' },
  pageSub: { fontSize: 13 },

  card: {
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 2 },
    }),
  },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  field: { gap: Spacing.one },
  rowFields: { flexDirection: 'row', gap: Spacing.two },

  // Chips de categoría
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 13, fontWeight: '600' },

  // Textarea
  textarea: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    paddingTop: 12,
    fontSize: 15,
    minHeight: 100,
  },

  // Selector municipio
  selector: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    justifyContent: 'space-between',
  },
  selectorText: { fontSize: 15, flex: 1 },
  selectorArrow: { fontSize: 12 },
  dropdown: {
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 4,
    overflow: 'hidden',
    maxHeight: 260,
  },
  dropdownItem: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  dropdownText: { fontSize: 14 },

  // Error
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: { color: '#dc2626', fontSize: 14, fontWeight: '500' },

  // Submit
  submitBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  footnote: { fontSize: 12, textAlign: 'center', marginTop: Spacing.two, lineHeight: 18 },

  // Éxito
  exitoContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: Spacing.two, padding: Spacing.four,
  },
  exitoEmoji: { fontSize: 64 },
  exitoTitulo: { fontSize: 26, fontWeight: '700' },
  exitoSub: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
