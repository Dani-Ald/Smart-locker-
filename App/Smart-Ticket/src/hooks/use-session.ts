import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

const KEYS = { token: 'st_token', nombre: 'st_nombre', correo: 'st_correo', id: 'st_id' } as const;

export interface SessionData {
  token: string;
  nombre: string;
  correo: string;
  id: string;
}

export interface UseSessionReturn {
  session: SessionData | null;
  isLoading: boolean;
  storageError: string | null;
  logoutError: string | null;
  retrySession: () => Promise<void>;
  saveSession: (data: SessionData) => Promise<void>;
  clearSession: () => Promise<void>;
}

async function eliminarDatos() {
  // Esperar todas las operaciones evita que un reintento compita con borrados pendientes.
  const resultados = await Promise.allSettled(
    Object.values(KEYS).map(key => SecureStore.deleteItemAsync(key)),
  );
  if (resultados.some(result => result.status === 'rejected')) {
    throw new Error('No se pudo borrar la sesión del dispositivo. Reintenta antes de cerrar la aplicación.');
  }
}

export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    leerSesion()
      .then(data => { if (activo) setSession(data); })
      .catch(() => { if (activo) setStorageError('No se pudo acceder al almacenamiento seguro. Intenta nuevamente.'); })
      .finally(() => { if (activo) setIsLoading(false); });
    return () => { activo = false; };
  }, []);

  const retrySession = useCallback(async () => {
    setIsLoading(true);
    setStorageError(null);
    try {
      setSession(await leerSesion());
    } catch {
      setSession(null);
      setStorageError('No se pudo acceder al almacenamiento seguro. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSession = useCallback(async (data: SessionData) => {
    if (![data.token, data.nombre, data.correo, data.id].every(value => typeof value === 'string' && value.trim())) {
      throw new Error('El servidor devolvió una sesión incompleta.');
    }
    if (Platform.OS !== 'web') {
      try {
        // El token se escribe al final: una escritura parcial no constituye una sesión.
        await SecureStore.deleteItemAsync(KEYS.token);
        await SecureStore.setItemAsync(KEYS.nombre, data.nombre);
        await SecureStore.setItemAsync(KEYS.correo, data.correo);
        await SecureStore.setItemAsync(KEYS.id, data.id);
        await SecureStore.setItemAsync(KEYS.token, data.token);
      } catch {
        throw new Error('No se pudo guardar la sesión en el dispositivo. Intenta iniciar sesión nuevamente.');
      }
    }
    setStorageError(null);
    setSession(data);
  }, []);

  const clearSession = useCallback(async () => {
    try {
      if (Platform.OS !== 'web') await eliminarDatos();
      setLogoutError(null);
    } catch (err) {
      setLogoutError(err instanceof Error ? err.message : 'No se pudo borrar la sesión guardada.');
      throw err;
    } finally {
      setSession(null);
    }
  }, []);

  return { session, isLoading, storageError, logoutError, retrySession, saveSession, clearSession };
}

async function leerSesion(): Promise<SessionData | null> {
  if (Platform.OS === 'web') return null;
  const [token, nombre, correo, id] = await Promise.all([
    SecureStore.getItemAsync(KEYS.token), SecureStore.getItemAsync(KEYS.nombre),
    SecureStore.getItemAsync(KEYS.correo), SecureStore.getItemAsync(KEYS.id),
  ]);
  if (token?.trim() && nombre?.trim() && correo?.trim() && id?.trim()) return { token, nombre, correo, id };
  if ([token, nombre, correo, id].some(value => value !== null)) await eliminarDatos();
  return null;
}
