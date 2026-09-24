import { API_BASE_URL } from '../constants/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface SessionData {
  token: string;
  nombre: string;
  correo: string;
  id: string;
}

export interface LoginPayload {
  correo: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  correo: string;
  password: string;
  passwordConfirm: string;
}

// ─── Errores tipados ──────────────────────────────────────────────────────────

export class AuthError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mensajeDeError(status: number, contexto: 'login' | 'register'): string {
  if (contexto === 'login') {
    if (status === 400) return 'Completa todos los campos.';
    if (status === 401) return 'Correo o contraseña incorrectos.';
    if (status === 429) return 'Demasiados intentos. Inténtalo en unos minutos.';
  }
  if (contexto === 'register') {
    if (status === 400) return 'Revisa los campos del formulario.';
    if (status === 409) return 'Ese correo ya está registrado.';
    if (status === 429) return 'Demasiados intentos. Inténtalo en unos minutos.';
  }
  return 'Error inesperado del servidor.';
}

// ─── Servicios ────────────────────────────────────────────────────────────────

/**
 * Inicia sesión con correo y contraseña.
 * @returns SessionData con token, nombre, correo e id del usuario.
 * @throws AuthError con el código HTTP y mensaje descriptivo.
 * @throws Error genérico si no hay conexión.
 */
export async function login(payload: LoginPayload): Promise<SessionData> {
  let respuesta: Response;

  try {
    respuesta = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('No fue posible conectar con el servidor.');
  }

  if (!respuesta.ok) {
    throw new AuthError(respuesta.status, mensajeDeError(respuesta.status, 'login'));
  }

  const data = await respuesta.json();

  return {
    token: data.token,
    nombre: data.nombre ?? data.user?.nombre ?? '',
    correo: data.correo ?? data.user?.correo ?? payload.correo,
    id: data._id ?? data.user?._id ?? data.id ?? '',
  };
}

/**
 * Registra un nuevo usuario.
 * @throws AuthError con código y mensaje descriptivo.
 * @throws Error genérico si no hay conexión.
 */
export async function register(payload: RegisterPayload): Promise<void> {
  let respuesta: Response;

  try {
    respuesta = await fetch(`${API_BASE_URL}/usuarios/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('No fue posible conectar con el servidor.');
  }

  if (!respuesta.ok) {
    throw new AuthError(respuesta.status, mensajeDeError(respuesta.status, 'register'));
  }
  // 201 Created — sin retorno de datos necesario
}
