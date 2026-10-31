import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Rect, Stop } from 'react-native-svg';

import { AuthPalette, Radius } from '@/constants/theme';

type SmartTicketLogoProps = {
  colors: AuthPalette;
};

export function SmartTicketLogo({ colors }: SmartTicketLogoProps) {
  return (
    <View
      accessible
      accessibilityLabel="Logotipo de Smart Ticket"
      style={[
        styles.base,
        {
          backgroundColor: colors.surfaceSolid,
          shadowColor: colors.shadow,
        },
      ]}>
      <LinearGradient
        colors={[colors.logoHighlight, colors.logoShade]}
        start={{ x: 0.18, y: 0.08 }}
        end={{ x: 0.82, y: 0.92 }}
        style={styles.pearl}>
        <Svg width={60} height={60} viewBox="0 0 60 60" accessibilityElementsHidden>
          <Defs>
            <SvgGradient id="brandBlue" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.primary} />
              <Stop offset="1" stopColor={colors.primaryEnd} />
            </SvgGradient>
          </Defs>
          <Rect x="13" y="20" width="25" height="7" rx="3.5" fill="url(#brandBlue)" transform="rotate(-18 25.5 23.5)" />
          <Rect x="22" y="33" width="25" height="7" rx="3.5" fill="url(#brandBlue)" transform="rotate(-18 34.5 36.5)" />
        </Svg>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 88,
    height: 88,
    borderRadius: Radius.xl + 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 7,
  },
  pearl: {
    width: 68,
    height: 68,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
