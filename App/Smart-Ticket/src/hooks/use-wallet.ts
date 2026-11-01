import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useState } from 'react';

import { getLocalTickets, replaceLocalTickets } from '@/data/ticketRepository';
import { fetchMyTickets } from '@/services/ticketService';
import type { WalletTicket } from '@/types/ticket';

type WalletState = {
  tickets: WalletTicket[];
  loading: boolean;
  refreshing: boolean;
  offline: boolean;
  error: string | null;
  diagnostics: WalletDiagnostics;
  refresh: () => Promise<void>;
};

export type WalletSyncStage =
  | 'inicializando'
  | 'comprobando-red'
  | 'leyendo-cache'
  | 'consultando-api'
  | 'guardando-cache'
  | 'sincronizado'
  | 'sin-conexion'
  | 'error';

export type WalletDiagnostics = {
  stage: WalletSyncStage;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  remoteTicketCount: number | null;
  localTicketCount: number;
};

export function useWallet(ownerId: string, token: string): WalletState {
  const [tickets, setTickets] = useState<WalletTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<WalletDiagnostics>({
    stage: 'inicializando',
    lastAttemptAt: null,
    lastSuccessAt: null,
    remoteTicketCount: null,
    localTicketCount: 0,
  });

  const loadLocal = useCallback(async () => {
    setDiagnostics((current) => ({ ...current, stage: 'leyendo-cache' }));
    const local = await getLocalTickets(ownerId);
    setTickets(local);
    setDiagnostics((current) => ({ ...current, localTicketCount: local.length }));
    return local;
  }, [ownerId]);

  const sync = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    setError(null);
    setDiagnostics((current) => ({
      ...current,
      stage: 'comprobando-red',
      lastAttemptAt: new Date().toISOString(),
    }));
    try {
      const network = await NetInfo.fetch();
      const disconnected = network.isConnected === false || network.isInternetReachable === false;
      setOffline(disconnected);
      if (disconnected) {
        await loadLocal();
        setDiagnostics((current) => ({ ...current, stage: 'sin-conexion' }));
        return;
      }

      setDiagnostics((current) => ({ ...current, stage: 'consultando-api' }));
      const remote = await fetchMyTickets(token);
      setDiagnostics((current) => ({
        ...current,
        stage: 'guardando-cache',
        remoteTicketCount: remote.data.length,
      }));
      await replaceLocalTickets(ownerId, remote.data, remote.sincronizadoAt);
      await loadLocal();
      setOffline(false);
      setDiagnostics((current) => ({
        ...current,
        stage: 'sincronizado',
        lastSuccessAt: remote.sincronizadoAt,
      }));
    } catch (err) {
      await loadLocal();
      setOffline(true);
      setError(err instanceof Error ? err.message : 'No fue posible sincronizar la wallet.');
      setDiagnostics((current) => ({ ...current, stage: 'error' }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadLocal, ownerId, token]);

  useEffect(() => {
    void NetInfo.fetch().then(() => void sync());
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) void sync();
      else setOffline(true);
    });
    return unsubscribe;
  }, [loadLocal, sync]);

  return {
    tickets,
    loading,
    refreshing,
    offline,
    error,
    diagnostics,
    refresh: () => sync(true),
  };
}
