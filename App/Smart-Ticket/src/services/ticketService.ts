import { API_BASE_URL } from '@/constants/api';
import type { WalletTicketApi } from '@/types/ticket';

type TicketsResponse = {
  data: WalletTicketApi[];
  sincronizadoAt: string;
};

function getTicketsResponseIssue(value: unknown): string | null {
  if (!value || typeof value !== 'object') return 'la respuesta no es un objeto';
  const response = value as Record<string, unknown>;
  if (!Array.isArray(response.data)) return 'data no es una lista';
  if (typeof response.sincronizadoAt !== 'string') return 'sincronizadoAt no es texto';

  for (let index = 0; index < response.data.length; index += 1) {
    const issue = getWalletTicketIssue(response.data[index]);
    if (issue) return `data[${index}].${issue}`;
  }

  return null;
}

function getWalletTicketIssue(value: unknown): string | null {
  if (!value || typeof value !== 'object') return 'boleto no es un objeto';
  const ticket = value as Record<string, unknown>;
  for (const key of ['id', 'tipoBoleto', 'createdAt', 'updatedAt']) {
    if (typeof ticket[key] !== 'string') return `${key} no es texto`;
  }
  if (!['apartado', 'pagado', 'usado', 'cancelado'].includes(String(ticket.estado))) {
    return 'estado no es válido';
  }
  if (ticket.qrPayload !== null && typeof ticket.qrPayload !== 'string') {
    return 'qrPayload no es texto ni null';
  }
  if (ticket.qrGeneradoAt !== null && typeof ticket.qrGeneradoAt !== 'string') {
    return 'qrGeneradoAt no es texto ni null';
  }

  const event = ticket.evento;
  if (!event || typeof event !== 'object') return 'evento no es un objeto';
  const eventRecord = event as Record<string, unknown>;
  for (const key of ['id', 'nombre', 'fechaHora', 'ubicacion', 'municipio', 'imagen']) {
    if (typeof eventRecord[key] !== 'string') return `evento.${key} no es texto`;
  }

  return null;
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
  if (!response.ok) throw new Error(`No fue posible sincronizar tus boletos (HTTP ${response.status}).`);

  const body: unknown = await response.json();
  const issue = getTicketsResponseIssue(body);
  if (issue) throw new Error(`El servidor devolvió un formato inválido: ${issue}.`);
  return body as TicketsResponse;
}
