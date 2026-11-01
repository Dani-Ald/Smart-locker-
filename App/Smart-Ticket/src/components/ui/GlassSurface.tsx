import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View, useColorScheme, type StyleProp, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';
import { useWalletTheme } from '@/hooks/use-wallet-theme';

/** Superficie contenida: una capa de material y un borde de luz, sin animación. */
export function GlassSurface({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const colors = useWalletTheme();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return (
    <View style={[styles.frame, { backgroundColor: colors.glass, borderColor: colors.glassEdge, shadowColor: colors.shadow }, style]}>
      {Platform.OS === 'ios' && isGlassEffectAPIAvailable() ? (
        <GlassView pointerEvents="none" colorScheme={scheme} glassEffectStyle="regular" style={StyleSheet.absoluteFill} />
      ) : null}
      <LinearGradient
        pointerEvents="none"
        colors={[colors.glassLight, colors.cyan, colors.violet, colors.pink]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

export function WalletBackdrop() {
  const colors = useWalletTheme();
  return <LinearGradient pointerEvents="none" colors={[colors.background, colors.violet, colors.background]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.8 }} style={StyleSheet.absoluteFill} />;
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: Radius.glass, borderWidth: 1, overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 3,
    ...Platform.select({ web: { backdropFilter: 'blur(20px)' } }),
  },
});
