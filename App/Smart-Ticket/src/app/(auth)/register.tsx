import React, { useState, useEffect } from 'react';
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

import { register, verificarCodigo, reenviarCodigo, AuthError } from '@/services/authService';
import { Colors, Spacing } from '@/constants/theme';

const BRAND = '#208AEF';
const BRAND_DARK = '#1A6EC4';

export default function RegisterScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Paso 1: Datos de registro
  const [paso, setPaso] = useState<'registro' | 'verificacion' | 'exito'>('registro');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);

  // Paso 2: Código de verificación
  const [codigo, setCodigo] = useState('');
  const [timerReenvio, setTimerReenvio] = useState(60);
  const [puedeReenviar, setPuedeReenviar] = useState(false);

  // Estado común
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMensaje, setInfoMensaje] = useState<string | null>(null);

  // Temporizador para el reenvío de código
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (paso === 'verificacion' && timerReenvio > 0) {
      interval = setInterval(() => {
        setTimerReenvio(prev => {
          if (prev <= 1) {
            setPuedeReenviar(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [paso, timerReenvio]);

  function validarForm(): string | null {
    if (!nombre.trim() || !correo.trim() || !password || !passwordConfirm) {
      return 'Completa todos los campos.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      return 'Ingresa un correo electrónico válido.';
    }
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (password !== passwordConfirm) {
      return 'Las contraseñas no coinciden.';
    }
    return null;
  }

  // 1. Manejar el Registro inicial
  async function handleRegister() {
    setError(null);
    setInfoMensaje(null);

    const mensajeValidacion = validarForm();
    if (mensajeValidacion) {
      setError(mensajeValidacion);
      return;
    }

    setCargando(true);
    try {
      await register({
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        password,
        passwordConfirm,
      });
      // Pasar al paso de verificación
      setPaso('verificacion');
      setTimerReenvio(60);
      setPuedeReenviar(false);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error inesperado. Inténtalo de nuevo.');
      }
    } finally {
      setCargando(false);
    }
  }

  // 2. Manejar la Verificación del Código de 6 Dígitos
  async function handleVerificarCodigo() {
    setError(null);
    setInfoMensaje(null);

    if (!codigo.trim() || codigo.trim().length !== 6) {
      setError('Ingresa el código de 6 dígitos que enviamos a tu correo.');
      return;
    }

    setCargando(true);
    try {
      await verificarCodigo({
        correo: correo.trim().toLowerCase(),
        codigo: codigo.trim(),
      });
      setPaso('exito');
      setTimeout(() => router.replace('/(auth)/login' as any), 2000);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Código incorrecto. Inténtalo de nuevo.');
      }
    } finally {
      setCargando(false);
    }
  }

  // 3. Manejar Reenvío de Código
  async function handleReenviarCodigo() {
    setError(null);
    setInfoMensaje(null);
    setCargando(true);

    try {
      await reenviarCodigo({ correo: correo.trim().toLowerCase() });
      setInfoMensaje('Te hemos reenviado un nuevo código de 6 dígitos.');
      setTimerReenvio(60);
      setPuedeReenviar(false);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al reenviar el código.');
      }
    } finally {
      setCargando(false);
    }
  }

  const bg = colors.background;
  const cardBg = colors.backgroundElement;
  const textColor = colors.text;
  const textSecondary = colors.textSecondary;

  // ── Pantalla de éxito ──────────────────────────────────────────────────────
  if (paso === 'exito') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
        <View style={styles.exitoContainer}>
          <Text style={styles.exitoEmoji}>🎉</Text>
          <Text style={[styles.exitoTitulo, { color: textColor }]}>¡Cuenta verificada!</Text>
          <Text style={[styles.exitoSub, { color: textSecondary }]}>
            Tu correo {correo} ha sido confirmado. Redirigiendo al inicio de sesión…
          </Text>
          <ActivityIndicator color={BRAND} style={{ marginTop: Spacing.three }} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Paso 2: Pantalla de Verificación del Código de 6 dígitos ───────────────
  if (paso === 'verificacion') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.logoChip, { backgroundColor: BRAND }]}>
                <Text style={styles.logoText}>🛡️</Text>
              </View>
              <Text style={[styles.appName, { color: textColor }]}>Verificar cuenta</Text>
              <Text style={[styles.tagline, { color: textSecondary, textAlign: 'center' }]}>
                Enviamos un código de 6 dígitos a{'\n'}
                <Text style={{ fontWeight: '700', color: textColor }}>{correo}</Text>
              </Text>
            </View>

            {/* Card Formulario Código */}
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              {infoMensaje && (
                <View style={styles.infoBanner}>
                  <Text style={styles.infoText}>✉️ {infoMensaje}</Text>
                </View>
              )}

              {/* Campo Código PIN */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: textSecondary }]}>Código de verificación</Text>
                <TextInput
                  style={[
                    styles.codeInput,
                    {
                      backgroundColor: bg,
                      color: textColor,
                      borderColor: colors.backgroundSelected,
                    },
                  ]}
                  placeholder="123456"
                  placeholderTextColor={textSecondary}
                  value={codigo}
                  onChangeText={v => setCodigo(v.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleVerificarCodigo}
                  editable={!cargando}
                />
              </View>

              {/* Error */}
              {error && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              )}

              {/* Botón Verificar */}
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: cargando ? BRAND_DARK : BRAND }]}
                onPress={handleVerificarCodigo}
                disabled={cargando}
                activeOpacity={0.85}>
                {cargando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>🛡️ Verificar cuenta</Text>
                )}
              </TouchableOpacity>

              {/* Reenvío de código */}
              <View style={styles.reenvioRow}>
                {puedeReenviar ? (
                  <TouchableOpacity onPress={handleReenviarCodigo} disabled={cargando}>
                    <Text style={[styles.footerLink, { color: BRAND }]}>Reenviar código de verificación</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.footerText, { color: textSecondary }]}>
                    Reenviar código ({timerReenvio}s)
                  </Text>
                )}
              </View>
            </View>

            {/* Cambiar correo / Volver */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => setPaso('registro')}>
                <Text style={[styles.footerLink, { color: textSecondary }]}>Usar otro correo</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Paso 1: Formulario de Registro ─────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoChip, { backgroundColor: BRAND }]}>
              <Text style={styles.logoText}>ST</Text>
            </View>
            <Text style={[styles.appName, { color: textColor }]}>Crear cuenta</Text>
            <Text style={[styles.tagline, { color: textSecondary }]}>
              Únete y descubre eventos increíbles
            </Text>
          </View>

          {/* Card formulario */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>

            {/* Nombre */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: textSecondary }]}>Nombre completo</Text>
              <TextInput
                style={[styles.input, { backgroundColor: bg, color: textColor, borderColor: colors.backgroundSelected }]}
                placeholder="Tu nombre"
                placeholderTextColor={textSecondary}
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
                returnKeyType="next"
                textContentType="name"
                editable={!cargando}
              />
            </View>

            {/* Correo */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: textSecondary }]}>Correo electrónico</Text>
              <TextInput
                style={[styles.input, { backgroundColor: bg, color: textColor, borderColor: colors.backgroundSelected }]}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={textSecondary}
                value={correo}
                onChangeText={setCorreo}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                textContentType="emailAddress"
                editable={!cargando}
              />
            </View>

            {/* Contraseña */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: textSecondary }]}>Contraseña</Text>
              <View style={[styles.inputRow, { backgroundColor: bg, borderColor: colors.backgroundSelected }]}>
                <TextInput
                  style={[styles.inputFlex, { color: textColor }]}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor={textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!mostrarPass}
                  returnKeyType="next"
                  textContentType="newPassword"
                  editable={!cargando}
                />
                <Pressable onPress={() => setMostrarPass(v => !v)} style={styles.eyeBtn}>
                  <Text style={[styles.eyeIcon, { color: textSecondary }]}>
                    {mostrarPass ? '🙈' : '👁️'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Confirmar contraseña */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: textSecondary }]}>Confirmar contraseña</Text>
              <View style={[styles.inputRow, { backgroundColor: bg, borderColor: colors.backgroundSelected }]}>
                <TextInput
                  style={[styles.inputFlex, { color: textColor }]}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor={textSecondary}
                  value={passwordConfirm}
                  onChangeText={setPasswordConfirm}
                  secureTextEntry={!mostrarConfirm}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  textContentType="newPassword"
                  editable={!cargando}
                />
                <Pressable onPress={() => setMostrarConfirm(v => !v)} style={styles.eyeBtn}>
                  <Text style={[styles.eyeIcon, { color: textSecondary }]}>
                    {mostrarConfirm ? '🙈' : '👁️'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Indicador de fuerza de contraseña */}
            {password.length > 0 && (
              <PasswordStrength password={password} secondaryColor={textSecondary} />
            )}

            {/* Error */}
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            {/* Botón */}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: cargando ? BRAND_DARK : BRAND }]}
              onPress={handleRegister}
              disabled={cargando}
              activeOpacity={0.85}>
              {cargando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Crear cuenta</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Link a login */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: textSecondary }]}>
              ¿Ya tienes cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.footerLink, { color: BRAND }]}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Indicador de fuerza ────────────────────────────────────────────────────────

function PasswordStrength({ password, secondaryColor }: { password: string; secondaryColor: string }) {
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = (len >= 8 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNum ? 1 : 0) + (hasSpecial ? 1 : 0);

  const labels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  const segColors = ['#e5e7eb', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];

  return (
    <View style={pwStyles.container}>
      <View style={pwStyles.bars}>
        {[1, 2, 3, 4].map(i => (
          <View
            key={i}
            style={[pwStyles.bar, { backgroundColor: i <= score ? segColors[score] : '#e5e7eb' }]}
          />
        ))}
      </View>
      <Text style={[pwStyles.label, { color: score >= 3 ? segColors[score] : secondaryColor }]}>
        {labels[score]}
      </Text>
    </View>
  );
}

const pwStyles = StyleSheet.create({
  container: { gap: 4 },
  bars: { flexDirection: 'row', gap: 4 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  label: { fontSize: 12, fontWeight: '600', textAlign: 'right' },
});

// ── Estilos principales ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  logoChip: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  logoText: { color: '#fff', fontWeight: '700', fontSize: 28 },
  appName: { fontSize: 28, fontWeight: '700' },
  tagline: { fontSize: 14 },
  card: {
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 },
    }),
  },
  fieldGroup: { gap: Spacing.one },
  label: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
  },
  codeInput: {
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 10,
  },
  inputRow: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  inputFlex: { flex: 1, fontSize: 15 },
  eyeBtn: { paddingLeft: Spacing.two, paddingVertical: Spacing.two },
  eyeIcon: { fontSize: 18 },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: { color: '#dc2626', fontSize: 13, fontWeight: '500' },
  infoBanner: {
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  infoText: { color: '#16a34a', fontSize: 13, fontWeight: '500' },
  btn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  reenvioRow: {
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '700' },
  exitoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  exitoEmoji: { fontSize: 64 },
  exitoTitulo: { fontSize: 26, fontWeight: '700' },
  exitoSub: { fontSize: 15, textAlign: 'center' },
});
