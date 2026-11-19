import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { getGuidedTourStep, useGuidedTour } from '@/context/GuidedTourContext';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useWalletTheme } from '@/hooks/use-wallet-theme';

export function GuidedTourOverlay() {
  const { visible, stepIndex, stepCount, nextStep, previousStep, skipTour } = useGuidedTour();
  const colors = useWalletTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  if (!visible) return null;

  const step = getGuidedTourStep(stepIndex);
  const lastStep = stepIndex === stepCount - 1;

  return (
    <View accessibilityViewIsModal style={styles.overlay}>
      <View pointerEvents="none" style={styles.scrim} />
      <View style={[styles.content, { paddingTop: Math.max(insets.top, Spacing.four), paddingBottom: Math.max(insets.bottom, Spacing.four) }]}>
        <Animated.View
          key={stepIndex}
          entering={reduceMotion ? undefined : FadeInDown.duration(240)}
          style={styles.cardFrame}>
          <GlassSurface style={styles.card}>
            <View style={styles.topRow}>
              <View style={[styles.iconBadge, { backgroundColor: colors.primarySoft }]}>
                <SymbolView name={step.icon} size={23} tintColor={colors.primary} />
              </View>
              <Text accessibilityLiveRegion="polite" style={[styles.counter, { color: colors.textSecondary }]}>
                {stepIndex + 1} de {stepCount}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Saltar introducción"
                hitSlop={8}
                onPress={skipTour}
                style={styles.skipButton}>
                <Text style={[styles.skipText, { color: colors.textSecondary }]}>Saltar intro</Text>
              </Pressable>
            </View>

            <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{step.title}</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{step.description}</Text>

            <View style={styles.progressRow} accessibilityLabel={`Paso ${stepIndex + 1} de ${stepCount}`}>
              {Array.from({ length: stepCount }, (_, index) => (
                <View
                  key={index}
                  style={[styles.progressDot, { backgroundColor: index === stepIndex ? colors.primary : colors.border }]}
                />
              ))}
            </View>

            <View style={styles.actions}>
              {stepIndex > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Paso anterior"
                  onPress={previousStep}
                  style={[styles.backButton, { borderColor: colors.border }]}>
                  <Text style={[styles.backText, { color: colors.text }]}>Atrás</Text>
                </Pressable>
              ) : <View style={styles.backPlaceholder} />}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={lastStep ? 'Terminar recorrido' : 'Siguiente paso'}
                onPress={nextStep}
                style={[styles.nextButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.nextText, { color: colors.onPrimary }]}>{lastStep ? '¡Empezar!' : 'Siguiente'}</Text>
                <SymbolView
                  name={{ ios: lastStep ? 'checkmark' : 'arrow.right', android: lastStep ? 'check' : 'arrow_forward', web: lastStep ? 'check' : 'arrow_forward' }}
                  size={18}
                  tintColor={colors.onPrimary}
                />
              </Pressable>
            </View>
          </GlassSurface>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 1200, justifyContent: 'center' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5, 12, 25, 0.68)' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.four },
  cardFrame: { width: '100%', maxWidth: 430 },
  card: { padding: Spacing.four, borderRadius: Radius.xl + 8, gap: Spacing.three },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  iconBadge: { width: 46, height: 46, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  counter: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  skipButton: { minWidth: 92, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  skipText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  title: { fontSize: FontSize['2xl'], lineHeight: 31, fontWeight: FontWeight.heavy },
  description: { fontSize: FontSize.base, lineHeight: 23 },
  progressRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.one },
  progressDot: { width: 8, height: 8, borderRadius: Radius.full },
  actions: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  backPlaceholder: { minHeight: 48, flex: 1 },
  backButton: { minHeight: 48, minWidth: 96, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.three, borderRadius: Radius.full, borderWidth: 1 },
  backText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  nextButton: { minHeight: 48, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, borderRadius: Radius.full },
  nextText: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
});
