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
      {/* Fondo limpio azul hielo ultra pálido con orbes flotantes suaves */}
      <View style={styles.orbTopLeft} />
      <View style={styles.orbBottomRight} />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* Isotipo y Encabezado */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#1E60FF', '#0052FF']}
                  style={styles.logoGradient}>
                  <Text style={styles.logoText}>🎫</Text>
                </LinearGradient>
              </View>
              <Text style={styles.appName}>Smart Ticket</Text>
              <Text style={styles.tagline}>Tu acceso a los mejores eventos</Text>
            </View>

            {/* Tarjeta Central Clean Soft Neumorphism + Glassmorphism */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Welcome Back</Text>
                <Text style={styles.cardSubtitle}>
                  Inicia sesión para continuar tu experiencia
                </Text>
              </View>

              {/* Campo de Correo */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
                <View style={[styles.inputRow, error ? styles.inputError : null]}>
                  <Text style={styles.inputIcon}>✉️</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="correo@ejemplo.com"
                    placeholderTextColor="#8A99AD"
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
                    placeholder="Mínimo 8 caracteres"
                    placeholderTextColor="#8A99AD"
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

              {/* Olvidé contraseña */}
              <View style={styles.forgotRow}>
                <TouchableOpacity onPress={() => {}}>
                  <Text style={styles.forgotLink}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
              </View>

              {/* Mensaje de Error */}
              {error && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              )}

              {/* Botón de Inicio de Sesión (CTA Principal) */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={cargando}
                activeOpacity={0.9}
                style={styles.btnWrapper}>
                <LinearGradient
                  colors={['#1E60FF', '#0052FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
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

              {/* Separador */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>O CONTINUAR CON</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login */}
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
              <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.footerLink}>Regístrate</Text>
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
    backgroundColor: '#EEF4FA',
  },
  orbTopLeft: {
    position: 'absolute',
    top: -60,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
  },
  orbBottomRight: {
    position: 'absolute',
    bottom: -80,
    right: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(30, 96, 255, 0.15)',
  },
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0052FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 4,
  },
  logoGradient: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 26,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0D172A',
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 13,
    color: '#8A99AD',
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    gap: 16,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  cardHeader: {
    gap: 2,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D172A',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8A99AD',
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E60FF',
    letterSpacing: 1.1,
  },
  inputRow: {
    height: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  inputIcon: {
    fontSize: 15,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0D172A',
  },
  inputFlex: {
    flex: 1,
    fontSize: 15,
    color: '#0D172A',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  eyeBtn: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 15,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: -2,
  },
  forgotLink: {
    fontSize: 13,
    color: '#1E60FF',
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  btnWrapper: {
    marginTop: 4,
    borderRadius: 22,
    shadowColor: '#1E60FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  btnGradient: {
    height: 54,
    borderRadius: 22,
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
    letterSpacing: 0.4,
    marginLeft: 20,
  },
  arrowBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
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
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 11,
    color: '#8A99AD',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  socialIcon: {
    fontSize: 16,
  },
  socialText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D172A',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#8A99AD',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E60FF',
  },
});
