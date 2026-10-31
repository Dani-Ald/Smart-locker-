export type TicketStatus = 'apartado' | 'pagado' | 'usado' | 'cancelado';

export interface TicketEvent {
  id: string;
  nombre: string;
  fechaHora: string;
  ubicacion: string;
  municipio: string;
  imagen: string;
}

export interface WalletTicket {
  id: string;
  ownerId: string;
  tipoBoleto: string;
  estado: TicketStatus;
  qrPayload: string | null;
  qrGeneradoAt: string | null;
  evento: TicketEvent;
  createdAt: string;
  updatedAt: string;
  syncedAt: string;
}

export type WalletTicketApi = Omit<WalletTicket, 'ownerId' | 'syncedAt'>;
