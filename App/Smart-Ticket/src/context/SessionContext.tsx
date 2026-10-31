import React, { createContext, useContext } from 'react';
import { useSession, type UseSessionReturn } from '@/hooks/use-session';

// ─── Contexto ─────────────────────────────────────────────────────────────────

const SessionContext = createContext<UseSessionReturn | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * Envuelve la app y expone el estado de sesión a cualquier descendiente.
 * Colócalo en el Root Layout, dentro de ThemeProvider.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const sessionValue = useSession();
  return (
    <SessionContext.Provider value={sessionValue}>
      {children}
    </SessionContext.Provider>
  );
}

// ─── Hook de consumo ──────────────────────────────────────────────────────────

/**
 * Expone sesión, carga, errores recuperables y acciones de persistencia.
 * Lanza error si se usa fuera de SessionProvider.
 */
export function useSessionContext(): UseSessionReturn {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSessionContext debe usarse dentro de <SessionProvider>');
  }
  return ctx;
}
