import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const key = (userId: string) => `st_biometric_${userId}`;

export async function isBiometricEnabled(userId: string) {
  if (Platform.OS === 'web') return false;
  return (await SecureStore.getItemAsync(key(userId))) === 'true';
}

export async function setBiometricEnabled(userId: string, enabled: boolean) {
  if (Platform.OS === 'web') return;
  if (enabled) await SecureStore.setItemAsync(key(userId), 'true');
  else await SecureStore.deleteItemAsync(key(userId));
}

export async function canUseBiometrics() {
  if (Platform.OS === 'web') return false;
  const [hardware, enrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);
  return hardware && enrolled;
}

export async function authenticateWithBiometrics() {
  if (Platform.OS === 'web') return true;
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Desbloquear Smart Ticket',
    promptSubtitle: 'Protege los boletos guardados en tu wallet',
    cancelLabel: 'Cancelar',
    biometricsSecurityLevel: 'strong',
  });
  return result.success;
}
