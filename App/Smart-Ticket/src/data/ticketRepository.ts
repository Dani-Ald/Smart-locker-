import * as SQLite from 'expo-sqlite';

import type { WalletTicket, WalletTicketApi } from '@/types/ticket';

const databasePromise = SQLite.openDatabaseAsync('smart-ticket-wallet.db');
let initialized: Promise<SQLite.SQLiteDatabase> | undefined;
let pending: Promise<unknown> = Promise.resolve();

// Incluye lecturas para impedir que entren en una transacción ajena.
function serialized<T>(operation: () => Promise<T>): Promise<T> {
  const result = pending.then(operation);
  pending = result.catch(() => undefined);
  return result;
}

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

function database() {
  initialized ??= initialize().catch((error: unknown) => {
    initialized = undefined;
    throw error;
  });
  return initialized;
}

async function initialize() {
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

async function readTickets(ownerId: string): Promise<WalletTicket[]> {
  const db = await database();
  const rows = await db.getAllAsync<TicketRow>(
    'SELECT * FROM wallet_tickets WHERE owner_id = ? ORDER BY updated_at DESC',
    ownerId,
  );
  return rows.map(fromRow);
}

async function readTicket(id: string, ownerId: string): Promise<WalletTicket | null> {
  const db = await database();
  const row = await db.getFirstAsync<TicketRow>(
    'SELECT * FROM wallet_tickets WHERE id = ? AND owner_id = ?',
    id,
    ownerId,
  );
  return row ? fromRow(row) : null;
}

async function replaceTickets(
  ownerId: string,
  tickets: WalletTicketApi[],
  syncedAt: string,
): Promise<void> {
  const db = await database();
  // BEGIN queda fuera del catch: si falla, no hay transacción que revertir.
  await db.execAsync('BEGIN TRANSACTION');
  try {
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
    await db.execAsync('COMMIT');
  } catch (error) {
    try {
      if (await db.isInTransactionAsync()) await db.execAsync('ROLLBACK');
    } catch {
      if (__DEV__) console.warn('[wallet] Falló la recuperación de la transacción local.');
    }
    // Conservar el primer error; un rollback secundario no debe reemplazarlo.
    throw error;
  }
}

export function getLocalTickets(ownerId: string) {
  return serialized(() => readTickets(ownerId));
}

export function getLocalTicket(id: string, ownerId: string) {
  return serialized(() => readTicket(id, ownerId));
}

export function replaceLocalTickets(ownerId: string, tickets: WalletTicketApi[], syncedAt: string) {
  return serialized(() => replaceTickets(ownerId, tickets, syncedAt));
}
