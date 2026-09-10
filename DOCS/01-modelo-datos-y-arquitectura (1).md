# Fase 2 — Documento 01: Modelo de Datos Compartido y Arquitectura de `App/` y `WEB/`

**Proyecto:** Sistema de Boletaje Digital — Valle del Mezquital, Hidalgo (app "Smart-Ticket")
**Alcance de este documento:** contrato de datos entre equipos (base compartida) + decisiones técnicas de **dos frontends independientes que tú desarrollas**:
- `App/Smart-Ticket/` — app móvil nativa (Expo + React Native, probada con Expo Go).
- `WEB/` — página web independiente (HTML5 + CSS + JS plano, según lo definido en tu Fase 1), que se conecta al mismo backend/API que la app móvil.

Ambos frontends comparten la misma base de datos (MongoDB Atlas) a través de una API común — nunca hablan directo entre sí ni directo a Mongo desde el cliente.
**Estado:** borrador para validar con el equipo antes de escribir código.

---

## 1. Por qué este documento va primero

La base de datos (MongoDB Atlas) es compartida entre tu carpeta `web` y el resto del proyecto. Si el modelo de datos no se acuerda antes de escribir pantallas, cualquier cambio de esquema rompe el trabajo de otra persona. Este documento es el que se comparte con el equipo para validar nombres de campos, tipos y relaciones antes de tocar código.

---

## 2. Entidades y relaciones

```
Usuario (comprador) ──┐
                       ├──< Boleto >── pertenece a ──> Evento ──> pertenece a ──> Organizador
Organizador ───────────┘
                       Boleto ──< Transaccion (pago)
```

- Un **Organizador** publica muchos **Eventos**.
- Un **Evento** tiene muchos **Boletos** disponibles (control de aforo).
- Un **Usuario** compra/aparta uno o varios **Boletos**.
- Cada **Boleto** pagado en línea genera una **Transaccion** (registro de cobro, útil para el desglose de comisiones del modelo de negocio de la Fase 1).

---

## 3. Esquema de colecciones (MongoDB Atlas)

### 3.1 `organizadores`
| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `nombre` | string | Comité, patronato o asociación |
| `tipoOrganizador` | enum: `comite_feria`, `asociacion_charros`, `promotor_independiente` | Para reportes y segmentación |
| `municipio` | string | Uno de los ~28 del Valle del Mezquital |
| `contacto` | { `email`, `telefono` } | |
| `cuentaBancaria` | { `clabe`, `banco` } | Placeholder — se llena cuando se integre la pasarela |
| `planSuscripcion` | enum: `ninguno`, `temporada` | Ver modelo de negocio Fase 1 §5.1 |
| `createdAt` / `updatedAt` | Date | |

### 3.2 `eventos`
| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `organizadorId` | ObjectId (ref `organizadores`) | |
| `nombre` | string | |
| `categoria` | enum: `feria_patronal`, `baile`, `palenque`, `charreada`, `jaripeo` | RF-01 |
| `municipio` | string | RF-01 |
| `fechaHora` | Date | |
| `ubicacion` | string | Texto libre (recinto/dirección) |
| `descripcion` | string | |
| `imagenUrl` | string | RF-02 / RF-03 |
| `precioDesde` | number | Para la tarjeta de evento (RF-03) |
| `aforoTotal` | number | Límite declarado ante Protección Civil |
| `aforoVendido` | number | Se incrementa con cada boleto confirmado (RF-07) |
| `estado` | enum: `borrador`, `publicado`, `finalizado` | Controla el pago de publicación (setup fee) |
| `createdAt` / `updatedAt` | Date | |

### 3.3 `boletos`
| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `eventoId` | ObjectId (ref `eventos`) | |
| `usuarioId` | ObjectId (ref `usuarios`) | Nulo si aún no se identifica al comprador |
| `tipoBoleto` | string | Ej. General, VIP, Preventa |
| `precio` | number | |
| `metodoPago` | enum: `linea`, `efectivo_taquilla` | Fase 1 §2.1 — pago mixto |
| `estado` | enum: `apartado`, `pagado`, `usado`, `cancelado` | |
| `codigoVerificacion` | string | Placeholder para el QR/código único (RF-08, fase posterior) |
| `createdAt` / `updatedAt` | Date | |

### 3.4 `usuarios`
| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `nombre` | string | |
| `email` | string | |
| `telefono` | string | |
| `createdAt` | Date | |

> Nota legal: estos tres campos son datos personales según la LFPDPPP citada en tu Fase 1 §9.2 — deben tratarse con los controles de acceso ahí descritos.

### 3.5 `transacciones`
| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `boletoId` | ObjectId (ref `boletos`) | |
| `montoBoleto` | number | |
| `comision` | number | Calculada según el modelo escalonado (Fase 1 §5.1) |
| `montoOrganizador` | number | `montoBoleto - comision` |
| `estadoPago` | enum: `pendiente`, `confirmado`, `fallido` | |
| `fecha` | Date | |

---

## 4. Arquitectura técnica de `App/Smart-Ticket` (app móvil — Expo/React Native)

### 4.1 Stack
- **Expo SDK 54** ("For learning with Expo Go"), TypeScript, **Expo Router** para navegación basada en archivos.
- **Estilos:** NativeWind (Tailwind para RN).
- **Estado:** Zustand o Context API simple.
- **Capa de datos:** carpeta `api/` con funciones tipadas por entidad (`getEventos`, `crearEvento`, etc.) que llaman a la API compartida — nunca al SDK de Mongo directamente.
- **Testing:** Jest + React Native Testing Library.

### 4.2 Estructura de carpetas

```
App/Smart-Ticket/
├── app/                       # rutas (Expo Router)
│   ├── (comprador)/
│   │   ├── index.tsx          # catálogo / buscador (RF-01, RF-02, RF-03)
│   │   └── evento/[id].tsx    # detalle de evento + compra
│   ├── (organizador)/
│   │   ├── publicar.tsx       # formulario de publicación (RF-04, RF-05)
│   │   └── panel.tsx          # dashboard de ventas/aforo
│   └── _layout.tsx
├── components/
├── features/
│   ├── eventos/
│   ├── boletos/
│   └── organizadores/
├── api/                        # llamadas tipadas a la API compartida
├── types/                      # interfaces TS que reflejan este documento
└── tests/
```

---

## 4-B. Arquitectura técnica de `WEB/` (página web — HTML/CSS/JS plano)

### 4-B.1 Stack
- **HTML5 + CSS3 + JavaScript plano** (o Bootstrap 5 para el layout), sin framework de build — consistente con lo definido en tu Fase 1.
- **Conexión a datos:** `fetch()` contra la misma API compartida que consume la app móvil (mismos endpoints, mismo formato de respuesta) — así ambos frontends quedan sincronizados con un solo backend.
- **Sin acceso directo a MongoDB Atlas desde el navegador** — el JS del sitio nunca lleva credenciales de base de datos; todo pasa por la API.
- **Testing:** Playwright o Cypress para pruebas end-to-end del flujo de compra en el sitio.

### 4-B.2 Estructura de carpetas

```
WEB/
├── index.html                 # catálogo de eventos (RF-01, RF-02, RF-03)
├── evento.html                 # detalle de evento + compra
├── organizador/
│   ├── publicar.html           # RF-04, RF-05
│   └── panel.html               # dashboard
├── css/
├── js/
│   ├── api.js                  # funciones fetch a la API compartida
│   └── ...
└── tests/
```

### 4-B.3 El punto crítico a resolver antes de escribir código en cualquiera de las dos carpetas

Como **App** y **WEB** son proyectos independientes que consumen la misma API, la API misma (Node/Express u otra) debe existir y estar acordada antes de que cualquiera de los dos frontends empiece a "adivinar" endpoints. Ver la pregunta abierta en la sección 6.

---

## 5. Próximos documentos (en orden)

1. **Definición de la API compartida** — contrato de endpoints (rutas, métodos, payloads) que consumirán tanto `App/` como `WEB/`. Esto va antes que cualquier pantalla, porque ambos frontends dependen de él.
2. **Mapa de pantallas** — una tabla RF → pantalla (móvil y/o web) → componentes, usando el modelo de datos y la API como base.
3. **Design system** — paleta, tipografía y componentes, pensado para reusarse en ambos frontends aunque las implementaciones sean distintas (RN vs HTML).
4. **Scaffold final de `App/Smart-Ticket`** — completar dependencias y carpetas ya con `types/` generado a partir de este documento.
5. **Scaffold de `WEB/`** — estructura base de archivos HTML/CSS/JS.

---

## 6. Preguntas abiertas para validar con el equipo

- ¿Quién construye la API/backend (Node/Express, o funciones serverless) que consumirán **ambos** frontends? Este es el bloqueante principal — sin esto, `App/` y `WEB/` no pueden avanzar más allá del maquetado estático.
- ¿El campo `codigoVerificacion` de `boletos` se resuelve ahora (simulado) o se deja como placeholder hasta la fase de wallet/QR?
- ¿La pasarela de pago (Mercado Pago) la integra el equipo de backend, o corre por tu lado en alguno de los dos frontends?
- ¿`App/` y `WEB/` deben verse/sentirse como el mismo producto (mismo logo, colores, tono) o son experiencias independientes? Esto define si el design system (punto 3 arriba) es uno solo o dos.
