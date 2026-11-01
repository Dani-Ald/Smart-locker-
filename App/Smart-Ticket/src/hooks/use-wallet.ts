import NetInfo from '@react-native-community/netinfo';
import { createContext, createElement, useContext, useMemo, useSyncExternalStore, type PropsWithChildren } from 'react';
import { useSessionContext } from '@/context/SessionContext';

import { getLocalTickets, replaceLocalTickets } from '@/data/ticketRepository';
import { fetchMyTickets } from '@/services/ticketService';
import type { WalletTicket } from '@/types/ticket';

export type WalletSyncStage = 'inicializando' | 'comprobando-red' | 'leyendo-cache' |
  'consultando-api' | 'guardando-cache' | 'sincronizado' | 'sin-conexion' | 'error';
export type WalletDiagnostics = {
  stage: WalletSyncStage;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  remoteTicketCount: number | null;
  localTicketCount: number;
};
type Snapshot = {
  tickets: WalletTicket[];
  loading: boolean;
  refreshing: boolean;
  offline: boolean;
  error: string | null;
  diagnostics: WalletDiagnostics;
};

function createWallet(ownerId: string, token: string) {
  let state: Snapshot = {
    tickets: [], loading: true, refreshing: false, offline: false, error: null,
    diagnostics: { stage: 'inicializando', lastAttemptAt: null, lastSuccessAt: null, remoteTicketCount: null, localTicketCount: 0 },
  };
  const listeners = new Set<() => void>();
  let unsubscribe: (() => void) | undefined;
  let flight: Promise<void> | undefined;
  let generation = 0;
  let connected: boolean | undefined;
  let rerun = false;
  const publish = (patch: Partial<Snapshot>) => {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };
  const stage = (value: WalletSyncStage) => publish({ diagnostics: { ...state.diagnostics, stage: value } });

  const sync = (): Promise<void> => {
    if (flight) return flight;
    if (!ownerId || !token || listeners.size === 0) return Promise.resolve();
    const current = generation;
    const active = () => current === generation && listeners.size > 0;
    flight = (async () => {
      publish({ refreshing: true, error: null, diagnostics: { ...state.diagnostics, lastAttemptAt: new Date().toISOString() } });
      let phase: WalletSyncStage = 'leyendo-cache';
      try {
        stage(phase);
        const local = await getLocalTickets(ownerId);
        if (!active()) return;
        publish({ tickets: local, loading: false, diagnostics: { ...state.diagnostics, localTicketCount: local.length } });
        phase = 'comprobando-red';
        stage(phase);
        const network = await NetInfo.fetch();
        if (!active()) return;
        const offline = network.isConnected === false || network.isInternetReachable === false;
        publish({ offline });
        if (offline) { stage('sin-conexion'); return; }
        phase = 'consultando-api';
        stage(phase);
        const remote = await fetchMyTickets(token);
        if (!active()) return;
        phase = 'guardando-cache';
        stage(phase);
        await replaceLocalTickets(ownerId, remote.data, remote.sincronizadoAt);
        if (!active()) return;
        const saved = await getLocalTickets(ownerId);
        if (!active()) return;
        publish({ tickets: saved, diagnostics: {
          ...state.diagnostics, stage: state.offline ? 'sin-conexion' : 'sincronizado',
          lastSuccessAt: remote.sincronizadoAt, remoteTicketCount: remote.data.length, localTicketCount: saved.length,
        } });
      } catch {
        if (!active()) return;
        // No registrar mensajes que puedan contener SQL, valores o datos de sesión.
        if (__DEV__) console.warn('[wallet] Fallo de sincronización', { etapa: phase });
        publish({ error: phase === 'leyendo-cache' || phase === 'guardando-cache'
          ? 'No pudimos actualizar el almacenamiento de boletos. Intenta nuevamente.'
          : 'No pudimos sincronizar tus boletos. Conservamos los guardados en este dispositivo.' });
        stage('error');
      } finally {
        if (active()) publish({ loading: false, refreshing: false });
      }
    })().finally(() => {
      flight = undefined;
      if (rerun) { rerun = false; void sync(); }
    });
    return flight;
  };

  return {
    snapshot: () => state,
    refresh: sync,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      if (listeners.size === 1) {
        // El listener emite el estado inicial; evita un segundo disparador al montar.
        unsubscribe = NetInfo.addEventListener((network) => {
          const online = network.isConnected !== false && network.isInternetReachable !== false;
          const changed = connected !== online;
          connected = online;
          if (!online) { publish({ offline: true }); stage('sin-conexion'); }
          if (changed) {
            if (flight) rerun = true;
            else void sync();
          }
        });
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          generation++;
          unsubscribe?.();
          unsubscribe = undefined;
          connected = undefined;
        }
      };
    },
  };
}

const WalletContext = createContext<ReturnType<typeof createWallet> | null>(null);

export function WalletProvider({ children }: PropsWithChildren) {
  const { session } = useSessionContext();
  const ownerId = session?.id ?? '';
  const token = session?.token ?? '';
  const store = useMemo(() => createWallet(ownerId, token), [ownerId, token]);
  return createElement(WalletContext.Provider, { value: store }, children);
}

// Boletos e Historial observan la misma operación y el mismo resultado.
export function useWallet() {
  const store = useContext(WalletContext);
  if (!store) throw new Error('La wallet necesita WalletProvider.');
  const state = useSyncExternalStore(store.subscribe, store.snapshot, store.snapshot);
  return { ...state, refresh: store.refresh };
}
