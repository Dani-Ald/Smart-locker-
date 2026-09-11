import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const BRAND_BLUE = '#208AEF';
const BRAND_BLUE_DARK = '#1A6EC4';

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoChip, { backgroundColor: BRAND_BLUE }]}>
            <ThemedText style={styles.logoText}>ST</ThemedText>
          </View>
          <View>
            <ThemedText type="small" themeColor="textSecondary">Bienvenido a</ThemedText>
            <ThemedText type="subtitle" style={styles.brandName}>Smart Ticket</ThemedText>
          </View>
        </View>

        {/* Status card */}
        <View style={[styles.statusCard, { backgroundColor: BRAND_BLUE }]}>
          <ThemedText style={styles.statusLabel}>Estado del sistema</ThemedText>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <ThemedText style={styles.statusText}>Locker en línea y listo</ThemedText>
          </View>
          <ThemedText style={styles.statusSub}>Última actualización: hace 2 min</ThemedText>
        </View>

        {/* Quick actions */}
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
          ACCIONES RÁPIDAS
        </ThemedText>

        <View style={styles.actionsGrid}>
          <ActionCard
            emoji="🎟️"
            label="Mis Tickets"
            bg={theme.backgroundElement}
          />
          <ActionCard
            emoji="🔓"
            label="Abrir Locker"
            bg={theme.backgroundElement}
          />
          <ActionCard
            emoji="📋"
            label="Historial"
            bg={theme.backgroundElement}
          />
          <ActionCard
            emoji="⚙️"
            label="Ajustes"
            bg={theme.backgroundElement}
          />
        </View>

        {/* Update badge — prueba visible de EAS Update */}
        <View style={[styles.updateBadge, { borderColor: BRAND_BLUE }]}>
          <ThemedText style={[styles.updateText, { color: BRAND_BLUE }]}>
            ✨ Actualizado vía EAS Update
          </ThemedText>
        </View>

      </SafeAreaView>
    </ThemedView>
  );
}

function ActionCard({ emoji, label, bg }: { emoji: string; label: string; bg: string }) {
  return (
    <TouchableOpacity style={[styles.actionCard, { backgroundColor: bg }]} activeOpacity={0.7}>
      <ThemedText style={styles.actionEmoji}>{emoji}</ThemedText>
      <ThemedText type="small" style={styles.actionLabel}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
  logoChip: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 18,
  },
  brandName: {
    lineHeight: 36,
  },
  statusCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  statusLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4AE54A',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  statusSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: Spacing.one,
  },
  sectionTitle: {
    letterSpacing: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: Spacing.three,
    padding: Spacing.three,
    alignItems: 'center',
    gap: Spacing.one,
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionLabel: {
    textAlign: 'center',
  },
  updateBadge: {
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
  },
  updateText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
