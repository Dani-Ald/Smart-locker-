import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

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
      <Image
        accessibilityLabel="Logotipo de Smart Ticket"
        contentFit="contain"
        source={require('@/assets/images/BOT.png')}
        style={styles.image}
        transition={180}
      />
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
  image: {
    width: 80,
    height: 80,
    borderRadius: Radius.xl + 4,
  },
});
