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
