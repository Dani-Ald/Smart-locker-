import { API_BASE_URL } from '@/constants/api';

const WARMUP_TIMEOUT_MS = 65_000;

let warmupPromise: Promise<boolean> | null = null;

/**
 * Despierta la API gratuita en segundo plano sin bloquear la navegación.
 * La promesa compartida evita solicitudes duplicadas durante remounts.
 */
export function precalentarApi(): Promise<boolean> {
  if (warmupPromise) return warmupPromise;

  warmupPromise = comprobarApi().finally(() => {
    warmupPromise = null;
  });

  return warmupPromise;
}

async function comprobarApi(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WARMUP_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    // El calentamiento es una optimización: el login mostrará el error real.
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
