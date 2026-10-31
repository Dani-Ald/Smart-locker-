import { router, type Href } from 'expo-router';

/** Los enlaces externos necesitan validación además del tipado de TypeScript. */
export function esIdEvento(id: unknown): id is string {
  return typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);
}

export function destinoEvento(pathname: string): Href | null {
  const match = /^\/evento\/([^/]+)\/?$/.exec(pathname);
  return match && esIdEvento(match[1])
    ? { pathname: '/evento/[id]', params: { id: match[1] } }
    : null;
}

export function volverOIr(destino: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(destino);
}
