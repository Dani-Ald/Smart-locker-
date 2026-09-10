# Documento 07 — Sesión: Conexión a Atlas y Primer Consumo de la API desde la App

**Depende de:** `05-sesion-scaffold-api-y-proximos-pasos.md`, `06-contexto-api-atlas-para-agente.md`  
**Proyecto:** Smart-Ticket — Sistema de Boletaje Digital, Valle del Mezquital  
**Fecha de sesión:** 09 de septiembre de 2026  
**Estado al cierre:** 🎉 Ciclo completo verificado — MongoDB Atlas → API → Expo Go

---

## 1. Lo que se hizo en esta sesión ✅

### 1.1 Decisión estratégica — Cambio de MongoDB local a Atlas directo

Se abandonó la estrategia de "MongoDB local primero" a favor de conectarse directamente a **MongoDB Atlas** desde el inicio:

- Se eliminó la carpeta `WEB/` (estaba vacía, ya no forma parte del proyecto).
- La cadena de conexión SRV de Atlas se configuró en `API/.env`.
- El código de `API/src/db.js` no requirió ningún cambio — `mongoose.connect(process.env.MONGODB_URI)` funciona igual con Atlas.
- Se habilitó la regla de red `0.0.0.0/0` en Atlas para desarrollo local.

### 1.2 Archivos nuevos en `App/Smart-Ticket/`

```
App/Smart-Ticket/src/
├── constants/
│   └── api.ts              ✅ Exporta API_BASE_URL = 'http://192.168.100.34:3000/api/v1'
├── screens/
│   └── EventosScreen.tsx   ✅ fetch → estados carga/error/refresh → FlatList de tarjetas
└── app/
    └── eventos.tsx         ✅ Ruta Expo Router — re-exporta EventosScreen
```

### 1.3 Archivo modificado

| Archivo | Cambio |
|---|---|
| `src/components/app-tabs.tsx` | Pestaña "Explore" → **"Eventos"** (apunta a `eventos.tsx`) |
| `src/components/app-tabs.tsx` | Pestaña "Home" → **"Inicio"** (etiqueta en español) |

### 1.4 Archivos actualizados en `API/`

| Archivo | Cambio |
|---|---|
| `API/.env` | `MONGODB_URI` ahora es la cadena SRV de Atlas (no local) |
| `API/.env.example` | Plantilla actualizada con formato SRV |
| `API/src/db.js` | Solo comentario actualizado — lógica sin cambios |
| `API/src/index.js` | Comentario de CORS actualizado (sin referencia a WEB) |
| `GEMINI.md` | Estructura actualizada: 2 proyectos (App + API), Atlas explícito |

---

## 2. Resultado verificado en Expo Go ✅

La pantalla **Eventos** muestra las 3 tarjetas reales desde Atlas:

| Evento | Municipio | Precio |
|---|---|---|
| Feria Patronal Ixmiquilpan 2026 | Ixmiquilpan | $150 MXN |
| Gran Baile de Octubre — Los Yonics | Ixmiquilpan | $200 MXN |
| Campeonato Estatal de Charrería | Actopan | $80 MXN |

El evento en borrador (Palenque de Navidad) **no aparece** — confirma que el filtro `estado: 'publicado'` funciona correctamente.

### Advertencia no bloqueante

Se observó en Expo Go: `Console Warning — Cannot connect to Expo CLI`.  
Esto es un aviso de red interna de Expo (no afecta al funcionamiento). Se puede ignorar durante desarrollo en red local.

---

## 3. Estado de la arquitectura al cierre

```
[ App Expo Go — iOS/Android ]
          ↕  fetch('http://192.168.100.34:3000/api/v1/eventos')
[ API — Node.js + Express corriendo en localhost:3000 ]
     npm run dev  (nodemon, reinicio automático)
          ↕  mongoose.connect(MONGODB_URI)
[ MongoDB Atlas — cluster smart-ticket ]
     colecciones: eventos (4 docs), organizadores (2), usuarios (2)
```

---

## 4. Estado de procesos en ejecución al cierre

| Terminal | Proceso | Puerto |
|---|---|---|
| Terminal 1 | `npm run dev` en `API/` | `localhost:3000` |
| Terminal 2 | `npx expo start` en `App/Smart-Ticket/` | Metro bundler |

---

## 5. Lo que NO está implementado todavía

- **Pantalla de detalle de evento** — `GET /api/v1/eventos/:id` existe en la API pero no hay navegación ni pantalla en la app.
- **Fecha formateada** — `fechaHora` se recibe como ISO 8601 y no se muestra en la tarjeta todavía.
- **Aforo disponible** — `aforoTotal - aforoVendido` no se muestra.
- **Filtros** — la API soporta `?categoria=` y `?municipio=` pero la app no los expone aún.
- **Compra de boletos** — `POST /api/v1/boletos` no está implementado en la API ni en la app.
- **Autenticación** — pendiente por diseño.
- **Pasarela de pago** — pendiente por diseño.
- **Deploy en la nube** — la API corre solo en local.

---

## 6. Siguiente paso — Pantalla de detalle de evento (Doc 08)

El flujo natural es que al tocar una tarjeta de la lista, el usuario vea el **detalle completo del evento** antes de poder comprar.

### Lo que implica implementar:

**En `App/Smart-Ticket/`:**

1. **Hacer las tarjetas tocables** — envolver el `renderItem` de `FlatList` en un `Pressable` que navegue a la ruta `/evento/[id]`.
2. **Crear la ruta dinámica** — `src/app/evento/[id].tsx` (Expo Router soporta rutas dinámicas con corchetes).
3. **Crear `EventoDetalleScreen.tsx`** — consume `GET /api/v1/eventos/:id`, muestra:
   - Nombre, categoría (badge), municipio, ubicación
   - Fecha y hora formateadas en español (ej. "Miércoles 15 de octubre, 2026 · 18:00 h")
   - Descripción completa
   - Aforo disponible (aforoTotal − aforoVendido)
   - Tipos de boleto con precios
   - Botón "Comprar boleto" (de momento navega a pantalla de confirmación pendiente)
4. **Agregar botón de regreso** — Expo Router lo maneja automáticamente con el Stack Navigator.

**En `API/`** (ya implementado, no requiere cambios):
- `GET /api/v1/eventos/:id` ya existe y devuelve el documento completo.

### Orden recomendado de implementación:

```
1. Hacer tarjetas tocables en EventosScreen (Pressable + router.push)
2. Crear src/app/evento/[id].tsx
3. Crear src/screens/EventoDetalleScreen.tsx
4. Formatear fecha con Intl.DateTimeFormat en español
5. Mostrar tipos de boleto (tiposBoleto[])
6. Botón "Comprar" → pantalla placeholder por ahora
```

---

## 7. Reglas vigentes del proyecto

1. La cadena de conexión de Atlas **nunca** va en el código — solo en `.env`.
2. Solo `API/` habla con MongoDB. La app solo hace `fetch()` a la API.
3. No implementar autenticación ni pasarela de pago hasta que se indique.
4. Si se necesita un endpoint nuevo, se agrega primero a `02-contrato-de-api.md`.
5. La IP `192.168.100.34` en `api.ts` es la IP local de la máquina de desarrollo — cambia si cambia la red.
