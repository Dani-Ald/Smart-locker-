import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ReactNode, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  AlertIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
} from '@/components/auth/auth-icons';
import { LiquidGlassPanel } from '@/components/auth/liquid-glass-panel';
import { LiquidLoginBackground } from '@/components/auth/liquid-login-background';
import { SmartTicketLogo } from '@/components/auth/smart-ticket-logo';
import { TicketLoader } from '@/components/TicketLoader';
import { AuthColors, AuthPalette, Duration, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useSessionContext } from '@/context/SessionContext';
import { AuthError, login } from '@/services/authService';

export default function LoginScreen() {
  const { saveSession } = useSessionContext();
  const colors = useColorScheme() === 'dark' ? AuthColors.dark : AuthColors.light;
  const styles = createStyles(colors);
  const { height } = useWindowDimensions();
  const compact = height < 740;
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'correo' | 'password' | null>(null);
  const [buttonPressed, setButtonPressed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestController, setRequestController] = useState<AbortController | null>(null);
  const [showSlowConnectionMessage, setShowSlowConnectionMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const buttonScale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  useEffect(() => {
    buttonScale.set(withTiming(buttonPressed ? 0.985 : 1, {
      duration: reduceMotion ? 0 : Duration.fast,
    }));
  }, [buttonPressed, buttonScale, reduceMotion]);

  useEffect(() => {
    if (!loading) return;

    const timeout = setTimeout(() => setShowSlowConnectionMessage(true), 3_000);
    return () => clearTimeout(timeout);
  }, [loading]);

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

    setShowSlowConnectionMessage(false);
    setLoading(true);
    const controller = new AbortController();
    setRequestController(controller);
    try {
      const session = await login({ correo: correoNormalizado, password }, controller.signal);
      await saveSession(session);
    } catch (err) {
      if (err instanceof AuthError || err instanceof Error) setError(err.message);
      else setError('No fue posible iniciar sesión. Inténtalo nuevamente.');
    } finally {
      setShowSlowConnectionMessage(false);
      setLoading(false);
      setRequestController(null);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[colors.backgroundTop, colors.background, colors.backgroundBottom]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <TicketLoader />
        <Text style={[styles.loginLoadingTitle, { color: colors.text }]}>Preparando tu acceso</Text>
        <Text style={[styles.loginLoadingCopy, { color: colors.textSecondary }]}>
          {showSlowConnectionMessage
            ? 'La conexión está tardando. Puedes esperar un poco más o cancelar e intentarlo de nuevo.'
            : 'Estamos conectando con Smart Ticket…'}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancelar inicio de sesión"
          onPress={() => requestController?.abort()}
          style={({ pressed }) => [styles.cancelLogin, pressed && styles.pressed]}>
          <Text style={[styles.cancelLoginText, { color: colors.primary }]}>Cancelar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <LiquidLoginBackground colors={colors} />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={[styles.scroll, compact && styles.scrollCompact]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <View style={[styles.header, compact && styles.headerCompact]}>
                <View style={styles.logoHalo}>
                  <View pointerEvents="none" style={styles.logoGlow} />
                  <SmartTicketLogo colors={colors} />
                </View>
                <Text style={styles.appName}>Smart Ticket</Text>
                <Text style={styles.tagline}>Tu pase a los mejores eventos</Text>
              </View>

              <LiquidGlassPanel colors={colors} style={styles.card}>
                <View style={[styles.cardContent, compact && styles.cardContentCompact]}>
                <View style={styles.intro}>
                  <View style={styles.stepIcon}>
                    <LockIcon color={colors.primary} size={24} />
                  </View>
                  <Text style={styles.title}>Inicia sesión</Text>
                  <Text style={styles.subtitle}>Ingresa con el correo y la contraseña de tu cuenta.</Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Correo electrónico</Text>
                  <GlassInputFrame
                    colors={colors}
                    error={Boolean(error)}
                    focused={focusedField === 'correo'}
                    styles={styles}>
                    <MailIcon color={colors.textMuted} />
                    <TextInput
                      accessibilityLabel="Correo electrónico"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                      editable={!loading}
                      keyboardType="email-address"
                      onBlur={() => setFocusedField(null)}
                      onChangeText={setCorreo}
                      onFocus={() => setFocusedField('correo')}
                      placeholder="nombre@correo.com"
                      placeholderTextColor={colors.textMuted}
                      returnKeyType="next"
                      selectionColor={colors.primary}
                      style={styles.input}
                      textContentType="emailAddress"
                      value={correo}
                    />
                  </GlassInputFrame>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Contraseña</Text>
                  <GlassInputFrame
                    colors={colors}
                    error={Boolean(error)}
                    focused={focusedField === 'password'}
                    styles={styles}>
                    <LockIcon color={colors.textMuted} />
                    <TextInput
                      accessibilityLabel="Contraseña"
                      autoCapitalize="none"
                      autoComplete="current-password"
                      editable={!loading}
                      onBlur={() => setFocusedField(null)}
                      onChangeText={setPassword}
                      onFocus={() => setFocusedField('password')}
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
                  </GlassInputFrame>
                </View>

                {error ? (
                  <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.errorBanner}>
                    <AlertIcon color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <Animated.View style={[styles.ctaShadow, buttonAnimatedStyle, loading && styles.disabled]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ busy: loading, disabled: loading }}
                    disabled={loading}
                    onPress={() => void handleLogin()}
                    onPressIn={() => setButtonPressed(true)}
                    onPressOut={() => setButtonPressed(false)}
                    style={({ pressed }) => pressed && styles.pressed}>
                    <LinearGradient
                      colors={[colors.primary, colors.primaryEnd]}
                      end={{ x: 1, y: 0.5 }}
                      start={{ x: 0, y: 0.5 }}
                      style={styles.cta}>
                      <LinearGradient
                        colors={['rgba(255,255,255,0.34)', 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0)']}
                        end={{ x: 0.2, y: 1 }}
                        pointerEvents="none"
                        start={{ x: 0, y: 0 }}
                        style={styles.ctaSheen}
                      />
                      <Text style={styles.ctaText}>Iniciar sesión</Text>
                      <View style={styles.arrowCircle}>
                        <ArrowRightIcon color={colors.onPrimary} size={18} />
                      </View>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
                </View>
              </LiquidGlassPanel>

              <View style={[styles.footerGlass, { borderColor: colors.glassBorder }]}>
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

type LoginStyles = ReturnType<typeof createStyles>;

function GlassInputFrame({ children, colors, error, focused, styles }: {
  children: ReactNode;
  colors: AuthPalette;
  error: boolean;
  focused: boolean;
  styles: LoginStyles;
}) {
  const focusProgress = useSharedValue(focused ? 1 : 0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    focusProgress.value = withTiming(focused ? 1 : 0, {
      duration: reduceMotion ? 0 : Duration.normal,
    });
  }, [focusProgress, focused, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [colors.inputGlass, colors.inputGlassFocused],
    ),
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [colors.inputBorder, colors.borderFocused],
    ),
    shadowOpacity: focusProgress.value * 0.18,
  }));

  return (
    <Animated.View style={[styles.inputRow, animatedStyle, error && styles.inputError]}>
      <View pointerEvents="none" style={styles.inputTopLight} />
      {children}
    </Animated.View>
  );
}

function createStyles(colors: AuthPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    safe: { flex: 1 },
    scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: Spacing.five },
    scrollCompact: { justifyContent: 'flex-start', paddingVertical: Spacing.three },
    content: { width: '88%', maxWidth: 440, alignSelf: 'center', gap: Spacing.four },
    header: { alignItems: 'center', gap: Spacing.two },
    headerCompact: { gap: Spacing.one },
    logoHalo: { width: 112, height: 108, alignItems: 'center', justifyContent: 'center' },
    logoGlow: { position: 'absolute', width: 110, height: 110, borderRadius: Radius.full, backgroundColor: colors.ambientWhite, shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.28, shadowRadius: 28, elevation: 3 },
    appName: { color: colors.text, fontSize: FontSize['3xl'], fontWeight: FontWeight.heavy, letterSpacing: -0.8, textShadowColor: colors.ambientWhite, textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 10 },
    tagline: { color: colors.textSecondary, fontSize: FontSize.base, fontWeight: FontWeight.medium },
    card: { width: '100%', borderRadius: Radius.xl + 12 },
    cardContent: { gap: Spacing.three, padding: Spacing.four },
    cardContentCompact: { paddingVertical: Spacing.three },
    intro: { alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.one },
    stepIcon: { width: 52, height: 52, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.glassBorder, backgroundColor: colors.inputGlass, shadowColor: colors.primaryShadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 14, elevation: 3 },
    title: { color: colors.text, fontSize: FontSize.xl, fontWeight: FontWeight.heavy, letterSpacing: -0.3, textAlign: 'center' },
    subtitle: { color: colors.textSecondary, fontSize: FontSize.base, lineHeight: 21, textAlign: 'center' },
    fieldGroup: { gap: Spacing.two },
    label: { marginLeft: Spacing.one, color: colors.textSecondary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
    inputRow: { minHeight: 58, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, borderRadius: Radius.xl, borderWidth: 1, shadowColor: colors.primaryShadow, shadowOffset: { width: 0, height: 6 }, shadowRadius: 14, elevation: 2 },
    inputTopLight: { position: 'absolute', top: 0, left: Spacing.three, right: Spacing.three, height: StyleSheet.hairlineWidth, backgroundColor: colors.glassBorder },
    inputError: { borderColor: colors.errorBorder },
    input: { flex: 1, color: colors.text, fontSize: FontSize.md, paddingVertical: Spacing.two },
    eyeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -Spacing.two },
    errorBanner: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.three, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.errorBorder, backgroundColor: colors.errorSurface },
    errorText: { flex: 1, color: colors.error, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    ctaShadow: { overflow: 'hidden', borderRadius: Radius.full, borderWidth: 1, borderColor: colors.glassBorder, shadowColor: colors.primaryShadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.34, shadowRadius: 20, elevation: 8 },
    cta: { minHeight: 58, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full },
    ctaSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '58%' },
    ctaText: { color: colors.onPrimary, fontSize: FontSize.md, fontWeight: FontWeight.bold },
    arrowCircle: { position: 'absolute', right: Spacing.two, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full, backgroundColor: colors.primarySoft },
    pressed: { opacity: 0.82 },
    disabled: { opacity: 0.65 },
    loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, paddingHorizontal: Spacing.five },
    loginLoadingTitle: { marginTop: Spacing.two, fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center' },
    loginLoadingCopy: { maxWidth: 320, fontSize: FontSize.base, lineHeight: 23, textAlign: 'center' },
    cancelLogin: { minWidth: 120, minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.two, paddingHorizontal: Spacing.four, borderRadius: Radius.full, borderWidth: 1, borderColor: colors.glassBorder, backgroundColor: colors.glassSurface },
    cancelLoginText: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
    textButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.one },
    link: { color: colors.primary, fontSize: FontSize.base, fontWeight: FontWeight.bold },
    footerGlass: { minHeight: 48, alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: Spacing.one, paddingHorizontal: Spacing.three, borderRadius: Radius.full, borderWidth: StyleSheet.hairlineWidth, backgroundColor: colors.glassSurface },
    footerText: { color: colors.textSecondary, fontSize: FontSize.base },
  });
}
