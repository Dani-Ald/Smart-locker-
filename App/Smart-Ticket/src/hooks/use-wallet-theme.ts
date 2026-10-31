import { useColorScheme } from 'react-native';

import { WalletColors } from '@/constants/theme';

export function useWalletTheme() {
  return WalletColors[useColorScheme() === 'dark' ? 'dark' : 'light'];
}
