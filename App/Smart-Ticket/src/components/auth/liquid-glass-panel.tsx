import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { Platform, StyleProp, StyleSheet, useColorScheme, View, ViewStyle } from 'react-native';

import { AuthPalette, Radius } from '@/constants/theme';

type LiquidGlassPanelProps = PropsWithChildren<{
  colors: AuthPalette;
  style?: StyleProp<ViewStyle>;
}>;

export function LiquidGlassPanel({ children, colors, style }: LiquidGlassPanelProps) {
  const supportsNativeGlass = Platform.OS === 'ios' && isGlassEffectAPIAvailable();
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  return (
    <View
      style={[
        styles.frame,
        {
          borderColor: colors.glassBorder,
          shadowColor: colors.shadow,
        },
        style,
      ]}>
      {supportsNativeGlass ? (
        <GlassView
          colorScheme={colorScheme}
          glassEffectStyle="clear"
          style={StyleSheet.absoluteFill}
          tintColor={colors.glassSurface}
        />
      ) : (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            Platform.OS === 'web' && styles.webBlur,
            {
              backgroundColor: Platform.OS === 'web'
                ? colors.glassSurface
                : colors.glassFallback,
            },
          ]}
        />
      )}
      <LinearGradient
        colors={[colors.glassHighlight, colors.glassSurface, 'rgba(255, 255, 255, 0.02)']}
        end={{ x: 0.9, y: 1 }}
        pointerEvents="none"
        start={{ x: 0.05, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={[styles.innerLight, { borderColor: colors.glassHighlight }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: Radius.xl + 12,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.18,
    shadowRadius: 38,
    elevation: 10,
  },
  innerLight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.xl + 11,
  },
  content: {
    flex: 1,
  },
  webBlur: {
    backdropFilter: 'blur(28px) saturate(145%)',
    WebkitBackdropFilter: 'blur(28px) saturate(145%)',
  } as ViewStyle,
});
