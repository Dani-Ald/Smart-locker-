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

export interface VerifyCodePayload {
  correo: string;
  codigo: string;
}

export interface ResendCodePayload {
  correo: string;
}

export interface RegisterResult {
  message: string;
  userId?: string;
  correo: string;
  emailEnviado?: boolean;
  emailError?: boolean;
  emailErrorMessage?: string;
  codigoDev?: string;
}

export interface ResendCodeResult {
  message: string;
  emailEnviado?: boolean;
  emailError?: boolean;
  emailErrorMessage?: string;
  codigoDev?: string;
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
 * @returns RegisterResult con el estado del correo y posibles códigos de prueba.
 * @throws AuthError con código y mensaje descriptivo.
 * @throws Error genérico si no hay conexión.
 */
export async function register(payload: RegisterPayload): Promise<RegisterResult> {
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

  const data = await respuesta.json();
  return data;
}

/**
 * Verifica el código de 6 dígitos introducido por el usuario.
 */
export async function verificarCodigo(payload: VerifyCodePayload): Promise<void> {
  let respuesta: Response;

  try {
    respuesta = await fetch(`${API_BASE_URL}/usuarios/verificar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('No fue posible conectar con el servidor.');
  }

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}));
    const msj = errorData.error || 'Código incorrecto o expirado.';
    throw new AuthError(respuesta.status, msj);
  }
}

/**
 * Reenvía un nuevo código de 6 dígitos al correo del usuario.
 */
export async function reenviarCodigo(payload: ResendCodePayload): Promise<ResendCodeResult> {
  let respuesta: Response;

  try {
    respuesta = await fetch(`${API_BASE_URL}/usuarios/reenviar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('No fue posible conectar con el servidor.');
  }

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}));
    const msj = errorData.error || 'Error al reenviar el código.';
    throw new AuthError(respuesta.status, msj);
  }

  const data = await respuesta.json();
  return data;
}
