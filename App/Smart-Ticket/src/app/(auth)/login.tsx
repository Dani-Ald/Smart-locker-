import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useSessionContext } from '@/context/SessionContext';
import { login, AuthError } from '@/services/authService';

export default function LoginScreen() {
  const { saveSession } = useSessionContext();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [recordarme, setRecordarme] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);

    if (!correo.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setCargando(true);
    try {
      const sesion = await login({ correo: correo.trim().toLowerCase(), password });
      await saveSession(sesion);
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

  return (
    <View style={styles.container}>
      {/* Fondo nocturno con gradiente profundo y orbes de escenario */}
      <LinearGradient
        colors={['#0A0F24', '#0F172A', '#070A17']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.orbCyan} />
      <View style={styles.orbCobalt} />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* Encabezado Temático */}
            <View style={styles.header}>
              <View style={styles.logoContainerOuter}>
                <LinearGradient
                  colors={['rgba(56, 189, 248, 0.3)', 'rgba(37, 99, 235, 0.1)']}
                  style={styles.logoGlowRing}
                />
                <LinearGradient
                  colors={['#00D4FF', '#2563EB']}
                  style={styles.logoChip}>
                  <Text style={styles.logoText}>🎫</Text>
                </LinearGradient>
              </View>
              <Text style={styles.appName}>Smart Ticket</Text>
              <Text style={styles.tagline}>Tu pase a los mejores eventos</Text>
            </View>

            {/* Tarjeta Central Glassmorphism & Neomórfica */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Welcome Back</Text>
                <Text style={styles.cardSubtitle}>
                  Inicia sesión para vivir la experiencia nocturna
                </Text>
              </View>

              {/* Campo de Correo */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
                <View style={[styles.inputRow, error ? styles.inputError : null]}>
                  <Text style={styles.inputIcon}>✉️</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="usuario@festival.com"
                    placeholderTextColor="#64748B"
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
              </View>

              {/* Campo de Contraseña */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>CONTRASEÑA</Text>
                <View style={[styles.inputRow, error ? styles.inputError : null]}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="••••••••••••"
                    placeholderTextColor="#64748B"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!mostrarPass}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    textContentType="password"
                    editable={!cargando}
                  />
                  <TouchableOpacity
                    onPress={() => setMostrarPass(v => !v)}
                    style={styles.eyeBtn}
                    accessibilityLabel={mostrarPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    <Text style={styles.eyeIcon}>{mostrarPass ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Opciones extras: Recordarme y Olvidé contraseña */}
              <View style={styles.extrasRow}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setRecordarme(!recordarme)}
                  activeOpacity={0.8}>
                  <View style={[styles.checkbox, recordarme && styles.checkboxActive]}>
                    {recordarme && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Recordarme</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {}}>
                  <Text style={styles.forgotLink}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
              </View>

              {/* Mensaje de Error */}
              {error && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>⚡ {error}</Text>
                </View>
              )}

              {/* Botón de Inicio de Sesión */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={cargando}
                activeOpacity={0.9}
                style={styles.btnWrapper}>
                <LinearGradient
                  colors={['#00D4FF', '#2563EB', '#1D4ED8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.btnGradient}>
                  {cargando ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={styles.btnContent}>
                      <Text style={styles.btnText}>Iniciar Sesión</Text>
                      <View style={styles.arrowBubble}>
                        <Text style={styles.arrowText}>→</Text>
                      </View>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Separador Social Login */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o conéctate con</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Fila de Social Login */}
              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialBtn} activeOpacity={0.85}>
                  <Text style={styles.socialIcon}>🌐</Text>
                  <Text style={styles.socialText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn} activeOpacity={0.85}>
                  <Text style={styles.socialIcon}>🍎</Text>
                  <Text style={styles.socialText}>Apple</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Enlace a Registro */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Aún no tienes tu pase? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.footerLink}>Regístrate aquí</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F24',
  },
  orbCyan: {
    position: 'absolute',
    top: -80,
    left: -50,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#00D4FF',
    opacity: 0.18,
  },
  orbCobalt: {
    position: 'absolute',
    bottom: -100,
    right: -60,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#2563EB',
    opacity: 0.22,
  },
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  logoContainerOuter: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logoGlowRing: {
    ...StyleSheet.absoluteFill,
    borderRadius: 22,
  },
  logoChip: {
    width: 62,
    height: 62,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  logoText: {
    fontSize: 28,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: '#94A3B8',
    letterSpacing: 0.4,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    gap: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    gap: 4,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
    letterSpacing: 1.2,
  },
  inputRow: {
    height: 52,
    backgroundColor: 'rgba(10, 15, 36, 0.85)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#F8FAFC',
  },
  inputFlex: {
    flex: 1,
    fontSize: 15,
    color: '#F8FAFC',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  eyeBtn: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 16,
  },
  extrasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 15, 36, 0.9)',
  },
  checkboxActive: {
    backgroundColor: '#00D4FF',
  },
  checkmark: {
    color: '#0A0F24',
    fontSize: 12,
    fontWeight: '900',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#94A3B8',
  },
  forgotLink: {
    fontSize: 13,
    color: '#38BDF8',
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '600',
  },
  btnWrapper: {
    marginTop: 6,
    borderRadius: 18,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  btnGradient: {
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  btnContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 24,
  },
  arrowBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
  },
  dividerText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(10, 15, 36, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialIcon: {
    fontSize: 16,
  },
  socialText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#38BDF8',
  },
});
