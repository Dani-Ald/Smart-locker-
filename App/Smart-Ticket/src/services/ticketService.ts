import { API_BASE_URL } from '@/constants/api';
import type { WalletTicketApi } from '@/types/ticket';

type TicketsResponse = {
  data: WalletTicketApi[];
  sincronizadoAt: string;
};

function isTicketsResponse(value: unknown): value is TicketsResponse {
  if (!value || typeof value !== 'object') return false;
  const response = value as Record<string, unknown>;
  return Array.isArray(response.data)
    && response.data.every(isWalletTicket)
    && typeof response.sincronizadoAt === 'string';
}

function isWalletTicket(value: unknown): value is WalletTicketApi {
  if (!value || typeof value !== 'object') return false;
  const ticket = value as Record<string, unknown>;
  const event = ticket.evento;
  if (!event || typeof event !== 'object') return false;
  const eventRecord = event as Record<string, unknown>;
  return ['id', 'tipoBoleto', 'createdAt', 'updatedAt'].every((key) => typeof ticket[key] === 'string')
    && ['apartado', 'pagado', 'usado', 'cancelado'].includes(String(ticket.estado))
    && (ticket.qrPayload === null || typeof ticket.qrPayload === 'string')
    && (ticket.qrGeneradoAt === null || typeof ticket.qrGeneradoAt === 'string')
    && ['id', 'nombre', 'fechaHora', 'ubicacion', 'municipio', 'imagen'].every((key) => typeof eventRecord[key] === 'string');
}

export async function fetchMyTickets(token: string): Promise<TicketsResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/boletos/mios`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
  } catch {
    throw new Error('Sin conexión. Mostrando los boletos guardados en este dispositivo.');
  }

  if (response.status === 401) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
  if (!response.ok) throw new Error('No fue posible sincronizar tus boletos.');

  const body: unknown = await response.json();
  if (!isTicketsResponse(body)) throw new Error('El servidor devolvió boletos con formato inválido.');
  return body;
}
