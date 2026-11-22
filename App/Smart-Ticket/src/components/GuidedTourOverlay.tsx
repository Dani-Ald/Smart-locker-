import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { getGuidedTourStep, useGuidedTour } from '@/context/GuidedTourContext';
import { FontSize, FontWeight, Radius, Spacing, WalletLayout } from '@/constants/theme';
import { useWalletTheme } from '@/hooks/use-wallet-theme';

export function GuidedTourOverlay() {
  const { visible, stepIndex, stepCount, nextStep, previousStep, skipTour } = useGuidedTour();
  const colors = useWalletTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { height } = useWindowDimensions();

  if (!visible) return null;

  const step = getGuidedTourStep(stepIndex);
  const lastStep = stepIndex === stepCount - 1;

  // Calculamos la posición de la flecha apuntando a cada una de las 4 pestañas de la Tab Bar inferior
  const arrowPositionPercent = ((stepIndex + 0.5) / Math.max(stepCount, 1)) * 100;

  return (
    <View accessibilityViewIsModal style={styles.overlay}>
      <View pointerEvents="none" style={styles.scrim} />
      <View
        style={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, Spacing.four),
            paddingBottom: Math.max(10, insets.bottom + 8) + WalletLayout.tourBottomClearance,
          },
        ]}>
        <Animated.View
          key={stepIndex}
          entering={reduceMotion ? undefined : FadeInDown.duration(260)}
          style={styles.cardFrame}>
          <GlassSurface style={styles.card}>
            <ScrollView
              style={{ maxHeight: Math.max(44, height - insets.top - insets.bottom - WalletLayout.tourBottomClearance - Spacing.six) }}
              contentContainerStyle={styles.cardContent}
              bounces={false}>
            <View style={styles.topRow}>
              <View style={[styles.iconBadge, { backgroundColor: colors.primarySoft }]}>
                <SymbolView name={step.icon} size={20} tintColor={colors.primary} />
              </View>
              <Text accessibilityLiveRegion="polite" style={[styles.counter, { color: colors.textSecondary }]}>
                {stepIndex + 1} de {stepCount}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Saltar introducción"
                hitSlop={10}
                onPress={skipTour}
                style={styles.skipButton}>
                <Text style={[styles.skipText, { color: colors.textSecondary }]}>Saltar intro</Text>
              </Pressable>
            </View>

            <View style={styles.textContainer}>
              <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
                {step.title}
              </Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {step.description}
              </Text>
            </View>

            <View style={styles.footerRow}>
              <View style={styles.progressDots} accessibilityLabel={`Paso ${stepIndex + 1} de ${stepCount}`}>
                {Array.from({ length: stepCount }, (_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      {
                        backgroundColor: index === stepIndex ? colors.primary : colors.border,
                        width: index === stepIndex ? 16 : 6,
                      },
                    ]}
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
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={lastStep ? 'Terminar recorrido' : 'Siguiente paso'}
                  onPress={nextStep}
                  style={[styles.nextButton, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.nextText, { color: colors.onPrimary }]}>
                    {lastStep ? '¡Entendido!' : 'Siguiente'}
                  </Text>
                  <SymbolView
                    name={{
                      ios: lastStep ? 'checkmark' : 'arrow.right',
                      android: lastStep ? 'check' : 'arrow_forward',
                      web: lastStep ? 'check' : 'arrow_forward',
                    }}
                    size={16}
                    tintColor={colors.onPrimary}
                  />
                </Pressable>
              </View>
            </View>
            </ScrollView>
          </GlassSurface>

          {/* Flecha Callout apuntando al tab activo */}
          <View style={[styles.arrowWrapper, { left: `${arrowPositionPercent}%` }]}>
            <View style={[styles.arrowTip, { backgroundColor: colors.surface, borderColor: colors.border }]} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 1200, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: WalletLayout.tourScrim },
  content: { width: '100%', alignItems: 'center', paddingHorizontal: Spacing.three },
  cardFrame: { width: '100%', maxWidth: WalletLayout.tabWidth, position: 'relative' },
  card: { borderRadius: Radius.glass },
  cardContent: { padding: Spacing.three, gap: Spacing.two },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  iconBadge: { width: 38, height: 38, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  counter: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  skipButton: { minHeight: 44, paddingHorizontal: Spacing.two, justifyContent: 'center', marginLeft: 'auto' },
  skipText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  textContainer: { gap: 4 },
  title: { fontSize: FontSize.xl, lineHeight: 26, fontWeight: FontWeight.heavy },
  description: { fontSize: FontSize.base, lineHeight: 21 },
  footerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.one },
  progressDots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressDot: { height: 6, borderRadius: Radius.full },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, alignItems: 'center' },
  backButton: { minHeight: 44, paddingHorizontal: Spacing.three, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full, borderWidth: 1 },
  backText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  nextButton: { minHeight: 44, paddingHorizontal: Spacing.three, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, borderRadius: Radius.full },
  nextText: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  arrowWrapper: { position: 'absolute', bottom: -10, marginLeft: -10, width: 20, height: 10, overflow: 'hidden', alignItems: 'center' },
  arrowTip: { width: 14, height: 14, transform: [{ rotate: '45deg' }], marginTop: -8, borderWidth: 1 },
});
