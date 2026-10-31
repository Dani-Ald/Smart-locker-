import type { WalletTicket, WalletTicketApi } from '@/types/ticket';

const memory = new Map<string, WalletTicket[]>();

export async function getLocalTickets(ownerId: string): Promise<WalletTicket[]> {
  return memory.get(ownerId) ?? [];
}

export async function getLocalTicket(id: string, ownerId: string): Promise<WalletTicket | null> {
  return (memory.get(ownerId) ?? []).find((ticket) => ticket.id === id) ?? null;
}

export async function replaceLocalTickets(
  ownerId: string,
  tickets: WalletTicketApi[],
  syncedAt: string,
): Promise<void> {
  memory.set(ownerId, tickets.map((ticket) => ({ ...ticket, ownerId, syncedAt })));
}
