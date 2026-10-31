# Contribuir a Smart Ticket

## Flujo

1. Crea una rama `feature/...`, `fix/...` o `docs/...`.
2. Mantén los cambios pequeños y enfocados.
3. Documenta primero cualquier endpoint nuevo en `DOCS/02-contrato-de-api.md`.
4. No incluyas secretos, datos personales ni boletos reales.
5. Usa Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).

## Verificación

Para la app:

```bash
cd App/Smart-Ticket
npm run lint
npx tsc --noEmit
```

Para la API:

```bash
cd API
npm test
```

Los cambios de wallet deben probarse con red, sin red, reinicio de la app y cambio de cuenta.
