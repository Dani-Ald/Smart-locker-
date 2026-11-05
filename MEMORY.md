# MEMORY.md — Smart Locker

Memoria breve entre sesiones. No incluir secretos ni datos personales.

## Estado actual

- Rama `feature/premium-liquid-glass` está en origin; `main` sigue pendiente de merge tras validación.
- APK Android `preview` anterior está documentado en DOCS/22.
- Build Android `preview` del boleto holográfico iniciado en esta sesión: EAS indicó `IN_QUEUE`; no hay enlace de APK todavía.
- App Expo SDK 57; OTA activo con `runtimeVersion: appVersion`.
- API en Render; `API/src/db.js` fuerza `dbName: 'test'`.
- Wallet offline-first con SQLite serializado; sincronización single-flight entre Boletos e Historial.
- Última sesión: [DOCS/24-build-preview-boleto-holografico.md](DOCS/24-build-preview-boleto-holografico.md).

## Decisiones importantes

- Perfil EAS `preview` para APK interno y revisión; no se pidió publicación de tienda ni push.
- Boleto holográfico usa SVG; se omite `#bump` en nativo por falta de soporte de ruido/iluminación.
- Enfoque Liquid Glass: efecto nativo iOS, fallback translúcido en Android y `backdropFilter` en web.
- Estado de sincronización solo se declara tras persistir y releer la caché.
- Timeout de auth de 65 s; solo login reintenta por ser idempotente.

## Errores a evitar

- No imprimir variables de entorno ni cadenas de conexión en logs; no guardar claves, tokens, PIN ni datos personales en Git/DOCS/memoria.
- No usar `withTransactionAsync` en la wallet: sus transacciones pueden solaparse; usar la cola SQLite serializada existente.
- No reintentar automáticamente registro ni asumir que push implica deploy.
- SDK 57: leer documentación versionada antes de modificar Expo; no mutar shared values durante render/callbacks (usar APIs compatibles con React Compiler).
- No ampliar assets del icono sin medir el área segura de la máscara.

## Seguridad pendiente

- Rotar variables sensibles expuestas históricamente y actualizar Render.
- Regenerar QR de prueba después de la rotación y retirar valores sensibles de DOCS/17.

## Próximos pasos

1. Consultar el build EAS `preview` pendiente; compartir `artifacts.buildUrl` si finaliza correctamente o revisar logs si falla.
2. Instalar el APK y validar visualmente wallet, ticket holográfico, QR escaneable, brillo, temas y movimiento reducido.
3. Tras validación: merge de `feature/premium-liquid-glass` a `main` y push, solo con autorización.
4. Rotar credenciales y verificar el despliegue limpio de logs.
5. Añadir tests mínimos de API y CI para lint, TypeScript y pruebas existentes.
