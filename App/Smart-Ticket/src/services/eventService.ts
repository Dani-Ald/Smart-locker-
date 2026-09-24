import { API_BASE_URL } from '../constants/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Evento {
  _id: string;
  nombre: string;
  categoria: string;
  municipio: string;
  fechaHora: string;       // ISO 8601
  ubicacion: string;
  descripcion: string;
  precioDesde: number;
  aforoTotal: number;
  aforoVendido: number;
  estado: 'activo' | 'cancelado' | 'agotado';
  imagen?: string;
}

export interface EventosResponse {
  data: Evento[];
  total?: number;
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

/**
 * Obtiene todos los eventos activos ordenados por fecha ASC.
 * @throws Error si falla la petición o la red.
 */
export async function getEventos(): Promise<Evento[]> {
  let respuesta: Response;

  try {
    respuesta = await fetch(`${API_BASE_URL}/eventos`, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    throw new Error('No fue posible conectar con el servidor.');
  }

  if (!respuesta.ok) {
    throw new Error(`Error al cargar eventos (${respuesta.status})`);
  }

  const data = await respuesta.json();

  // La API puede devolver array directo o { data: [...] }
  return Array.isArray(data) ? data : (data.data ?? []);
}

/**
 * Obtiene el detalle de un evento por su _id.
 * @throws Error si no se encuentra o falla la red.
 */
export async function getEventoById(id: string): Promise<Evento> {
  let respuesta: Response;

  try {
    respuesta = await fetch(`${API_BASE_URL}/eventos/${id}`, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    throw new Error('No fue posible conectar con el servidor.');
  }

  if (respuesta.status === 404) {
    throw new Error('Evento no encontrado.');
  }
  if (!respuesta.ok) {
    throw new Error(`Error al cargar el evento (${respuesta.status})`);
  }

  return await respuesta.json();
}

// ─── Crear evento ──────────────────────────────────────────────────────────────

export interface CreateEventoPayload {
  nombre: string;
  categoria: string;
  municipio: string;
  fechaHora: string;        // ISO 8601
  ubicacion: string;
  descripcion: string;
  precioDesde: number;
  aforoTotal: number;
  imagenUrl?: string;
  organizadorId?: string;   // opcional mientras no hay auth de organizador
}

/**
 * Crea un nuevo evento (estado inicial: 'borrador').
 * @throws Error con mensaje descriptivo si la petición falla.
 */
export async function createEvento(payload: CreateEventoPayload): Promise<Evento> {
  let respuesta: Response;

  try {
    respuesta = await fetch(`${API_BASE_URL}/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('No fue posible conectar con el servidor.');
  }

  if (!respuesta.ok) {
    let mensaje = `Error al crear el evento (${respuesta.status})`;
    try {
      const body = await respuesta.json();
      if (body.error) mensaje = body.error;
    } catch { /* sin body JSON */ }
    throw new Error(mensaje);
  }

  return await respuesta.json();
}

