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

import { useSessionContext } from '@/context/SessionContext';
import { login, AuthError } from '@/services/authService';
import { Colors, Spacing } from '@/constants/theme';

const BRAND = '#208AEF';
const BRAND_DARK = '#1A6EC4';

export default function LoginScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { saveSession } = useSessionContext();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);

    // Validación básica client-side
    if (!correo.trim() || !password.trim()) {
      setError('Completa todos los campos.');
      return;
    }

    setCargando(true);
    try {
      const sesion = await login({ correo: correo.trim().toLowerCase(), password });
      await saveSession(sesion);
      // Redirige al área de tabs (home)
      router.replace('/');
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

  const bg = colors.background;
  const cardBg = colors.backgroundElement;
  const textColor = colors.text;
  const textSecondary = colors.textSecondary;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Logo + título */}
          <View style={styles.header}>
            <View style={[styles.logoChip, { backgroundColor: BRAND }]}>
              <Text style={styles.logoText}>ST</Text>
            </View>
            <Text style={[styles.appName, { color: textColor }]}>Smart Ticket</Text>
            <Text style={[styles.tagline, { color: textSecondary }]}>
              Tu acceso a los mejores eventos
            </Text>
          </View>

          {/* Card del formulario */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Iniciar sesión</Text>

            {/* Campo correo */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: textSecondary }]}>Correo electrónico</Text>
              <TextInput
                style={[styles.input, { backgroundColor: bg, color: textColor, borderColor: error ? '#ef4444' : colors.backgroundSelected }]}
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

            {/* Campo contraseña */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: textSecondary }]}>Contraseña</Text>
              <View style={[styles.inputRow, { backgroundColor: bg, borderColor: error ? '#ef4444' : colors.backgroundSelected }]}>
                <TextInput
                  style={[styles.inputFlex, { color: textColor }]}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor={textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!mostrarPass}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  textContentType="password"
                  editable={!cargando}
                />
                <Pressable
                  onPress={() => setMostrarPass(v => !v)}
                  style={styles.eyeBtn}
                  accessibilityLabel={mostrarPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  <Text style={[styles.eyeIcon, { color: textSecondary }]}>
                    {mostrarPass ? '🙈' : '👁️'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Mensaje de error */}
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            {/* Botón de login */}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: cargando ? BRAND_DARK : BRAND }]}
              onPress={handleLogin}
              disabled={cargando}
              activeOpacity={0.85}>
              {cargando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Entrar</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Link a registro */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: textSecondary }]}>
              ¿No tienes cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={[styles.footerLink, { color: BRAND }]}>Regístrate</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  logoText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 22,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 14,
  },
  card: {
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 },
    }),
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  fieldGroup: { gap: Spacing.one },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
  },
  inputRow: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  inputFlex: {
    flex: 1,
    fontSize: 15,
  },
  eyeBtn: {
    paddingLeft: Spacing.two,
    paddingVertical: Spacing.two,
  },
  eyeIcon: { fontSize: 18 },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },
  btn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '700' },
});
