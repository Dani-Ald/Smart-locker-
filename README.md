# Smart Ticket

Plataforma open source de boletaje digital para eventos del Valle del Mezquital.

## Proyectos

- `API/`: API REST con Node.js, Express y MongoDB.
- `App/Smart-Ticket/`: wallet móvil Expo para custodiar y mostrar boletos, incluso sin conexión.
- `DOCS/`: contratos, arquitectura y bitácora técnica.

La app móvil no procesa compras ni publica eventos. Esas acciones abren la plataforma web en `https://tick-0fpg.onrender.com/index.html`.

## Funcionalidades principales

- Inicio de sesión con correo y contraseña, verificación de cuenta por código y sesiones revocables.
- Sesión local protegida con SecureStore y bloqueo biométrico opcional.
- Sincronización de boletos hacia SQLite para lectura offline.
- QR generado localmente desde un payload firmado con Ed25519.
- Brillo máximo temporal al presentar un boleto activo.
- Historial y reseñas para asistentes verificados.

## Desarrollo

Cada proyecto instala sus dependencias por separado.

```bash
cd API
npm install
cp .env.example .env
npm run dev
```

```bash
cd App/Smart-Ticket
npm install
npm start
```

Consulta `DOCS/02-contrato-de-api.md` para el contrato y `DOCS/19-wallet-offline-first.md` para arquitectura, despliegue y pruebas offline.

## Seguridad

No publiques archivos `.env`, claves Ed25519, tokens ni credenciales. Revisa [SECURITY.md](SECURITY.md) antes de reportar una vulnerabilidad.

## Contribuir

Consulta [CONTRIBUTING.md](CONTRIBUTING.md). No se realizan commits ni despliegues automáticamente desde tareas de asistencia.
