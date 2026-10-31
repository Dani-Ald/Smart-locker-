import { router, type Href } from 'expo-router';

/** Los enlaces externos necesitan validación además del tipado de TypeScript. */
export function esIdBoleto(id: unknown): id is string {
  return typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);
}

export function destinoBoleto(pathname: string): Href | null {
  const match = /^\/boleto\/([^/]+)\/?$/.exec(pathname);
  return match && esIdBoleto(match[1])
    ? { pathname: '/boleto/[id]', params: { id: match[1] } }
    : null;
}

export function volverOIr(destino: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(destino);
}
