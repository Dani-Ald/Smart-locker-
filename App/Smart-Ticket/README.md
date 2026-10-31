# Smart Ticket Wallet

Aplicación Expo SDK 57 para custodiar y presentar boletos digitales de Smart Ticket.

## Requisitos

- Node.js 22.13 o posterior.
- Android 7+ o iOS 16.4+.
- Development build para probar Face ID; Expo Go no lo soporta.

## Inicio

```bash
npm install
npm start
```

La URL de API permanece centralizada en `src/constants/api.ts`. Las compras y publicación de eventos abren la web configurada en `src/constants/web.ts`.

## Arquitectura

- `src/app/`: rutas Expo Router y protección centralizada.
- `src/screens/`: pantallas Wallet, Historial, Explorar, Perfil y detalle de boleto.
- `src/data/`: repositorio SQLite con implementación segura para web.
- `src/services/`: API, navegación externa y biometría.
- `src/hooks/use-wallet.ts`: lectura local inmediata y sincronización al recuperar red.

El QR se renderiza localmente desde `qrPayload`. La app no contiene la clave privada Ed25519.

## Validación

```bash
npm run lint
npx tsc --noEmit
npx expo export --platform web
```

La matriz de pruebas en modo avión está en `../../DOCS/19-wallet-offline-first.md`.
