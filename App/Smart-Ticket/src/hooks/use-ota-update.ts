import * as Updates from 'expo-updates';
import { useEffect } from 'react';

/**
 * Hook que busca actualizaciones OTA al montar el componente.
 * Si encuentra una, la descarga y recarga la app de inmediato.
 *
 * Solo actúa en producción (no en dev/Expo Go).
 */
export function useOtaUpdate() {
  useEffect(() => {
    if (__DEV__) return; // En desarrollo no hay updates OTA

    async function checkAndApply() {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (result.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync(); // Recarga inmediata
        }
      } catch (e) {
        // No interrumpir la app si falla la comprobación
        console.warn('[OTA] Error al verificar update:', e);
      }
    }

    checkAndApply();
  }, []);
}
