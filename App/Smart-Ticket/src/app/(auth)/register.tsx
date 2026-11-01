import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useIsFocused } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
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
  UserIcon,
} from '@/components/auth/auth-icons';
import { SmartTicketLogo } from '@/components/auth/smart-ticket-logo';
import { AuthColors, AuthPalette, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { volverOIr } from '@/navigation/routes';
import { AuthError, reenviarCodigo, register, verificarCodigo } from '@/services/authService';

type Paso = 'registro' | 'verificacion' | 'exito';

export default function RegisterScreen() {
  const colors = AuthColors[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const styles = createStyles(colors);
  const focused = useIsFocused();
  const [paso, setPaso] = useState<Paso>('registro');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [codigoDev, setCodigoDev] = useState<string | null>(null);
  const [timerReenvio, setTimerReenvio] = useState(60);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMensaje, setInfoMensaje] = useState<string | null>(null);

  const volver = useCallback(() => {
    if (paso === 'verificacion') setPaso('registro');
    else volverOIr('/(auth)/login');
  }, [paso]);

  usePreventRemove(paso === 'verificacion', () => setPaso('registro'));
  useFocusEffect(useCallback(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (paso !== 'verificacion') return false;
      setPaso('registro');
      return true;
    });
    return () => subscription.remove();
  }, [paso]));

  useEffect(() => {
    if (paso !== 'exito' || !focused) return;
    const timeout = setTimeout(() => router.replace('/(auth)/login'), 2000);
    return () => clearTimeout(timeout);
  }, [focused, paso]);

  useEffect(() => {
    if (paso !== 'verificacion' || timerReenvio <= 0) return;
    const timeout = setTimeout(() => setTimerReenvio((value) => value - 1), 1000);
    return () => clearTimeout(timeout);
  }, [paso, timerReenvio]);

  function validarForm() {
    if (!nombre.trim() || !correo.trim() || !password || !passwordConfirm) return 'Completa todos los campos.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) return 'Ingresa un correo electrónico válido.';
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (password !== passwordConfirm) return 'Las contraseñas no coinciden.';
    return null;
  }

  async function handleRegister() {
    setError(null);
    setInfoMensaje(null);
    const validacion = validarForm();
    if (validacion) {
      setError(validacion);
      return;
    }

    setCargando(true);
    try {
      const response = await register({
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        password,
        passwordConfirm,
      });
      setCodigoDev(response.codigoDev ?? null);
      if (response.emailError) {
        setInfoMensaje('Cuenta creada. El correo puede tardar; usa el código de prueba si aparece abajo.');
      }
      setPaso('verificacion');
      setTimerReenvio(60);
    } catch (err) {
      setError(errorMessage(err, 'No fue posible crear la cuenta.'));
    } finally {
      setCargando(false);
    }
  }

  async function handleVerificarCodigo() {
    setError(null);
    setInfoMensaje(null);
    if (!/^\d{6}$/.test(codigo.trim())) {
      setError('Ingresa el código de 6 dígitos que enviamos a tu correo.');
      return;
    }

    setCargando(true);
    try {
      await verificarCodigo({ correo: correo.trim().toLowerCase(), codigo: codigo.trim() });
      setPaso('exito');
    } catch (err) {
      setError(errorMessage(err, 'No fue posible verificar el código.'));
    } finally {
      setCargando(false);
    }
  }

  async function handleReenviarCodigo() {
    if (timerReenvio > 0) return;
    setError(null);
    setInfoMensaje(null);
    setCargando(true);
    try {
      const response = await reenviarCodigo({ correo: correo.trim().toLowerCase() });
      setCodigoDev(response.codigoDev ?? null);
      setInfoMensaje(response.emailError
        ? 'Código generado. Usa el código de prueba si aparece abajo.'
        : 'Enviamos un nuevo código de verificación.');
      setTimerReenvio(60);
    } catch (err) {
      setError(errorMessage(err, 'No fue posible reenviar el código.'));
    } finally {
      setCargando(false);
    }
  }

  if (paso === 'exito') {
    return (
      <AuthPage colors={colors} styles={styles}>
        <View style={styles.successCard}>
          <SmartTicketLogo colors={colors} />
          <Text style={styles.successTitle}>¡Cuenta verificada!</Text>
          <Text style={styles.successCopy}>Tu correo fue confirmado. Te llevaremos al inicio de sesión.</Text>
          <ActivityIndicator color={colors.primary} />
        </View>
      </AuthPage>
    );
  }

  if (paso === 'verificacion') {
    return (
      <AuthPage colors={colors} styles={styles} keyboard>
        <AuthHeader colors={colors} styles={styles} />
        <View style={styles.card}>
          <View style={styles.intro}>
            <View style={styles.stepIcon}><MailIcon color={colors.primary} size={24} /></View>
            <Text style={styles.title}>Verifica tu cuenta</Text>
            <Text style={styles.subtitle}>Enviamos un código de 6 dígitos a {correo.trim().toLowerCase()}.</Text>
          </View>

          {infoMensaje ? <InfoBanner colors={colors} styles={styles} message={infoMensaje} /> : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Código de verificación</Text>
            <TextInput
              accessibilityLabel="Código de verificación de 6 dígitos"
              autoComplete="one-time-code"
              autoFocus
              editable={!cargando}
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={(value) => setCodigo(value.replace(/\D/g, ''))}
              onSubmitEditing={() => void handleVerificarCodigo()}
              placeholder="000000"
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
              selectionColor={colors.primary}
              style={styles.codeInput}
              textContentType="oneTimeCode"
              value={codigo}
            />
          </View>

          <Text style={styles.hint}>Revisa también Spam o Correo no deseado.</Text>
          {codigoDev ? (
            <Pressable accessibilityRole="button" onPress={() => setCodigo(codigoDev)} style={styles.devCode}>
              <Text style={styles.devCodeText}>Código de desarrollo: {codigoDev}</Text>
            </Pressable>
          ) : null}
          {error ? <ErrorBanner colors={colors} styles={styles} message={error} /> : null}

          <PrimaryButton
            colors={colors}
            disabled={cargando}
            label="Verificar cuenta"
            loading={cargando}
            onPress={handleVerificarCodigo}
            styles={styles}
          />

          <View style={styles.codeActions}>
            <Pressable accessibilityRole="button" onPress={() => setPaso('registro')} style={styles.textButton}>
              <Text style={styles.link}>Cambiar correo</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: timerReenvio > 0 || cargando }}
              disabled={timerReenvio > 0 || cargando}
              onPress={() => void handleReenviarCodigo()}
              style={styles.textButton}>
              <Text style={[styles.link, timerReenvio > 0 && styles.mutedLink]}>
                {timerReenvio > 0 ? `Reenviar (${timerReenvio}s)` : 'Reenviar código'}
              </Text>
            </Pressable>
          </View>
        </View>
      </AuthPage>
    );
  }

  return (
    <AuthPage colors={colors} styles={styles} keyboard>
      <AuthHeader colors={colors} styles={styles} />
      <View style={styles.card}>
        <View style={styles.intro}>
          <View style={styles.stepIcon}><UserIcon color={colors.primary} size={24} /></View>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Regístrate para guardar y presentar tus boletos.</Text>
        </View>

        <AuthInput
          accessibilityLabel="Nombre completo"
          autoCapitalize="words"
          colors={colors}
          editable={!cargando}
          icon={<UserIcon color={colors.textMuted} />}
          label="Nombre completo"
          onChangeText={setNombre}
          placeholder="Tu nombre"
          styles={styles}
          textContentType="name"
          value={nombre}
        />
        <AuthInput
          accessibilityLabel="Correo electrónico"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          colors={colors}
          editable={!cargando}
          icon={<MailIcon color={colors.textMuted} />}
          keyboardType="email-address"
          label="Correo electrónico"
          onChangeText={setCorreo}
          placeholder="nombre@correo.com"
          styles={styles}
          textContentType="emailAddress"
          value={correo}
        />

        <PasswordInput
          colors={colors}
          editable={!cargando}
          label="Contraseña"
          onChangeText={setPassword}
          onToggle={() => setMostrarPass((value) => !value)}
          placeholder="Mínimo 8 caracteres"
          styles={styles}
          value={password}
          visible={mostrarPass}
        />
        <PasswordInput
          colors={colors}
          editable={!cargando}
          label="Confirmar contraseña"
          onChangeText={setPasswordConfirm}
          onSubmitEditing={() => void handleRegister()}
          onToggle={() => setMostrarConfirm((value) => !value)}
          placeholder="Repite tu contraseña"
          returnKeyType="done"
          styles={styles}
          value={passwordConfirm}
          visible={mostrarConfirm}
        />
        {password ? <PasswordStrength colors={colors} password={password} styles={styles} /> : null}
        {error ? <ErrorBanner colors={colors} styles={styles} message={error} /> : null}
        <PrimaryButton
          colors={colors}
          disabled={cargando}
          label="Crear cuenta"
          loading={cargando}
          onPress={handleRegister}
          styles={styles}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
        <Pressable accessibilityRole="link" onPress={volver} style={styles.textButton}>
          <Text style={styles.link}>Inicia sesión</Text>
        </Pressable>
      </View>
    </AuthPage>
  );
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof AuthError || error instanceof Error) return error.message;
  return fallback;
}

type Styles = ReturnType<typeof createStyles>;

function AuthPage({ children, colors, keyboard = false, styles }: {
  children: React.ReactNode;
  colors: AuthPalette;
  keyboard?: boolean;
  styles: Styles;
}) {
  const content = (
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.orbTop} />
      <View pointerEvents="none" style={styles.orbBottom} />
      <SafeAreaView style={styles.safe}>
        {keyboard
          ? <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>{content}</KeyboardAvoidingView>
          : content}
      </SafeAreaView>
    </View>
  );
}

function AuthHeader({ colors, styles }: { colors: AuthPalette; styles: Styles }) {
  return (
    <View style={styles.header}>
      <SmartTicketLogo colors={colors} />
      <Text style={styles.appName}>Smart Ticket</Text>
      <Text style={styles.tagline}>Tu pase a los mejores eventos</Text>
    </View>
  );
}

type AuthInputProps = React.ComponentProps<typeof TextInput> & {
  colors: AuthPalette;
  icon: React.ReactNode;
  label: string;
  styles: Styles;
};

function AuthInput({ colors, icon, label, styles, ...props }: AuthInputProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        {icon}
        <TextInput
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          style={styles.input}
          {...props}
        />
      </View>
    </View>
  );
}

function PasswordInput({ colors, label, onToggle, styles, visible, ...props }: Omit<AuthInputProps, 'icon'> & {
  onToggle: () => void;
  visible: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <LockIcon color={colors.textMuted} />
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          autoComplete="new-password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!visible}
          selectionColor={colors.primary}
          style={styles.input}
          textContentType="newPassword"
          {...props}
        />
        <Pressable
          accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          accessibilityRole="button"
          onPress={onToggle}
          style={styles.eyeButton}>
          {visible ? <EyeOffIcon color={colors.textSecondary} /> : <EyeIcon color={colors.textSecondary} />}
        </Pressable>
      </View>
    </View>
  );
}

function PrimaryButton({ colors, disabled, label, loading, onPress, styles }: {
  colors: AuthPalette;
  disabled: boolean;
  label: string;
  loading: boolean;
  onPress: () => void;
  styles: Styles;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled }}
      disabled={disabled}
      onPress={() => void onPress()}
      style={({ pressed }) => [styles.ctaShadow, pressed && styles.pressed, disabled && styles.disabled]}>
      <LinearGradient colors={[colors.primary, colors.primaryEnd]} end={{ x: 1, y: 0.5 }} start={{ x: 0, y: 0.5 }} style={styles.cta}>
        {loading ? <ActivityIndicator color={colors.onPrimary} /> : <>
          <Text style={styles.ctaText}>{label}</Text>
          <View style={styles.arrowCircle}><ArrowRightIcon color={colors.onPrimary} size={18} /></View>
        </>}
      </LinearGradient>
    </Pressable>
  );
}

function ErrorBanner({ colors, message, styles }: { colors: AuthPalette; message: string; styles: Styles }) {
  return (
    <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.errorBanner}>
      <AlertIcon color={colors.error} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

function InfoBanner({ colors, message, styles }: { colors: AuthPalette; message: string; styles: Styles }) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.infoBanner}>
      <MailIcon color={colors.success} />
      <Text style={styles.infoText}>{message}</Text>
    </View>
  );
}

function PasswordStrength({ colors, password, styles }: { colors: AuthPalette; password: string; styles: Styles }) {
  const score = (password.length >= 8 ? 1 : 0)
    + (/[A-Z]/.test(password) ? 1 : 0)
    + (/\d/.test(password) ? 1 : 0)
    + (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
  const labels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  const activeColor = score <= 1 ? colors.error : score === 2 ? colors.warning : colors.success;
  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthBars}>
        {[1, 2, 3, 4].map((value) => (
          <View key={value} style={[styles.strengthBar, { backgroundColor: value <= score ? activeColor : colors.border }]} />
        ))}
      </View>
      <Text style={[styles.strengthLabel, { color: activeColor }]}>{labels[score]}</Text>
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
    input: { flex: 1, color: colors.text, fontSize: FontSize.md, paddingVertical: Spacing.two },
    eyeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -Spacing.two },
    codeInput: { minHeight: 66, borderRadius: Radius.xl, borderWidth: 1, borderColor: colors.borderFocused, backgroundColor: colors.surfaceSolid, color: colors.text, fontSize: 28, fontWeight: FontWeight.bold, textAlign: 'center', letterSpacing: 12, paddingLeft: 12 },
    hint: { color: colors.textSecondary, fontSize: FontSize.sm, lineHeight: 18, textAlign: 'center' },
    devCode: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.lg, backgroundColor: colors.surfaceMuted },
    devCodeText: { color: colors.textSecondary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
    errorBanner: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.three, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.errorBorder, backgroundColor: colors.errorSurface },
    errorText: { flex: 1, color: colors.error, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    infoBanner: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.three, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.successBorder, backgroundColor: colors.successSurface },
    infoText: { flex: 1, color: colors.success, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    ctaShadow: { borderRadius: Radius.full, shadowColor: colors.primaryShadow, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 18, elevation: 7 },
    cta: { minHeight: 56, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full },
    ctaText: { color: colors.onPrimary, fontSize: FontSize.md, fontWeight: FontWeight.bold },
    arrowCircle: { position: 'absolute', right: Spacing.two, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full, backgroundColor: colors.primarySoft },
    pressed: { opacity: 0.82 },
    disabled: { opacity: 0.65 },
    footer: { minHeight: 44, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: Spacing.one },
    footerText: { color: colors.textSecondary, fontSize: FontSize.base },
    textButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.one },
    link: { color: colors.primary, fontSize: FontSize.base, fontWeight: FontWeight.bold },
    mutedLink: { color: colors.textMuted },
    codeActions: { flexDirection: 'row', justifyContent: 'space-between' },
    strengthContainer: { gap: Spacing.one },
    strengthBars: { flexDirection: 'row', gap: Spacing.one },
    strengthBar: { flex: 1, height: 4, borderRadius: Radius.full },
    strengthLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, textAlign: 'right' },
    successCard: { alignItems: 'center', gap: Spacing.three, padding: Spacing.four, borderRadius: Radius.xl + 8, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.successBorder, backgroundColor: colors.surface },
    successTitle: { color: colors.text, fontSize: FontSize['2xl'], fontWeight: FontWeight.heavy, textAlign: 'center' },
    successCopy: { color: colors.textSecondary, fontSize: FontSize.base, lineHeight: 21, textAlign: 'center' },
  });
}
