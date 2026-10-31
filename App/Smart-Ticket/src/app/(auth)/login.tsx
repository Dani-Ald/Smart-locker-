import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AlertIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
} from '@/components/auth/auth-icons';
import { SmartTicketLogo } from '@/components/auth/smart-ticket-logo';
import { AuthColors, AuthPalette, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useSessionContext } from '@/context/SessionContext';
import { AuthError, login } from '@/services/authService';

export default function LoginScreen() {
  const { saveSession } = useSessionContext();
  const colors = useColorScheme() === 'dark' ? AuthColors.dark : AuthColors.light;
  const styles = createStyles(colors);
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    const correoNormalizado = correo.trim().toLowerCase();
    setError(null);

    if (!correoNormalizado || !password) {
      setError('Completa tu correo y contraseña.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(correoNormalizado)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      const session = await login({ correo: correoNormalizado, password });
      await saveSession(session);
    } catch (err) {
      if (err instanceof AuthError || err instanceof Error) setError(err.message);
      else setError('No fue posible iniciar sesión. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.orbTop} />
      <View pointerEvents="none" style={styles.orbBottom} />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <View style={styles.header}>
                <SmartTicketLogo colors={colors} />
                <Text style={styles.appName}>Smart Ticket</Text>
                <Text style={styles.tagline}>Tu pase a los mejores eventos</Text>
              </View>

              <View style={styles.card}>
                <View style={styles.intro}>
                  <View style={styles.stepIcon}>
                    <LockIcon color={colors.primary} size={24} />
                  </View>
                  <Text style={styles.title}>Inicia sesión</Text>
                  <Text style={styles.subtitle}>Ingresa con el correo y la contraseña de tu cuenta.</Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Correo electrónico</Text>
                  <View style={[styles.inputRow, error && styles.inputError]}>
                    <MailIcon color={colors.textMuted} />
                    <TextInput
                      accessibilityLabel="Correo electrónico"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                      editable={!loading}
                      keyboardType="email-address"
                      onChangeText={setCorreo}
                      placeholder="nombre@correo.com"
                      placeholderTextColor={colors.textMuted}
                      returnKeyType="next"
                      selectionColor={colors.primary}
                      style={styles.input}
                      textContentType="emailAddress"
                      value={correo}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Contraseña</Text>
                  <View style={[styles.inputRow, error && styles.inputError]}>
                    <LockIcon color={colors.textMuted} />
                    <TextInput
                      accessibilityLabel="Contraseña"
                      autoCapitalize="none"
                      autoComplete="current-password"
                      editable={!loading}
                      onChangeText={setPassword}
                      onSubmitEditing={() => void handleLogin()}
                      placeholder="Tu contraseña"
                      placeholderTextColor={colors.textMuted}
                      returnKeyType="done"
                      secureTextEntry={!mostrarPassword}
                      selectionColor={colors.primary}
                      style={styles.input}
                      textContentType="password"
                      value={password}
                    />
                    <Pressable
                      accessibilityLabel={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      accessibilityRole="button"
                      onPress={() => setMostrarPassword((value) => !value)}
                      style={styles.eyeButton}>
                      {mostrarPassword
                        ? <EyeOffIcon color={colors.textSecondary} />
                        : <EyeIcon color={colors.textSecondary} />}
                    </Pressable>
                  </View>
                </View>

                {error ? (
                  <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.errorBanner}>
                    <AlertIcon color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ busy: loading, disabled: loading }}
                  disabled={loading}
                  onPress={() => void handleLogin()}
                  style={({ pressed }) => [styles.ctaShadow, pressed && styles.pressed, loading && styles.disabled]}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryEnd]}
                    end={{ x: 1, y: 0.5 }}
                    start={{ x: 0, y: 0.5 }}
                    style={styles.cta}>
                    {loading ? <ActivityIndicator color={colors.onPrimary} /> : <>
                      <Text style={styles.ctaText}>Iniciar sesión</Text>
                      <View style={styles.arrowCircle}>
                        <ArrowRightIcon color={colors.onPrimary} size={18} />
                      </View>
                    </>}
                  </LinearGradient>
                </Pressable>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>¿Aún no tienes cuenta?</Text>
                <Pressable
                  accessibilityRole="link"
                  onPress={() => router.push('/(auth)/register')}
                  style={styles.textButton}>
                  <Text style={styles.link}>Crear cuenta</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function createStyles(colors: AuthPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    safe: { flex: 1 },
    orbTop: { position: 'absolute', top: -90, right: -70, width: 260, height: 260, borderRadius: Radius.full, backgroundColor: colors.orbSecondary },
    orbBottom: { position: 'absolute', bottom: -110, left: -80, width: 290, height: 290, borderRadius: Radius.full, backgroundColor: colors.orbPrimary },
    scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.four, paddingVertical: Spacing.five },
    content: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: Spacing.four },
    header: { alignItems: 'center', gap: Spacing.two },
    appName: { color: colors.text, fontSize: FontSize['3xl'], fontWeight: FontWeight.heavy, letterSpacing: -0.6 },
    tagline: { color: colors.textSecondary, fontSize: FontSize.base },
    card: { gap: Spacing.three, padding: Spacing.four, borderRadius: Radius.xl + 8, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.1, shadowRadius: 28, elevation: 7 },
    intro: { alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.one },
    stepIcon: { width: 52, height: 52, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMuted },
    title: { color: colors.text, fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center' },
    subtitle: { color: colors.textSecondary, fontSize: FontSize.base, lineHeight: 21, textAlign: 'center' },
    fieldGroup: { gap: Spacing.two },
    label: { marginLeft: Spacing.one, color: colors.textSecondary, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    inputRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, borderRadius: Radius.xl, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.surfaceSolid },
    inputError: { borderColor: colors.errorBorder },
    input: { flex: 1, color: colors.text, fontSize: FontSize.md, paddingVertical: Spacing.two },
    eyeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -Spacing.two },
    errorBanner: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.three, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.errorBorder, backgroundColor: colors.errorSurface },
    errorText: { flex: 1, color: colors.error, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    ctaShadow: { borderRadius: Radius.full, shadowColor: colors.primaryShadow, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 18, elevation: 7 },
    cta: { minHeight: 56, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full },
    ctaText: { color: colors.onPrimary, fontSize: FontSize.md, fontWeight: FontWeight.bold },
    arrowCircle: { position: 'absolute', right: Spacing.two, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full, backgroundColor: colors.primarySoft },
    pressed: { opacity: 0.82 },
    disabled: { opacity: 0.65 },
    textButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.one },
    link: { color: colors.primary, fontSize: FontSize.base, fontWeight: FontWeight.bold },
    footer: { minHeight: 44, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: Spacing.one },
    footerText: { color: colors.textSecondary, fontSize: FontSize.base },
  });
}
