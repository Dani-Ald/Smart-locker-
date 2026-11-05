import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassSurface, WalletBackdrop } from '@/components/ui/GlassSurface';

import { FontSize, FontWeight, MaxContentWidth, Spacing } from '@/constants/theme';
import { WEB_EVENTS_URL, WEB_PUBLISH_URL } from '@/constants/web';
import { useWalletTheme } from '@/hooks/use-wallet-theme';
import { openWebPage } from '@/services/externalNavigation';

export default function ExploreRedirectScreen() {
  const colors = useWalletTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <WalletBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cardFrame}>
          <LinearGradient
            colors={['#00D2FF', '#9D50BB', '#FC0987', '#00D2FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.laserBorder}>
            <GlassSurface style={[styles.card, { borderColor: colors.glassEdge }]}>
              <View pointerEvents="none" style={styles.gridOverlay} />
              <View style={styles.header}>
                <Text style={[styles.systemTag, { color: colors.primary }]}>SMART TICKET / CARTELERA</Text>
                <View style={styles.titleRow}>
                  <Text style={[styles.heading, { color: colors.text }]}>Vive tu próxima</Text>
                  <Text style={[styles.headingEmphasis, { color: colors.text }]}>experiencia.</Text>
                </View>
                <Text style={[styles.copy, { color: colors.textSecondary }]}>Descubre eventos y compra tus boletos de forma segura desde nuestra plataforma.</Text>
              </View>

              <View style={styles.metrics}>
                <Metric icon="ticket" label="BOLETOS" value="Compra segura" color={colors.primary} textColor={colors.text} muted={colors.textSecondary} />
                <Metric icon="checkmark.seal" label="ACCESO" value="Digital" color={colors.primary} textColor={colors.text} muted={colors.textSecondary} />
              </View>

              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="link"
                  accessibilityHint="Abre la cartelera de eventos en la web"
                  onPress={() => void openWebPage(WEB_EVENTS_URL)}
                  style={({ pressed }) => [styles.primaryWrap, pressed && styles.pressed]}>
                  <LinearGradient colors={[colors.primary, colors.primaryEnd]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.primary}>
                    <Text style={styles.primaryText}>Explorar eventos</Text>
                    <SymbolView name={{ ios: 'arrow.up.right', android: 'open_in_new', web: 'open_in_new' }} size={19} tintColor="#FFFFFF" />
                  </LinearGradient>
                </Pressable>
                <Pressable
                  accessibilityRole="link"
                  accessibilityHint="Abre la página para publicar eventos"
                  onPress={() => void openWebPage(WEB_PUBLISH_URL)}
                  style={({ pressed }) => [styles.secondary, { backgroundColor: colors.glass, borderColor: colors.glassEdge }, pressed && styles.pressed]}>
                  <Text style={[styles.secondaryText, { color: colors.text }]}>Publicar un evento</Text>
                </Pressable>
              </View>
            </GlassSurface>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ icon, label, value, color, textColor, muted }: {
  icon: 'ticket' | 'checkmark.seal';
  label: string;
  value: string;
  color: string;
  textColor: string;
  muted: string;
}) {
  return (
    <View style={[styles.metric, { borderLeftColor: color }]}>
      <SymbolView name={{ ios: icon, android: icon === 'ticket' ? 'confirmation_number' : 'verified', web: icon === 'ticket' ? 'confirmation_number' : 'verified' }} size={17} tintColor={color} />
      <Text style={[styles.metricLabel, { color: muted }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: textColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', justifyContent: 'center', padding: Spacing.four, paddingBottom: 120 },
  cardFrame: { width: '100%', maxWidth: 430, alignSelf: 'center', borderRadius: 32, shadowColor: '#18243A', shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.16, shadowRadius: 36, elevation: 9 },
  laserBorder: { padding: 1.5, borderRadius: 32 },
  card: { minHeight: 460, justifyContent: 'space-between', overflow: 'hidden', padding: Spacing.five, borderRadius: 30, borderWidth: StyleSheet.hairlineWidth },
  gridOverlay: { ...StyleSheet.absoluteFill, opacity: 0.1, borderRadius: 30, borderWidth: 1, borderColor: '#94A3B8' },
  header: { gap: Spacing.two },
  systemTag: { marginBottom: Spacing.two, fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 2.2 },
  titleRow: { gap: 2 },
  heading: { fontSize: FontSize['3xl'], fontWeight: FontWeight.regular, letterSpacing: -0.8, lineHeight: 40 },
  headingEmphasis: { fontSize: FontSize['3xl'], fontWeight: FontWeight.heavy, letterSpacing: -0.8, lineHeight: 40 },
  copy: { maxWidth: 360, marginTop: Spacing.two, fontSize: FontSize.base, lineHeight: 24 },
  metrics: { flexDirection: 'row', gap: Spacing.four, marginTop: Spacing.five, marginBottom: Spacing.four },
  metric: { flex: 1, minHeight: 72, justifyContent: 'center', gap: 4, paddingLeft: Spacing.three, borderLeftWidth: 2 },
  metricLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 1.2 },
  metricValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  actions: { gap: Spacing.three, marginTop: Spacing.three },
  primaryWrap: { borderRadius: 16, shadowColor: '#69007F', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 5 },
  primary: { width: '100%', minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingHorizontal: Spacing.four, borderRadius: 16 },
  primaryText: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: FontWeight.bold, letterSpacing: 0.3 },
  secondary: { width: '100%', minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  secondaryText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
});
