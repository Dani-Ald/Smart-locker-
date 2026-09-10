# Fase 2 — Documento 02: Contrato de API

**Depende de:** `01-modelo-datos-y-arquitectura.md`
**Consumido por:** `App/Smart-Ticket` (Expo/React Native) y `WEB/` (HTML/CSS/JS)
**Construido en:** `API/` (Node.js + Express + Mongoose, MongoDB Atlas)

Este documento es la referencia única de endpoints. Si `App/` o `WEB/` necesitan un dato que no está aquí, el endpoint se agrega **primero aquí**, luego en `API/`, y hasta entonces se consume desde el frontend.

Convención general: rutas bajo `/api/v1/...`, respuestas en JSON, errores con formato `{ "error": "mensaje" }` y código HTTP correspondiente.

---

## 1. Eventos

| Método | Ruta | Descripción | RF relacionado |
|---|---|---|---|
| GET | `/api/v1/eventos` | Lista eventos publicados. Query params: `categoria`, `municipio`, `fecha` | RF-01 |
| GET | `/api/v1/eventos/:id` | Detalle de un evento | RF-02, RF-03 |
| POST | `/api/v1/eventos` | Crea un evento (estado inicial `borrador`) | RF-04 |
| PUT | `/api/v1/eventos/:id` | Edita datos generales/branding/boletaje | RF-04, RF-05 |
| POST | `/api/v1/eventos/:id/publicar` | Cambia estado a `publicado` tras confirmar pago de setup fee | RF-05 |

**Body de creación (`POST /eventos`):**
```json
{
  "organizadorId": "string",
  "nombre": "string",
  "categoria": "feria_patronal | baile | palenque | charreada | jaripeo",
  "municipio": "string",
  "fechaHora": "ISO 8601",
  "ubicacion": "string",
  "descripcion": "string",
  "aforoTotal": "number",
  "tiposBoleto": [
    { "nombre": "General", "precio": 100 }
  ]
}
```

---

## 2. Boletos

| Método | Ruta | Descripción | RF relacionado |
|---|---|---|---|
| POST | `/api/v1/boletos` | Aparta/compra un boleto | RF-06, RF-07 |
| GET | `/api/v1/boletos/:id` | Detalle de un boleto (para "Mis boletos") | — |
| PUT | `/api/v1/boletos/:id/estado` | Cambia estado (`pagado`, `usado`, `cancelado`) | RF-07 |

**Body de creación (`POST /boletos`):**
```json
{
  "eventoId": "string",
  "usuarioId": "string",
  "tipoBoleto": "string",
  "metodoPago": "linea | efectivo_taquilla"
}
```
Respuesta incluye el `boleto` creado y, si `metodoPago` es `linea`, los datos necesarios para iniciar el cobro (integración de pasarela — ver sección 5, aún pendiente de definir a detalle).

---

## 3. Organizadores

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/organizadores` | Registro de organizador |
| GET | `/api/v1/organizadores/:id` | Perfil del organizador |
| GET | `/api/v1/organizadores/:id/eventos` | Eventos de ese organizador (para su panel) |
| GET | `/api/v1/organizadores/:id/dashboard` | Métricas en tiempo real: ritmo de venta, ingresos, aforo |

---

## 4. Usuarios (compradores)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/usuarios` | Registro simple (nombre, email, teléfono) |
| GET | `/api/v1/usuarios/:id/boletos` | Boletos comprados por ese usuario |

---

## 5. Pendiente de definir en un documento aparte

- **Pasarela de pago:** cómo se conecta `POST /boletos` con Mercado Pago (o la que elijas) — esto amerita su propio documento (03) cuando llegue el momento, no hay que resolverlo antes de tener las pantallas básicas de catálogo y compra funcionando con datos simulados.
- **Autenticación:** por ahora este contrato no incluye login/tokens. Defínelo cuando tengas el catálogo público funcionando — probablemente solo el organizador necesita auth real; el comprador puede operar con datos mínimos (nombre/teléfono) al momento de comprar.

---

## 6. Cómo usar esto mientras programas

- En `App/Smart-Ticket/api/` y en `WEB/js/api.js`, cada función debe llamar exactamente a una de estas rutas — si te encuentras necesitando algo que no está aquí, para y agrégalo a este documento antes de improvisar un endpoint nuevo directo en el código.
- Mientras `API/` no exista todavía, puedes simular estas respuestas con datos fijos (mocks) en el frontend, para poder avanzar en pantallas sin bloquearte esperando el backend.
