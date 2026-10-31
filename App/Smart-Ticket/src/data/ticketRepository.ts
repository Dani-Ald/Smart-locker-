import * as SQLite from 'expo-sqlite';

import type { WalletTicket, WalletTicketApi } from '@/types/ticket';

const databasePromise = SQLite.openDatabaseAsync('smart-ticket-wallet.db');

type TicketRow = {
  id: string;
  owner_id: string;
  tipo_boleto: string;
  estado: WalletTicket['estado'];
  qr_payload: string | null;
  qr_generado_at: string | null;
  evento_json: string;
  created_at: string;
  updated_at: string;
  synced_at: string;
};

async function database() {
  const db = await databasePromise;
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS wallet_tickets (
      id TEXT PRIMARY KEY NOT NULL,
      owner_id TEXT NOT NULL,
      tipo_boleto TEXT NOT NULL,
      estado TEXT NOT NULL,
      qr_payload TEXT,
      qr_generado_at TEXT,
      evento_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_wallet_tickets_owner ON wallet_tickets(owner_id);
  `);
  return db;
}

function fromRow(row: TicketRow): WalletTicket {
  return {
    id: row.id,
    ownerId: row.owner_id,
    tipoBoleto: row.tipo_boleto,
    estado: row.estado,
    qrPayload: row.qr_payload,
    qrGeneradoAt: row.qr_generado_at,
    evento: JSON.parse(row.evento_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    syncedAt: row.synced_at,
  };
}

export async function getLocalTickets(ownerId: string): Promise<WalletTicket[]> {
  const db = await database();
  const rows = await db.getAllAsync<TicketRow>(
    'SELECT * FROM wallet_tickets WHERE owner_id = ? ORDER BY updated_at DESC',
    ownerId,
  );
  return rows.map(fromRow);
}

export async function getLocalTicket(id: string, ownerId: string): Promise<WalletTicket | null> {
  const db = await database();
  const row = await db.getFirstAsync<TicketRow>(
    'SELECT * FROM wallet_tickets WHERE id = ? AND owner_id = ?',
    id,
    ownerId,
  );
  return row ? fromRow(row) : null;
}

export async function replaceLocalTickets(
  ownerId: string,
  tickets: WalletTicketApi[],
  syncedAt: string,
): Promise<void> {
  const db = await database();
  await db.withTransactionAsync(async () => {
    const ids = tickets.map((ticket) => ticket.id);
    for (const ticket of tickets) {
      await db.runAsync(
        `INSERT INTO wallet_tickets (
          id, owner_id, tipo_boleto, estado, qr_payload, qr_generado_at,
          evento_json, created_at, updated_at, synced_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          owner_id = excluded.owner_id,
          tipo_boleto = excluded.tipo_boleto,
          estado = excluded.estado,
          qr_payload = excluded.qr_payload,
          qr_generado_at = excluded.qr_generado_at,
          evento_json = excluded.evento_json,
          created_at = excluded.created_at,
          updated_at = excluded.updated_at,
          synced_at = excluded.synced_at`,
        ticket.id,
        ownerId,
        ticket.tipoBoleto,
        ticket.estado,
        ticket.qrPayload,
        ticket.qrGeneradoAt,
        JSON.stringify(ticket.evento),
        ticket.createdAt,
        ticket.updatedAt,
        syncedAt,
      );
    }

    if (ids.length === 0) {
      await db.runAsync('DELETE FROM wallet_tickets WHERE owner_id = ?', ownerId);
    } else {
      const placeholders = ids.map(() => '?').join(',');
      await db.runAsync(
        `DELETE FROM wallet_tickets WHERE owner_id = ? AND id NOT IN (${placeholders})`,
        ownerId,
        ...ids,
      );
    }
  });
}
