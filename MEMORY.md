# MEMORY.md — Smart Locker

Memoria breve del proyecto entre sesiones. No incluir secretos ni datos personales.

## Estado actual

- `main` y `origin/main` están en `462ef5f`; solo este cierre documental queda sin commit.
- API desplegada en Render desde `API/`; fuerza `dbName: 'test'`.
- App Expo SDK 57 publicada como APK `preview`; OTA activo con `runtimeVersion: appVersion`.
- Login usa correo y contraseña; PIN de seis dígitos solo verifica cuentas nuevas.
- Sesiones opacas persistidas y hasheadas; middleware protege boletos y reseñas.
- Wallet offline-first: `GET /api/v1/boletos/mios` → caché SQLite separada por usuario.
- QR firmado con Ed25519; la clave privada solo debe existir en variables protegidas del servidor.
- Compras y publicación abren la plataforma web; no hay pagos dentro de la app.
- Panel temporal de diagnóstico visible debajo de la wallet.
- Última sesión: [DOCS/20-wallet-render-y-diagnostico.md](DOCS/20-wallet-render-y-diagnostico.md).

## Decisiones importantes

- Render sustituyó al proveedor anterior porque el servicio dejó de estar disponible.
- Timeout de auth de 65 s + precalentamiento; solo login tiene un reintento por ser idempotente.
- La app conserva boletos offline; revocación/uso requieren sincronización posterior.
- Eventos pasados y boletos cancelados no aparecen como próximo acceso.
- Registro y navegación mantienen `Stack.Protected`, rutas tipadas y SecureStore.
- Liquid Glass usa efecto nativo cuando está disponible y fallback translúcido en otras plataformas.

## Errores a evitar

- Nunca imprimir variables de entorno ni cadenas de conexión en logs; `API/src/db.js` ya fue corregido.
- Nunca compartir capturas con valores sensibles visibles.
- No guardar claves, tokens, PIN, conexiones ni datos personales en Git, DOCS o memoria.
- No reintentar automáticamente registro: podría duplicar una operación cuyo resultado se perdió.
- No asumir que push implica deploy: comprobar commit `Live` y Auto-Deploy en Render.
- Render gratuito puede tardar cerca de un minuto en despertar.
- SDK 57: consultar documentación versionada antes de modificar Expo Router.
- React Compiler/lint: evitar mutar shared values directamente en callbacks; usar `.set()`.

## Seguridad pendiente

- Rotar variables sensibles expuestas durante el diagnóstico y actualizar Render.
- Regenerar QR de prueba tras rotar Ed25519.
- Retirar secretos históricos de `DOCS/17` después de rotarlos.

## Próximos pasos

1. Rotar credenciales, actualizar Render y verificar un despliegue sin valores sensibles en logs.
2. Instalar el APK de diagnóstico, sincronizar el boleto asignado y revisar el panel temporal.
3. Validar modo avión, cambio de cuenta, QR y restauración de brillo en dispositivo real.
4. Corregir la causa observada y retirar el diagnóstico temporal.
5. Añadir más tests de API y CI básica para tests, lint y TypeScript.
