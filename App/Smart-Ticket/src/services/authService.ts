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

const AUTH_TIMEOUT_MS = 65_000;
const LOGIN_RETRY_DELAY_MS = 1_000;

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
  if (status === 404 || status === 502 || status === 503 || status === 504) {
    return 'El servicio de Smart Ticket no está disponible. Inténtalo más tarde.';
  }
  if (status >= 500) return 'El servidor no pudo completar la solicitud. Inténtalo más tarde.';
  return 'Error inesperado del servidor.';
}

async function obtenerMensajeError(
  respuesta: Response,
  contexto: 'login' | 'register',
): Promise<string> {
  if ([404, 502, 503, 504].includes(respuesta.status)) {
    return mensajeDeError(respuesta.status, contexto);
  }

  const data: unknown = await respuesta.json().catch(() => null);
  if (data && typeof data === 'object') {
    const error = (data as Record<string, unknown>).error;
    if (typeof error === 'string' && error.trim()) return error;
  }
  return mensajeDeError(respuesta.status, contexto);
}

async function fetchAuth(
  url: string,
  body: unknown,
  options: { retryOnNetworkError?: boolean; signal?: AbortSignal } = {},
): Promise<Response> {
  const attempts = options.retryOnNetworkError ? 2 : 1;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);
    const abortFromCaller = () => controller.abort();
    if (options.signal?.aborted) controller.abort();
    else options.signal?.addEventListener('abort', abortFromCaller, { once: true });

    try {
      return await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        if (options.signal?.aborted) throw new Error('Inicio de sesión cancelado.');
        throw new Error('El servicio está tardando más de lo normal. Inténtalo nuevamente.');
      }

      const shouldRetry = attempt + 1 < attempts;
      if (!shouldRetry) {
        throw new Error('No fue posible conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.');
      }

      await new Promise((resolve) => setTimeout(resolve, LOGIN_RETRY_DELAY_MS));
    } finally {
      clearTimeout(timeout);
      options.signal?.removeEventListener('abort', abortFromCaller);
    }
  }

  throw new Error('No fue posible conectar con el servidor.');
}

// ─── Servicios ────────────────────────────────────────────────────────────────

/**
 * Inicia sesión con correo y contraseña.
 * @returns SessionData con token, nombre, correo e id del usuario.
 * @throws AuthError con el código HTTP y mensaje descriptivo.
 * @throws Error genérico si no hay conexión.
 */
export async function login(payload: LoginPayload, signal?: AbortSignal): Promise<SessionData> {
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener('abort', abortFromCaller, { once: true });

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let timeoutExpired = false;
  const operation = (async () => {
    const respuesta = await fetchAuth(`${API_BASE_URL}/usuarios/login`, payload, {
      retryOnNetworkError: true,
      signal: controller.signal,
    });

    if (!respuesta.ok) {
      throw new AuthError(respuesta.status, await obtenerMensajeError(respuesta, 'login'));
    }

    const data = await respuesta.json();
    return {
      token: data.token,
      nombre: data.nombre ?? data.user?.nombre ?? '',
      correo: data.correo ?? data.user?.correo ?? payload.correo,
      id: data._id ?? data.user?._id ?? data.id ?? '',
    };
  })();

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      timeoutExpired = true;
      controller.abort();
      reject(new Error('El servicio está tardando más de lo normal. Inténtalo nuevamente.'));
    }, AUTH_TIMEOUT_MS);
  });
  let rejectWhenAborted: (() => void) | undefined;
  const cancelled = new Promise<never>((_, reject) => {
    rejectWhenAborted = () => reject(new Error('Inicio de sesión cancelado.'));
    if (controller.signal.aborted) rejectWhenAborted();
    else controller.signal.addEventListener('abort', rejectWhenAborted, { once: true });
  });

  try {
    return await Promise.race([operation, timeout, cancelled]);
  } catch (error) {
    if (timeoutExpired) {
      throw new Error('El servicio está tardando más de lo normal. Inténtalo nuevamente.');
    }
    throw error;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
    if (rejectWhenAborted) controller.signal.removeEventListener('abort', rejectWhenAborted);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}

/**
 * Registra un nuevo usuario.
 * @returns RegisterResult con el estado del correo y posibles códigos de prueba.
 * @throws AuthError con código y mensaje descriptivo.
 * @throws Error genérico si no hay conexión.
 */
export async function register(payload: RegisterPayload): Promise<RegisterResult> {
  const respuesta = await fetchAuth(`${API_BASE_URL}/usuarios/registro`, payload);

  if (!respuesta.ok) {
    throw new AuthError(respuesta.status, await obtenerMensajeError(respuesta, 'register'));
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

export async function logoutRemote(token: string): Promise<void> {
  const respuesta = await fetch(`${API_BASE_URL}/usuarios/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => { throw new Error('No fue posible revocar la sesión en el servidor.'); });
  if (!respuesta.ok && respuesta.status !== 401) throw new Error('No fue posible revocar la sesión en el servidor.');
}
