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
  refresh: () => Promise<void>;
};

export function useWallet(ownerId: string, token: string): WalletState {
  const [tickets, setTickets] = useState<WalletTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLocal = useCallback(async () => {
    const local = await getLocalTickets(ownerId);
    setTickets(local);
    return local;
  }, [ownerId]);

  const sync = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    setError(null);
    try {
      const network = await NetInfo.fetch();
      const disconnected = network.isConnected === false || network.isInternetReachable === false;
      setOffline(disconnected);
      if (disconnected) {
        await loadLocal();
        return;
      }

      const remote = await fetchMyTickets(token);
      await replaceLocalTickets(ownerId, remote.data, remote.sincronizadoAt);
      await loadLocal();
      setOffline(false);
    } catch (err) {
      await loadLocal();
      setOffline(true);
      setError(err instanceof Error ? err.message : 'No fue posible sincronizar la wallet.');
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
    refresh: () => sync(true),
  };
}
