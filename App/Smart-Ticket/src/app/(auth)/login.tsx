import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertIcon, ArrowRightIcon, LockIcon, MailIcon } from '@/components/auth/auth-icons';
import { SmartTicketLogo } from '@/components/auth/smart-ticket-logo';
import { AuthColors, AuthPalette, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useSessionContext } from '@/context/SessionContext';
import { AuthError, solicitarCodigoAcceso, verificarCodigoAcceso } from '@/services/authService';

type Step = 'email' | 'code';

export default function LoginScreen() {
  const { saveSession } = useSessionContext();
  const colors = useColorScheme() === 'dark' ? AuthColors.dark : AuthColors.light;
  const styles = createStyles(colors);
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestCode() {
    const normalized = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalized)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await solicitarCodigoAcceso(normalized);
      setDevCode(result.codigoDev ?? null);
      setStep('code');
      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible enviar el código.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    if (!/^\d{6}$/.test(code)) {
      setError('Ingresa el código de 6 dígitos.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const session = await verificarCodigoAcceso(email.trim().toLowerCase(), code);
      await saveSession(session);
    } catch (err) {
      setError(err instanceof AuthError || err instanceof Error ? err.message : 'No fue posible verificar el código.');
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
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.content}>
              <View style={styles.header}>
                <SmartTicketLogo colors={colors} />
                <Text style={styles.appName}>Smart Ticket</Text>
                <Text style={styles.tagline}>Tu pase a los mejores eventos</Text>
              </View>

              <View style={styles.card}>
                <View style={styles.intro}>
                  <View style={[styles.stepIcon, { backgroundColor: colors.primarySoft }]}>
                    {step === 'email' ? <MailIcon color={colors.primary} size={24} /> : <LockIcon color={colors.primary} size={24} />}
                  </View>
                  <Text style={styles.title}>{step === 'email' ? 'Accede sin contraseña' : 'Revisa tu correo'}</Text>
                  <Text style={styles.subtitle}>
                    {step === 'email'
                      ? 'Te enviaremos un código de acceso de un solo uso.'
                      : `Enviamos un código de 6 dígitos a ${email.trim().toLowerCase()}.`}
                  </Text>
                </View>

                {step === 'email' ? (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Correo electrónico</Text>
                    <View style={styles.inputRow}>
                      <MailIcon color={colors.textMuted} />
                      <TextInput
                        accessibilityLabel="Correo electrónico"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect={false}
                        editable={!loading}
                        keyboardType="email-address"
                        onChangeText={setEmail}
                        onSubmitEditing={() => void requestCode()}
                        placeholder="nombre@correo.com"
                        placeholderTextColor={colors.textMuted}
                        returnKeyType="send"
                        selectionColor={colors.primary}
                        style={styles.input}
                        value={email}
                      />
                    </View>
                  </View>
                ) : (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Código de acceso</Text>
                    <TextInput
                      accessibilityLabel="Código de acceso de 6 dígitos"
                      autoComplete="one-time-code"
                      autoFocus
                      editable={!loading}
                      keyboardType="number-pad"
                      maxLength={6}
                      onChangeText={(value) => setCode(value.replace(/\D/g, ''))}
                      onSubmitEditing={() => void verifyCode()}
                      placeholder="000000"
                      placeholderTextColor={colors.textMuted}
                      selectionColor={colors.primary}
                      style={styles.codeInput}
                      textContentType="oneTimeCode"
                      value={code}
                    />
                    {devCode ? (
                      <Pressable accessibilityRole="button" onPress={() => setCode(devCode)} style={[styles.devCode, { backgroundColor: colors.surfaceMuted }]}>
                        <Text style={styles.devCodeText}>Código de desarrollo: {devCode}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                )}

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
                  onPress={() => void (step === 'email' ? requestCode() : verifyCode())}
                  style={({ pressed }) => [styles.ctaShadow, pressed && styles.pressed, loading && styles.disabled]}>
                  <LinearGradient colors={[colors.primary, colors.primaryEnd]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.cta}>
                    {loading ? <ActivityIndicator color={colors.onPrimary} /> : <>
                      <Text style={styles.ctaText}>{step === 'email' ? 'Enviar código' : 'Ingresar a mi wallet'}</Text>
                      <View style={styles.arrowCircle}><ArrowRightIcon color={colors.onPrimary} size={18} /></View>
                    </>}
                  </LinearGradient>
                </Pressable>

                {step === 'code' ? (
                  <View style={styles.codeActions}>
                    <Pressable onPress={() => { setStep('email'); setError(null); }} style={styles.textButton}><Text style={styles.link}>Cambiar correo</Text></Pressable>
                    <Pressable disabled={loading} onPress={() => void requestCode()} style={styles.textButton}><Text style={styles.link}>Reenviar código</Text></Pressable>
                  </View>
                ) : null}
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>¿Aún no tienes cuenta?</Text>
                <Pressable accessibilityRole="link" onPress={() => router.push('/(auth)/register')} style={styles.textButton}>
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
    container: { flex: 1, backgroundColor: colors.background }, safe: { flex: 1 },
    orbTop: { position: 'absolute', top: -90, right: -70, width: 260, height: 260, borderRadius: Radius.full, backgroundColor: colors.orbSecondary },
    orbBottom: { position: 'absolute', bottom: -110, left: -80, width: 290, height: 290, borderRadius: Radius.full, backgroundColor: colors.orbPrimary },
    scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.four, paddingVertical: Spacing.five }, content: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: Spacing.four },
    header: { alignItems: 'center', gap: Spacing.two }, appName: { color: colors.text, fontSize: FontSize['3xl'], fontWeight: FontWeight.heavy, letterSpacing: -0.6 }, tagline: { color: colors.textSecondary, fontSize: FontSize.base },
    card: { gap: Spacing.three, padding: Spacing.four, borderRadius: Radius.xl + 8, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.1, shadowRadius: 28, elevation: 7 },
    intro: { alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.one }, stepIcon: { width: 52, height: 52, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' }, title: { color: colors.text, fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center' }, subtitle: { color: colors.textSecondary, fontSize: FontSize.base, lineHeight: 21, textAlign: 'center' },
    fieldGroup: { gap: Spacing.two }, label: { marginLeft: Spacing.one, color: colors.textSecondary, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    inputRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, borderRadius: Radius.xl, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.surfaceSolid }, input: { flex: 1, color: colors.text, fontSize: FontSize.md, paddingVertical: Spacing.two },
    codeInput: { minHeight: 66, borderRadius: Radius.xl, borderWidth: 1, borderColor: colors.borderFocused, backgroundColor: colors.surfaceSolid, color: colors.text, fontSize: 28, fontWeight: FontWeight.bold, textAlign: 'center', letterSpacing: 12, paddingLeft: 12 },
    devCode: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.lg }, devCodeText: { color: colors.textSecondary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
    errorBanner: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.three, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.errorBorder, backgroundColor: colors.errorSurface }, errorText: { flex: 1, color: colors.error, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    ctaShadow: { borderRadius: Radius.full, shadowColor: colors.primaryShadow, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 18, elevation: 7 }, cta: { minHeight: 56, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full }, ctaText: { color: colors.onPrimary, fontSize: FontSize.md, fontWeight: FontWeight.bold }, arrowCircle: { position: 'absolute', right: Spacing.two, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full, backgroundColor: colors.primarySoft }, pressed: { opacity: 0.82 }, disabled: { opacity: 0.65 },
    codeActions: { flexDirection: 'row', justifyContent: 'space-between' }, textButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.one }, link: { color: colors.primary, fontSize: FontSize.base, fontWeight: FontWeight.bold }, footer: { minHeight: 44, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: Spacing.one }, footerText: { color: colors.textSecondary, fontSize: FontSize.base },
  });
}
