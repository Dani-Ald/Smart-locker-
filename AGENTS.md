# AGENTS.md — Smart Locker

Plataforma de boletaje digital para eventos del Valle del Mezquital. Dos proyectos independientes: `API/` (backend) y `App/Smart-Ticket/` (app móvil Expo).

## Stack y estructura

- `API/`: Node.js, Express 5, Mongoose 9, CommonJS, nodemailer + express-rate-limit, dotenv.
- `App/Smart-Ticket/`: Expo SDK 57, React Native 0.86.3, React 19.2.3, Expo Router, TypeScript estricto, react-hook-form + yup.
- `DOCS/`: bitácora numerada de sesiones. GEMINI.md dice `docs/` pero el directorio real es `DOCS/`.
- Sin workspace npm raíz; instalar dependencias dentro de cada proyecto.

## Comandos

- API: `cd API && npm run dev` (nodemon) | `npm start` | `npm run seed` | `npm run seed:limpiar`
- App: `cd App/Smart-Ticket && npm start` | `npm run android` | `npm run ios` | `npm run web`
- Lint App: `npm run lint` (expo lint). Typecheck: `npx tsc --noEmit`
- Tests: no hay (`API/package.json` test es placeholder intencional).

## Convenciones

- Código, comentarios y mensajes de API en español.
- Errores de API: `{ error: '...' }`; códigos 400/401/404/409/429/500.
- Respuestas y bitácora en español; nuevos endpoints se anotan primero en `DOCS/02-contrato-de-api.md`.

## Reglas de dominio / trampas conocidas

- `API/src/db.js` fuerza `dbName: 'test'` sin importar la URI.
- `App/Smart-Ticket/src/constants/api.ts` apunta siempre a Railway (producción); no hay override por env.
- Auth propia: token hex aleatorio no persistido en servidor; no hay middleware de auth todavía.
- Registro/reenvío devuelven `codigoDev` (PIN en claro); login no exige `isVerified`.
- Email: si existe `BREVO_API_KEY` usa API HTTPS de Brevo; si no, SMTP (`SMTP_HOST/PORT/SECURE/USER/PASS`), Gmail por defecto a puerto 465.
- App: OTA updates activos (`runtimeVersion: appVersion`, canal EAS); no forzar recargas en dev.
- `experiments.reactCompiler: true` y `typedRoutes: true` están activos en `app.json`.

## Forma de trabajar

- Plan vigente (acordado 2026-10-01):
  1. Seguridad: rotar claves expuestas en `DOCS/17`, quitarlas del doc, verificar `.gitignore`.
  2. `codigoDev` solo fuera de producción; login debe exigir `isVerified`.
  3. Auth real: persistir/validar token con middleware.
  4. Flujo de boletos: `GET /boletos` → `POST /transacciones` (control de aforo) → marcar boleto usado.
  5. Decidir destino de `WEB/` (no existe en el repo).
  6. Tests mínimos en API + lint.
  7. CI básica (install + lint + tsc).
- No hay plan de PR/release documentado [POR CONFIRMAR].
- Cambios pequeños y enfocados; no implementar pasarela de pago ni JWT real sin instrucción explícita.

## Límites

- ✅ Siempre: usar `.env` solo en `API/`; seguir el contrato `DOCS/02-contrato-de-api.md`; verificar antes de terminar.
- ⚠️ Pregunta antes: cambiar URL de API en `constants/api.ts`, correr `npm run reset-project`, alterar `eas.json`/`app.json` runtimeVersion.
- 🚫 Nunca: commitear `.env` ni credenciales de Mongo; meter credenciales de BD fuera de `API/`; implementar pagos/JWT sin pedirlo.

## Verificación

- API: `npm run dev` y `GET /api/v1/health` debe responder `{ status: 'ok' }`.
- App: `npm run lint` y `npx tsc --noEmit` sin errores.
- Sin tests automatizados; verificar flujo contra `/api/v1/eventos` y `/api/v1/usuarios`.
