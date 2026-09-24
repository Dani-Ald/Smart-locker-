import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';

// ─── Claves de almacenamiento ─────────────────────────────────────────────────

const KEYS = {
  token: 'st_token',
  nombre: 'st_nombre',
  correo: 'st_correo',
  id: 'st_id',
} as const;

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface SessionData {
  token: string;
  nombre: string;
  correo: string;
  id: string;
}

export interface UseSessionReturn {
  /** Datos de la sesión activa, o null si no hay sesión */
  session: SessionData | null;
  /** true mientras se lee SecureStore al arrancar */
  isLoading: boolean;
  /** Guarda todos los datos de sesión en SecureStore */
  saveSession: (data: SessionData) => Promise<void>;
  /** Elimina todos los datos de sesión */
  clearSession: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Leer sesión guardada al arrancar la app
  useEffect(() => {
    (async () => {
      try {
        const [token, nombre, correo, id] = await Promise.all([
          SecureStore.getItemAsync(KEYS.token),
          SecureStore.getItemAsync(KEYS.nombre),
          SecureStore.getItemAsync(KEYS.correo),
          SecureStore.getItemAsync(KEYS.id),
        ]);

        if (token && nombre && correo && id) {
          setSession({ token, nombre, correo, id });
        }
      } catch {
        // Si SecureStore falla (ej: web), simplemente no hay sesión
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const saveSession = useCallback(async (data: SessionData) => {
    try {
      await Promise.all([
        SecureStore.setItemAsync(KEYS.token, data.token),
        SecureStore.setItemAsync(KEYS.nombre, data.nombre),
        SecureStore.setItemAsync(KEYS.correo, data.correo),
        SecureStore.setItemAsync(KEYS.id, data.id),
      ]);
      setSession(data);
    } catch {
      // En web, SecureStore no está disponible — guardar en memoria
      setSession(data);
    }
  }, []);

  const clearSession = useCallback(async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(KEYS.token),
        SecureStore.deleteItemAsync(KEYS.nombre),
        SecureStore.deleteItemAsync(KEYS.correo),
        SecureStore.deleteItemAsync(KEYS.id),
      ]);
    } catch {
      // En web, ignorar errores de SecureStore
    } finally {
      setSession(null);
    }
  }, []);

  return { session, isLoading, saveSession, clearSession };
}
