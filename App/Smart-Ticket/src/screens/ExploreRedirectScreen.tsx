import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassSurface, WalletBackdrop } from '@/components/ui/GlassSurface';

import { FontSize, FontWeight, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { WEB_EVENTS_URL, WEB_PUBLISH_URL } from '@/constants/web';
import { useWalletTheme } from '@/hooks/use-wallet-theme';
import { openWebPage } from '@/services/externalNavigation';

export default function ExploreRedirectScreen() {
  const colors = useWalletTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <WalletBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>DESCUBRE TU PRÓXIMA EXPERIENCIA</Text>
        <GlassSurface style={styles.heroIcon}>
          <SymbolView name={{ ios: 'safari', android: 'explore', web: 'explore' }} size={46} tintColor={colors.primary} />
        </GlassSurface>
        <Text style={[styles.heading, { color: colors.text }]}>Explora en Smart Ticket</Text>
        <Text style={[styles.copy, { color: colors.textSecondary }]}>Las compras y la publicación de eventos se realizan de forma segura en nuestra plataforma web.</Text>
        <Pressable accessibilityRole="link" accessibilityHint="Abre la cartelera en la web" onPress={() => void openWebPage(WEB_EVENTS_URL)} style={({ pressed }) => [styles.primary, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}>
          <Text style={[styles.primaryText, { color: colors.onPrimary }]}>Comprar boletos</Text>
          <SymbolView name={{ ios: 'arrow.up.right', android: 'open_in_new', web: 'open_in_new' }} size={19} tintColor={colors.onPrimary} />
        </Pressable>
        <Pressable accessibilityRole="link" accessibilityHint="Abre la publicación de eventos en la web" onPress={() => void openWebPage(WEB_PUBLISH_URL)} style={({ pressed }) => [styles.secondary, { backgroundColor: colors.glass, borderColor: colors.glassEdge, opacity: pressed ? 0.8 : 1 }]}>
          <Text style={[styles.secondaryText, { color: colors.text }]}>Publicar un evento</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 1.2, textAlign: 'center', marginBottom: Spacing.four },
  safe: { flex: 1 }, content: { flexGrow: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', padding: Spacing.four, paddingBottom: 120, gap: Spacing.three },
  heroIcon: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full }, heading: { textAlign: 'center', fontSize: FontSize['3xl'], fontWeight: FontWeight.heavy }, copy: { maxWidth: 430, textAlign: 'center', fontSize: FontSize.base, lineHeight: 22 },
  primary: { width: '100%', minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, borderRadius: Radius.full, marginTop: Spacing.two }, primaryText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  secondary: { width: '100%', minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full, borderWidth: StyleSheet.hairlineWidth }, secondaryText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
});
