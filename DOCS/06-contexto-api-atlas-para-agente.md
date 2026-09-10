# Documento 06 — Contexto del Proyecto para Agente Externo: API y Conexión a MongoDB Atlas

**Proyecto:** Smart-Ticket — Sistema de Boletaje Digital, Valle del Mezquital, Hidalgo  
**Audiencia:** Agente de IA externo que asistirá con la configuración de MongoDB Atlas  
**Redactado en:** tercera persona

---

## ¿Qué es este proyecto?

Smart-Ticket es un sistema de boletaje digital para eventos regionales del Valle del Mezquital (ferias patronales, bailes, palenques, charreadas, jaripeos). Lo construye un solo desarrollador. El sistema tiene dos componentes activos:

- **`App/Smart-Ticket/`** — Aplicación móvil en Expo SDK 57 + React Native + TypeScript (Expo Router). Ya scaffoldeada y probada con Expo Go. Es la interfaz principal para compradores.
- **`API/`** — Backend REST en Node.js + Express + Mongoose. Es el **único punto de contacto con la base de datos**. La app móvil nunca se conecta directamente a MongoDB.

---

## Por qué la API es necesaria (arquitectura de tres capas)

La aplicación móvil **no puede** conectarse directamente a MongoDB Atlas porque:

1. Las librerías nativas de MongoDB dependen de módulos de Node.js (`net`, `tls`, `crypto`) que no existen en el entorno de React Native / Expo Go — el empaquetador Metro fallaría al compilar.
2. Incluir la cadena de conexión (`mongodb+srv://...`) dentro del bundle de la app móvil expondría las credenciales a cualquiera que inspeccione el APK.

La arquitectura correcta — y la que ya está implementada — es:

```
[ App (Expo Go / React Native) ]
          ↕  peticiones HTTP (fetch)
[ API — Node.js + Express en localhost:3000 o en la nube ]
          ↕  cadena de conexión mongodb+srv://
[ MongoDB Atlas ]
```

La cadena de conexión de Atlas **vive únicamente en `API/.env`** y nunca sale del servidor.

---

## Estado actual de la API (lo que ya existe)

### Estructura de archivos

```
API/
├── .env                    ← cadena de conexión Atlas (NUNCA va a git)
├── .env.example            ← plantilla pública con el formato de la URI
├── .gitignore
├── package.json
└── src/
    ├── index.js            ← servidor Express: cors, json, rutas, arranque
    ├── db.js               ← conexión Mongoose (lee MONGODB_URI del .env)
    ├── seeder.js           ← pobla Atlas con datos de prueba reales
    ├── models/
    │   ├── Evento.js       ← schema: nombre, categoría, municipio, aforo, tiposBoleto, estado
    │   ├── Organizador.js  ← schema: nombre, tipoOrganizador, municipio, contacto, planSuscripcion
    │   ├── Usuario.js      ← schema: nombre, email, teléfono
    │   ├── Boleto.js       ← schema: eventoId, usuarioId, tipoBoleto, estado, QR
    │   └── Transaccion.js  ← schema: boletoId, monto, metodoPago, estadoPago
    └── routes/
        └── eventos.js      ← GET /api/v1/eventos (filtros opcionales) + GET /api/v1/eventos/:id
```

### Dependencias instaladas

| Paquete | Versión | Rol |
|---|---|---|
| `express` | ^5.2.1 | Servidor HTTP y enrutado |
| `mongoose` | ^9.9.5 | ODM para MongoDB Atlas |
| `dotenv` | ^17.4.2 | Carga `MONGODB_URI` desde `.env` |
| `cors` | ^2.8.6 | Permite peticiones HTTP desde la app móvil |
| `nodemon` *(dev)* | ^3.1.14 | Reinicio automático en desarrollo |

### Scripts disponibles

```bash
npm run dev          # levanta el servidor con nodemon (desarrollo)
npm run start        # levanta el servidor con node (producción)
npm run seed         # pobla Atlas con datos de prueba
npm run seed:limpiar # limpia todas las colecciones de Atlas
```

---

## Cómo se usa la cadena de conexión de Atlas

### Formato esperado en `API/.env`

```env
PORT=3000
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/smart-ticket?retryWrites=true&w=majority
```

- `<usuario>` y `<password>` → el usuario de base de datos creado en Atlas (no la cuenta de Google/email de Atlas).
- `<cluster>` → el nombre del cluster que aparece en la cadena que Atlas genera automáticamente.
- `smart-ticket` → nombre de la base de datos; se crea automáticamente en Atlas al primer `connectDB()`.

### Cómo obtener la cadena en Atlas

Panel de Atlas → cluster → **Connect** → **Drivers** → Node.js → copiar la cadena SRV y reemplazar `<password>` con la contraseña real del usuario de base de datos.

### Cómo la consume el código

`API/src/db.js` hace únicamente esto:

```js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB conectado → ${process.env.MONGODB_URI}`);
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    process.exit(1); // El servidor no arranca sin base de datos
  }
};

module.exports = connectDB;
```

`index.js` llama a `connectDB()` antes de levantar el servidor HTTP. Si la conexión falla, el proceso termina — el servidor nunca expone endpoints sin base de datos.

---

## Endpoints ya implementados

| Método | Ruta | Descripción | Estado |
|---|---|---|---|
| GET | `/api/v1/health` | Healthcheck del servidor (no requiere BD) | ✅ Implementado |
| GET | `/api/v1/eventos` | Lista eventos con `estado: 'publicado'`. Query params opcionales: `categoria`, `municipio`, `fecha` | ✅ Implementado |
| GET | `/api/v1/eventos/:id` | Detalle de un evento por su `_id` de Mongo | ✅ Implementado |

### Endpoints definidos en el contrato pero aún no implementados

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/eventos` | Crea un evento en estado `borrador` |
| PUT | `/api/v1/eventos/:id` | Edita un evento |
| POST | `/api/v1/eventos/:id/publicar` | Cambia estado a `publicado` |
| POST | `/api/v1/boletos` | Compra / aparta un boleto |
| GET | `/api/v1/boletos/:id` | Detalle de boleto |
| PUT | `/api/v1/boletos/:id/estado` | Cambia estado del boleto |
| POST | `/api/v1/organizadores` | Registro de organizador |
| GET | `/api/v1/organizadores/:id` | Perfil del organizador |
| GET | `/api/v1/organizadores/:id/eventos` | Eventos de un organizador |
| POST | `/api/v1/usuarios` | Registro de comprador |
| GET | `/api/v1/usuarios/:id/boletos` | Boletos de un usuario |

---

## Datos de prueba (seeder)

El seeder (`src/seeder.js`) inserta datos reales del Valle del Mezquital directamente en Atlas una vez que la cadena de conexión esté configurada:

| Colección | Datos |
|---|---|
| `organizadores` | Comité Fiestas Patronales Ixmiquilpan · Asociación de Charros Valle del Mezquital |
| `usuarios` | Juan Hernández · María López (compradores de prueba) |
| `eventos` | 3 publicados + 1 en borrador (el borrador **no** aparece en la API) |

Eventos publicados:
1. **Feria Patronal Ixmiquilpan 2026** — 15 Oct 2026 — $150 MXN
2. **Gran Baile de Octubre (Los Yonics)** — 20 Oct 2026 — $200 MXN
3. **Campeonato Estatal de Charrería, Actopan** — 5 Nov 2026 — $80 MXN

---

## Lo que NO está implementado todavía

- **Autenticación / JWT** — marcada como pendiente. No hay login todavía.
- **Pasarela de pago** (Mercado Pago u otra) — pendiente. `POST /boletos` no cobra todavía.
- **Panel de organizador** — los endpoints del dashboard existen en el contrato pero no en el código.
- **Deploy en la nube** — la API corre solo en `localhost:3000` por ahora. El deploy (Render/Railway) viene después de que el ciclo local funcione de punta a punta.

---

## Reglas del proyecto que el agente debe respetar

1. La cadena de conexión de Atlas **nunca** va en el código — solo en `.env` (excluido por `.gitignore`).
2. Solo `API/` habla con MongoDB. La app móvil solo hace `fetch()` a los endpoints REST.
3. No implementar autenticación ni pasarela de pago hasta que se indique explícitamente.
4. Si se necesita un endpoint que no está en el contrato (`02-contrato-de-api.md`), se agrega primero al documento y luego al código.
5. El nombre de la base de datos en Atlas debe ser `smart-ticket` (ya está en la cadena de conexión).
