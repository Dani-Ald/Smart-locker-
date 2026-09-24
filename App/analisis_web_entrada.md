# 📋 Análisis Funcional — Web App "Entrada"
> Documento de referencia para la migración a React Native

---

## 🗂 Resumen general

**Entrada** es una plataforma de venta y publicación de boletos para eventos en vivo (conciertos, teatro, deportes, gastronomía, comedia). Tiene dos roles principales:

| Rol | Qué hace |
|---|---|
| **Comprador** | Busca, filtra y compra boletos de eventos |
| **Organizador** | Publica nuevos eventos con precio e inventario |

Stack actual: **Node.js + Express** (backend), **MongoDB + Mongoose** (base de datos), **HTML/CSS/JS vanilla** (frontend), **Bootstrap 5** (UI).

---

## 📄 Páginas / Pantallas

### 1. `index.html` — Landing Page pública

La pantalla principal. No requiere sesión.

**Secciones:**
- **Hero / Carrusel** — Slides con imágenes y CTA "Ver boletos" (5 slides: Música, Deportes, Teatro, Festivales, etc.)
- **Sección Comprador** — Grid dinámico de eventos con buscador y filtro por categoría
- **Sección Organizador** — CTA para publicar evento (abre modal)
- **Cómo funciona** — Pasos: Explora → Elige boletos → Disfruta
- **Quiénes somos** — Misión, Transparencia, Pasión por eventos
- **Footer / Contacto** — Info de contacto, redes sociales, mini-mapa Leaflet con ruta a oficinas

**Lógica JS:**
- Al cargar → llama `GET /api/events` → renderiza tarjetas dinámicamente
- Buscador en tiempo real por texto (nombre) y selector de categoría
- Modal para crear evento (`POST /api/events`)

---

### 2. `login.html` — Inicio de sesión

**Campos:**
- `correo` (email)
- `password` (con toggle mostrar/ocultar)

**Flujo:**
1. Valida que los campos no estén vacíos (validación nativa HTML5)
2. `POST /api/users/login` con `{ correo, password }`
3. Si respuesta `200` → guarda en `localStorage`:
   - `entrada_token`
   - `entrada_nombre`
   - `entrada_correo`
   - `entrada_id`
4. Redirige a `dashboard.html` tras 800 ms

**Casos de error manejados:**
| Código HTTP | Mensaje mostrado |
|---|---|
| `400` | "Completa todos los campos" |
| `401` | "Correo o contraseña incorrectos" |
| `429` | "Demasiados intentos. Inténtalo en unos minutos" |
| Error de red | "No fue posible conectar con el servidor" |

**Guard:** Si ya hay `entrada_token` en localStorage → redirige directo al dashboard.

---

### 3. `registro.html` — Registro de nuevo usuario

**Campos:**
- `nombre`
- `correo`
- `password` (mínimo 8 caracteres)
- `passwordConfirm` (confirmación de contraseña)

**Flujo:**
1. Validación client-side: campos requeridos, contraseñas coinciden, longitud mínima 8 chars
2. `POST /api/users/register` con `{ nombre, correo, password, passwordConfirm }`
3. Si `201` → muestra mensaje de éxito, resetea el formulario

**Casos de error:**
| Código HTTP | Mensaje mostrado |
|---|---|
| `400` | "Revisa los campos del formulario" |
| `409` | "Ese correo ya está registrado" |
| Error de red | "No fue posible conectar con el servidor" |

---

### 4. `dashboard.html` — Panel del usuario autenticado

Requiere sesión activa. Si no hay token → redirige a `login.html`.

**Secciones:**
- **Navbar** con nombre, email e inicial del usuario en avatar circular
- **Botón "Cerrar sesión"** → limpia todo el `localStorage` y va a `index.html`
- **Hero de bienvenida** con nombre del usuario (`¡Hola, [nombre]!`)
- **Stats bar** con 3 métricas calculadas en cliente:
  - Total de eventos disponibles
  - Eventos en los próximos 30 días
  - Cantidad de categorías distintas
- **Catálogo de eventos** — Grid cargado desde `GET /api/events`, con skeleton loaders mientras carga
- Cada tarjeta muestra: imagen, categoría, nombre, fecha/hora, ubicación, descripción, precio, botón "Comprar"

---

## 🔌 API REST (Backend Express)

### Autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/users/register` | Registrar nuevo usuario |
| `POST` | `/api/users/login` | Iniciar sesión |

### Eventos

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/events` | Listar todos los eventos (ordenados por fecha ASC) |
| `POST` | `/api/events` | Crear un nuevo evento |

### Utilidades

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/seed` | Poblar la BD con eventos de prueba (si está vacía) |

---

## 🗄 Modelos de datos (MongoDB)

### `User`
```js
{
  nombre: String,       // requerido
  correo: String,       // requerido, único, lowercase
  password: String,     // requerido, min 8 chars, HASHEADO (scrypt)
  createdAt: Date,      // automático
  updatedAt: Date       // automático
}
```
> La contraseña usa **crypto.scrypt** con salt aleatorio. Se almacena como `salt:hash`.

### `Event`
```js
{
  nombre: String,           // requerido
  categoria: String,        // requerido (Música/Comedia/Deportes/Teatro/Gastronomía)
  fechaHora: Date,          // requerido
  ubicacion: String,        // requerido
  descripcion: String,      // requerido
  precioBoleto: Number,     // requerido, min 0
  cantidadBoletos: Number,  // requerido, min 0
  imagen: String,           // opcional (URL)
  createdAt: Date,          // automático
  updatedAt: Date           // automático
}
```

### `Contact`
```js
{
  nombre: String,   // requerido
  email: String,    // requerido
  asunto: String,   // requerido
  mensaje: String,  // requerido
  estado: String,   // 'nuevo' | 'leido' | 'respondido' (default: 'nuevo')
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Sesión / Autenticación

La web usa **localStorage** como almacén de sesión:

| Clave | Valor |
|---|---|
| `entrada_token` | Token aleatorio (32 bytes hex) generado en el servidor |
| `entrada_nombre` | Nombre del usuario |
| `entrada_correo` | Correo del usuario |
| `entrada_id` | `_id` de MongoDB del usuario |

> ⚠️ El token **no es JWT**, es un hex random stateless. El servidor no lo valida en endpoints protegidos actualmente (sprint en desarrollo). Los endpoints de eventos son públicos.

**Rate limiting:**
- Login: máximo **5 intentos** por 15 minutos → HTTP 429
- Registro: máximo **8 intentos** por 15 minutos → HTTP 429

---

## 🎨 Categorías de eventos

Las categorías están fijas (hardcoded en frontend y aceptadas en backend):
1. Música
2. Comedia
3. Deportes
4. Teatro
5. Gastronomía

---

## 🗺 Funciones especiales

- **Mini-mapa Leaflet** en el footer con ruta desde un punto de origen hasta las oficinas (carga `ruta.geojson`)
- **Skeleton loaders** en el dashboard mientras cargan los eventos
- **Búsqueda + filtro** de eventos en la landing (texto libre + categoría)
- **Formato de precio MXN** (`Intl.NumberFormat`) con soporte para "Gratis" si precio = 0
- **Formato de fecha** en español mexicano con día, mes, año y hora

---

## 📱 Equivalencias para React Native

| Web | React Native |
|---|---|
| `localStorage` | `AsyncStorage` o `SecureStore` (Expo) |
| `fetch()` | `fetch()` o `axios` (igual) |
| `window.location.replace()` | `navigation.replace()` (React Navigation) |
| Modal de crear evento | `Modal` de RN o pantalla separada con stack navigator |
| Carrusel hero | `FlatList` horizontal o librería `react-native-snap-carousel` |
| Grid de eventos | `FlatList` con `numColumns={2}` |
| Skeleton loaders | Librería `react-native-skeleton-placeholder` |
| Leaflet mapa | `react-native-maps` |
| Bootstrap icons | `@expo/vector-icons` (Ionicons, MaterialIcons, etc.) |
| Rate limiting | Se mantiene igual en el backend (no cambia) |
| Validación de formularios | `react-hook-form` + `yup` |

---

## 📋 Pantallas equivalentes en la app móvil

```
📱 App React Native
├── HomeStack
│   ├── LandingScreen        ← index.html (carrusel + lista de eventos)
│   ├── EventDetailScreen    ← (nuevo: detalle de evento al tocar tarjeta)
│   └── CreateEventScreen    ← Modal de crear evento
├── AuthStack
│   ├── LoginScreen          ← login.html
│   └── RegisterScreen       ← registro.html
└── DashboardStack
    └── DashboardScreen      ← dashboard.html (panel con stats + eventos)
```
