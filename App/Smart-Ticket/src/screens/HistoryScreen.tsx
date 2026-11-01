import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassSurface, WalletBackdrop } from '@/components/ui/GlassSurface';

import { FontSize, FontWeight, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useSessionContext } from '@/context/SessionContext';
import { useCurrentTime } from '@/hooks/use-current-time';
import { useWallet } from '@/hooks/use-wallet';
import { useWalletTheme } from '@/hooks/use-wallet-theme';
import { saveReview } from '@/services/reviewService';
import type { WalletTicket } from '@/types/ticket';

export default function HistoryScreen() {
  const colors = useWalletTheme();
  const { session } = useSessionContext();
  const wallet = useWallet();
  const now = useCurrentTime();
  const history = wallet.tickets
    .filter((ticket) => new Date(ticket.evento.fechaHora).getTime() < now || ['usado', 'cancelado'].includes(ticket.estado))
    .sort((a, b) => new Date(b.evento.fechaHora).getTime() - new Date(a.evento.fechaHora).getTime());

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <WalletBackdrop />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>TUS EXPERIENCIAS</Text>
          <Text style={[styles.heading, { color: colors.text }]}>Historial</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Eventos concluidos y reseñas verificadas.</Text>
        </View>

        {wallet.loading && history.length === 0 ? <ActivityIndicator color={colors.primary} /> : null}
        {wallet.error ? <Pressable accessibilityRole="button" onPress={() => void wallet.refresh()} style={styles.reviewToggle}>
          <Text style={{ color: colors.warning }}>{wallet.error} Reintentar.</Text>
        </Pressable> : null}
        {!wallet.loading && !wallet.error && history.length === 0 ? (
          <GlassSurface style={styles.empty}>
            <SymbolView name={{ ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }} size={40} tintColor={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Aún no hay eventos pasados</Text>
            <Text style={[styles.emptyCopy, { color: colors.textSecondary }]}>Tus accesos concluidos aparecerán aquí automáticamente.</Text>
          </GlassSurface>
        ) : null}
        {history.map((ticket) => <HistoryCard key={ticket.id} ticket={ticket} token={session?.token ?? ''} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

function HistoryCard({ ticket, token }: { ticket: WalletTicket; token: string }) {
  const colors = useWalletTheme();
  const canReview = ticket.estado === 'usado';
  const [expanded, setExpanded] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    if (rating < 1 || saving) return;
    setSaving(true);
    setMessage(null);
    try {
      await saveReview(token, ticket.evento.id, rating, comment);
      setMessage('Reseña guardada. Gracias por compartir tu experiencia.');
      setExpanded(false);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'No fue posible guardar la reseña.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardCopy}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{ticket.evento.nombre}</Text>
          <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
            {new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(ticket.evento.fechaHora))}
          </Text>
        </View>
        <View style={[styles.usedBadge, { backgroundColor: canReview ? colors.successSoft : colors.surfaceMuted }]}>
          <Text style={[styles.usedText, { color: canReview ? colors.success : colors.textSecondary }]}>
            {canReview ? 'Asistencia confirmada' : ticket.estado}
          </Text>
        </View>
      </View>

      {canReview ? (
        <Pressable accessibilityRole="button" onPress={() => setExpanded((value) => !value)} style={[styles.reviewToggle, { backgroundColor: colors.primarySoft }]}>
          <SymbolView name={{ ios: 'star', android: 'star', web: 'star' }} size={19} tintColor={colors.primary} />
          <Text style={[styles.reviewToggleText, { color: colors.primary }]}>Calificar evento</Text>
        </Pressable>
      ) : null}

      {expanded ? (
        <View style={styles.form}>
          <View accessibilityRole="radiogroup" style={styles.stars}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                accessibilityLabel={`${value} estrellas`}
                accessibilityRole="radio"
                accessibilityState={{ checked: rating === value }}
                onPress={() => setRating(value)}
                style={styles.starButton}>
                <SymbolView
                  name={{ ios: value <= rating ? 'star.fill' : 'star', android: 'star', web: 'star' }}
                  size={30}
                  tintColor={value <= rating ? colors.warning : colors.textSecondary}
                />
              </Pressable>
            ))}
          </View>
          <TextInput
            accessibilityLabel="Comentario de la reseña"
            multiline
            maxLength={1000}
            onChangeText={setComment}
            placeholder="Cuéntanos cómo fue tu experiencia (opcional)"
            placeholderTextColor={colors.textSecondary}
            style={[styles.comment, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}
            value={comment}
          />
          <Pressable
            accessibilityState={{ disabled: rating === 0 || saving }}
            disabled={rating === 0 || saving}
            onPress={() => void submit()}
            style={[styles.submit, { backgroundColor: colors.primary }, (rating === 0 || saving) && styles.disabled]}>
            {saving ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={[styles.submitText, { color: colors.onPrimary }]}>Enviar reseña</Text>}
          </Pressable>
        </View>
      ) : null}
      {message ? <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.four, paddingBottom: 120, gap: Spacing.three },
  eyebrow: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, letterSpacing: 1.1 }, heading: { fontSize: FontSize['4xl'], fontWeight: FontWeight.heavy }, subtitle: { marginTop: Spacing.one, fontSize: FontSize.base },
  empty: { alignItems: 'center', gap: Spacing.two, padding: Spacing.four, borderRadius: Radius.xl, borderWidth: StyleSheet.hairlineWidth }, emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold }, emptyCopy: { textAlign: 'center', fontSize: FontSize.base },
  card: { padding: Spacing.three, gap: Spacing.three, borderRadius: Radius.xl, borderWidth: StyleSheet.hairlineWidth }, cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two }, cardCopy: { flex: 1, gap: Spacing.one }, cardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold }, cardDate: { fontSize: FontSize.sm },
  usedBadge: { maxWidth: 130, borderRadius: Radius.full, paddingHorizontal: Spacing.two, paddingVertical: Spacing.one }, usedText: { textAlign: 'center', fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textTransform: 'capitalize' },
  reviewToggle: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, borderRadius: Radius.full }, reviewToggleText: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  form: { gap: Spacing.three }, stars: { flexDirection: 'row', justifyContent: 'center' }, starButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  comment: { minHeight: 100, padding: Spacing.three, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, textAlignVertical: 'top', fontSize: FontSize.base },
  submit: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full }, submitText: { fontSize: FontSize.base, fontWeight: FontWeight.bold }, disabled: { opacity: 0.5 }, message: { fontSize: FontSize.sm },
});
