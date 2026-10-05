# MEMORY.md — Smart Locker

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual

- API (Railway): `eventos` (lista/detalle/crear) y `usuarios` (registro, login, verificar/reenviar PIN) operativos.
- Verificación por correo 100% funcional vía Brevo HTTPS (commit `105ef7f`).
- App Expo SDK 57: auth, catálogo, detalle, dashboard y `create-event` funcionales; APK publicado + OTA updates activos.
- Correo verificado de remitente: `smart.ticket.contacto@gmail.com` (Brevo).
- No existe carpeta `WEB/` aunque el doc 03 la contempla.
- Sin tests automatizados ni lint en API; App tiene `expo lint` y tsc estricto.

## Decisiones (y por qué)

- MongoDB Atlas con `dbName: 'test'` forzado en `API/src/db.js` — [POR CONFIRMAR] por qué se fijó esa BD.
- Brevo REST API (HTTPS 443) en vez de SMTP — Railway bloquea puertos 25/465/587 en planes Hobby/Trial (doc 17).
- Auth propia sin JWT — [POR CONFIRMAR].
- `codigoDev` devuelto en respuestas de registro/reenvío — fallback para no bloquear pruebas cuando el correo tarda (doc 17).
- OTA updates con recarga inmediata — despliegues rápidos sin reinstalar APK (docs 11-12).
- Rate limit 50 req/15 min en registro/login — evitar 429 durante pruebas (doc 14).

## Aprendizajes y errores a evitar

- No usar SMTP saliente en Railway Hobby/Trial: timeout silencioso; fallar transparente.
- Ethereal como fallback ocultaba errores reales — eliminado en `4e452b1`.
- Variables de entorno pegadas con comillas/espacios rompen credenciales — usar `cleanVal()`.
- `DOCS/17` contiene claves reales (Brevo, Gmail, Resend) ya en git: pendiente rotar y retirarlas.

## Próximos pasos

- (ver "Forma de trabajar" en AGENTS.md: seguridad → auth real → flujo de boletos → WEB/ → tests/lint → CI)
