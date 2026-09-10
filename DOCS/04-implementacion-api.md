# 🚀 Smart-Ticket — Plan de Implementación: `API/` (Paso 4 del Proyecto)

> **Estrategia actualizada:** Desarrollo **local primero** — MongoDB local + Express corriendo en tu máquina. Una vez que todo funcione de punta a punta, se configura el deploy en GitHub (Actions + hosting externo). Esto elimina la complejidad de credenciales en la nube mientras se itera rápido.

> **Estado actual:** Paso 1 ✅ completado — `API/` inicializada con `npm init`, dependencias instaladas, `.gitignore` configurado.

---

## 🗺️ Contexto Previo (Resumen de lo construido)

| Entregable | Estado | Ubicación |
|---|---|---|
| Scaffold `App/Smart-Ticket` | ✅ Listo, corriendo | `App/Smart-Ticket/` |
| Modelo de datos (5 colecciones) | ✅ Documentado | `DOCS/01-modelo-datos-y-arquitectura.md` |
| Contrato de API REST | ✅ Documentado | `DOCS/02-contrato-de-api.md` |
| Plan paso a paso | ✅ Documentado | `DOCS/03-resumen-y-proximos-pasos.md` |
| `API/` — inicialización Node | ✅ Completado | `API/` |
| `API/` — servidor + modelos + rutas | 🔄 **En progreso** | `API/src/` |
| `WEB/` (HTML/CSS/JS) | ❌ Sin scaffold | — |
| Deploy en GitHub | ⏳ Después del MVP local | — |

**Stack de la API (local):** Node.js + Express + Mongoose → **MongoDB local** (`localhost:27017`)  
**Stack de la API (producción):** Node.js + Express + Mongoose → MongoDB Atlas (cuando se haga el deploy)  
**Regla crítica:** La API es la ÚNICA pieza que habla con MongoDB. Ni la App ni la Web tienen credenciales de Mongo.  
**Cadena de conexión local:** `mongodb://127.0.0.1:27017/smart-ticket` ← no necesita usuario ni contraseña en local.

---

## 📦 Paso a Paso — Implementación de `API/`

### Paso 1 — Inicializar el proyecto Node ✅ COMPLETADO

```bash
mkdir API && cd API
npm init -y
npm install express mongoose dotenv cors
npm install --save-dev nodemon
```

**Resultado:**
```
API/
├── package.json   ✅  scripts dev/start, main → src/index.js
├── .gitignore     ✅  .env y node_modules excluidos
└── node_modules/  ✅  116 paquetes, 0 vulnerabilidades
```

---

### Paso 2 — Servidor + Conexión a MongoDB local 🔄 EN PROGRESO

**Archivos a crear:**

```
API/
├── .env                  ← NUNCA a git (diferente por entorno)
├── .env.example          ← SÍ va a git (plantilla sin valores reales)
└── src/
    ├── index.js          ← entry point del servidor
    └── db.js             ← conexión Mongoose
```

**`.env` (local — no sube a git):**
```env
PORT=3000
# Local:
MONGODB_URI=mongodb://127.0.0.1:27017/smart-ticket
# Producción (llenar cuando se haga deploy):
# MONGODB_URI=mongodb+srv://USUARIO:PASSWORD@cluster.mongodb.net/smart-ticket
```

**`.env.example` (sí sube a git — es la plantilla):**
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/smart-ticket
```

**`src/db.js`:**
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas conectado');
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

**`src/index.js`:**
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 API corriendo en http://localhost:${PORT}`);
  });
});
```

> **Victoria comprobable:** `GET http://localhost:3000/api/v1/health` responde `{ status: "ok" }` y la consola muestra "✅ MongoDB Atlas conectado".

---

### Paso 3 — Modelos Mongoose (del Doc 01)

```
src/
└── models/
    ├── Organizador.js
    ├── Evento.js
    ├── Boleto.js
    ├── Usuario.js
    └── Transaccion.js
```

**`src/models/Evento.js`** (el más importante para empezar):
```javascript
const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  organizadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizador', required: true },
  nombre:        { type: String, required: true },
  categoria:     { type: String, enum: ['feria_patronal','baile','palenque','charreada','jaripeo'], required: true },
  municipio:     { type: String, required: true },
  fechaHora:     { type: Date, required: true },
  ubicacion:     { type: String },
  descripcion:   { type: String },
  imagenUrl:     { type: String },
  precioDesde:   { type: Number, default: 0 },
  aforoTotal:    { type: Number, required: true },
  aforoVendido:  { type: Number, default: 0 },
  estado:        { type: String, enum: ['borrador','publicado','finalizado'], default: 'borrador' },
}, { timestamps: true });

module.exports = mongoose.model('Evento', eventoSchema);
```

---

### Paso 4 — Endpoints de `eventos` (solo lectura primero)

```
src/
└── routes/
    └── eventos.js
```

**`src/routes/eventos.js`:**
```javascript
const express = require('express');
const router = express.Router();
const Evento = require('../models/Evento');

// GET /api/v1/eventos  — lista con filtros opcionales
router.get('/', async (req, res) => {
  try {
    const { categoria, municipio, fecha } = req.query;
    const filtro = { estado: 'publicado' };
    if (categoria) filtro.categoria = categoria;
    if (municipio) filtro.municipio = municipio;
    if (fecha)     filtro.fechaHora = { $gte: new Date(fecha) };

    const eventos = await Evento.find(filtro).sort({ fechaHora: 1 });
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/eventos/:id — detalle
router.get('/:id', async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(evento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

**Registrar en `src/index.js`:**
```javascript
const eventosRouter = require('./routes/eventos');
app.use('/api/v1/eventos', eventosRouter);
```

---

### Paso 5 — Probar con Thunder Client / Postman

Antes de tocar App o WEB, verificar:

| Request | Resultado esperado |
|---|---|
| `GET /api/v1/health` | `{ status: "ok" }` |
| `GET /api/v1/eventos` | `[]` (arreglo vacío, sin error) |
| Inserta 1 evento en Atlas UI → `GET /api/v1/eventos` | El evento aparece |
| `GET /api/v1/eventos/:id` | El evento por ID |

---

### Paso 6 — Conectar WEB/ a este endpoint

Crear el scaffold básico de `WEB/` e implementar `js/api.js`:
```javascript
const API_BASE = 'http://localhost:3000/api/v1';

async function getEventos(filtros = {}) {
  const params = new URLSearchParams(filtros).toString();
  const res = await fetch(`${API_BASE}/eventos?${params}`);
  if (!res.ok) throw new Error('Error al obtener eventos');
  return res.json();
}
```

---

### Pasos 7–12 (siguientes sprints)

| Paso | Descripción |
|---|---|
| 7 | Agregar `POST /eventos`, `PUT /eventos/:id` + insertar datos de prueba locales |
| 8 | Modelo + endpoints de `boletos` con control de aforo (`aforoVendido < aforoTotal`) |
| 9 | Conectar `WEB/` con fetch real al servidor local |
| 10 | Conectar `App/Smart-Ticket` (reemplazar mocks por llamadas reales al local) |
| 11 | **Deploy en GitHub:** configurar GitHub Actions + hosting (Render/Railway) con MongoDB Atlas |
| 12 | CORS restrictivo para producción + `.env` de producción en el panel del hosting |
| — | *(futuro)* Autenticación (JWT para organizadores) |
| — | *(futuro)* Integración Mercado Pago |

---

## 🐙 Deploy con GitHub + Railway (Fase posterior al MVP local)

> Tutorial de referencia: https://youtu.be/UWRsyP7iAnU

### Lo que ya tenemos listo (pasos del tutorial ya completados)

| Paso del tutorial | Tiempo | Estado |
|---|---|---|
| Backend estructurado (`db.js`, `.env`, `index.js`) | 0:18–3:25 | ✅ Hecho |
| Repositorio en GitHub (`Smart-locker-`) | 4:00–7:00 | ✅ Hecho |

### Lo que falta (cuando el MVP local funcione)

| Paso del tutorial | Tiempo | Qué hacer |
|---|---|---|
| **Conectar GitHub a Railway** | 7:30–9:45 | Crear cuenta en railway.app → New Project → Deploy from GitHub Repo → seleccionar `Smart-locker-` |
| **Agregar MongoDB en Railway** | 9:45–11:15 | En el proyecto de Railway: Add Plugin → MongoDB → copiar la `MONGO_URL` que genera Railway y ponerla como variable de entorno del proyecto (`MONGODB_URI`) |
| **Generar dominio público** | 11:15–12:00 | En Railway: Settings → Domains → Generate Domain → obtienes tu URL pública |
| **Correr el seeder** | 12:00–14:33 | `node src/seeder.js` desde tu máquina apuntando a la BD de Railway, para poblar datos de prueba y verificar que todo funcione |

### El único cambio entre local y Railway
```env
# Local (.env):
MONGODB_URI=mongodb://127.0.0.1:27017/smart-ticket

# Railway (variable de entorno en su panel — nunca en código):
MONGODB_URI=mongodb://mongo:PASSWORD@containers-us-west-XXX.railway.app:PORT/smart-ticket
```
El código de `db.js` no cambia — solo la variable.

---

## 🔮 Mejoras Futuras (post-MVP)

1. **Autenticación JWT** — solo para el rol `organizador`. El comprador no necesita login (opera con nombre + teléfono al momento de comprar).
2. **Pasarela de pago — Mercado Pago** — integrar `POST /boletos` con el flujo de checkout de MP. Requiere su propio documento de diseño antes de tocar código.
3. **Generación de QR** — el campo `codigoVerificacion` en `boletos` está como placeholder. En una fase posterior se genera un UUID + QR para validar acceso al evento.
4. **Notificaciones push** — Expo Notifications para confirmar compra de boleto.
5. **Dashboard en tiempo real** — `GET /organizadores/:id/dashboard` con métricas de aforo y ventas usando agregaciones de MongoDB.
6. **Deploy de la API** — Render / Railway / Fly.io con variables de entorno configuradas en el panel del hosting (no en código).
7. **Rate limiting y validación estricta** — `express-rate-limit` + `joi` o `zod` para validar bodies entrantes.
8. **Tests automatizados de la API** — Jest + Supertest para probar cada endpoint de forma aislada en CI.
