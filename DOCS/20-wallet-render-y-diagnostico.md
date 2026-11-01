# Sesión 20 — Wallet, Render y diagnóstico (2026-10-31)

## Objetivo

Publicar el flujo offline-first de boletos, restablecer la autenticación móvil, migrar la API desde el servicio vencido hacia Render y diagnosticar por qué un boleto asociado externamente no aparecía en la wallet.

## Qué se hizo

- Se restauró el login con correo y contraseña; el código de seis dígitos quedó reservado para verificar cuentas nuevas.
- Se rediseñaron login y registro, se corrigió la proporción del icono BOT y se añadió el estilo Liquid Glass con fallbacks por plataforma.
- La app pasó a consumir la API personal desplegada en Render y se añadió tolerancia a su arranque en frío mediante precalentamiento, timeout ampliado y un reintento seguro del login.
- Se completó la wallet offline con caché SQLite, sesiones opacas validadas por middleware y QR firmado con Ed25519.
- Se fusionó `feature/offline-ticket-wallet` en `main`, se publicó la rama y se desplegaron las rutas nuevas en Render.
- Se añadió un panel temporal en “Mis boletos” que explica errores HTTP, formato inválido, conectividad, caché y boletos ocultos por estado o fecha.
- Se eliminó de los logs de la API la impresión de la variable `MONGODB_URI`.

## Archivos modificados

Antes de crear esta bitácora, el árbol estaba limpio. Los cambios de la sesión quedaron incluidos principalmente en:

- `API/.env.example`, `API/package.json`, `API/package-lock.json`.
- `API/src/db.js`, `API/src/index.js`, `API/src/middleware/auth.js`.
- `API/src/models/Boleto.js`, `API/src/models/Sesion.js`, `API/src/models/Resena.js`.
- `API/src/routes/usuarios.js`, `API/src/routes/boletos.js`, `API/src/routes/resenas.js`.
- `API/src/services/sessionService.js`, `API/src/services/qrService.js`, `API/test/qrService.test.js`.
- `App/Smart-Ticket/app.json`, `App/Smart-Ticket/package.json`, `App/Smart-Ticket/package-lock.json`.
- `App/Smart-Ticket/src/app/(auth)/login.tsx`, `App/Smart-Ticket/src/app/(auth)/register.tsx`, `App/Smart-Ticket/src/app/_layout.tsx`.
- `App/Smart-Ticket/src/components/auth/`, `App/Smart-Ticket/src/components/tickets/`, `App/Smart-Ticket/src/components/security/`.
- `App/Smart-Ticket/src/constants/api.ts`, `App/Smart-Ticket/src/constants/theme.ts`.
- `App/Smart-Ticket/src/data/ticketRepository.ts`, `App/Smart-Ticket/src/hooks/use-wallet.ts`.
- `App/Smart-Ticket/src/screens/WalletScreen.tsx`, `App/Smart-Ticket/src/screens/TicketDetailScreen.tsx`.
- `App/Smart-Ticket/src/services/authService.ts`, `App/Smart-Ticket/src/services/apiWarmupService.ts`, `App/Smart-Ticket/src/services/ticketService.ts`.
- `App/Smart-Ticket/src/types/ticket.ts`, `DOCS/02-contrato-de-api.md`, `DOCS/19-wallet-offline-first.md`, `CHANGELOG.md`, `README.md` y `MEMORY.md`.

## Decisiones (y por qué)

- Usar Render personal para la API: la prueba gratuita del proveedor anterior terminó y el dominio dejó de servir la aplicación.
- Mantener contraseña para login y PIN solo para verificación: separa autenticación recurrente de la confirmación inicial del correo.
- Persistir tokens opacos hasheados en lugar de introducir JWT: permite revocar sesiones sin ampliar el alcance acordado.
- Tratar la app como wallet y abrir compras/publicación en la web: evita implementar pagos dentro de la app en esta fase.
- Firmar el contenido QR con Ed25519 y guardar boletos en SQLite: aporta autenticidad y disponibilidad sin conexión.
- Reintentar automáticamente solo el login: es idempotente; reintentar registro podría duplicar operaciones.
- Mantener el panel de diagnóstico como temporal: sirve para identificar el fallo real sin exponer tokens, IDs completos ni datos personales.

## Problemas y soluciones

- La API antigua devolvía `404 Application not found`: se desplegó `API/` en Render y se actualizó la URL móvil.
- El plan gratuito puede tardar cerca de un minuto en despertar: se añadió healthcheck en segundo plano, timeout de 65 segundos y feedback de espera.
- Render seguía ejecutando un commit anterior: se realizó un despliegue manual del commit vigente de `main`.
- Las rutas de boletos devolvían 404 antes del despliegue: tras actualizar Render, la clave pública respondió correctamente y la ruta autenticada rechazó solicitudes sin sesión con 401.
- El launcher recortaba el icono: se generaron recursos con margen seguro para icono estándar y adaptativo.
- La API imprimía la cadena de conexión en logs: se eliminó el valor y se conservó solo un mensaje de conexión exitosa.
- La wallet no explicaba por qué no mostraba un boleto: se añadieron etapas y conteos de diagnóstico, validación por campo y reintento manual.

## Pendientes

- Rotar todas las credenciales que fueron visibles durante el diagnóstico y actualizar únicamente las variables protegidas de Render.
- Invalidar y regenerar los QR de prueba después de rotar el par Ed25519.
- Instalar el último APK y comprobar manualmente que el boleto asignado aparece y funciona sin conexión.
- Capturar el resultado del panel temporal; corregir la causa indicada y retirar el panel cuando termine el diagnóstico.
- Confirmar que Auto-Deploy de Render queda habilitado para `main`.
- Resolver la advertencia futura de EAS sobre `cli.appVersionSource` [POR CONFIRMAR].
- Retirar secretos históricos de `DOCS/17` después de rotarlos.

## Próximo paso

Rotar primero las credenciales expuestas, actualizar las variables de Render, desplegar nuevamente la API e instalar el APK de diagnóstico para sincronizar “Mis boletos” y registrar el resultado del panel temporal.

## Verificación

- `npm test` en `API/`: 1 prueba de firma Ed25519 aprobada.
- `npm run lint` en la app: sin errores.
- `npx tsc --noEmit`: sin errores.
- Exportación Expo para Android, iOS y web: correcta.
- Healthcheck público de Render: respondió `{ status: 'ok' }`.
- Rutas de boletos: clave pública disponible; `/boletos/mios` sin token respondió 401.
- Despliegue manual de Render: commit vigente publicado correctamente.
- Compilaciones Android `preview`: completadas correctamente en EAS.
- Prueba manual del boleto en dispositivo y modo avión: [POR CONFIRMAR].
