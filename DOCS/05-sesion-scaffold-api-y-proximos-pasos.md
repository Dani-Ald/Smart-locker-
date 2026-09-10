# Documento 05 — Sesión de Implementación: Scaffold de `API/` y Próximos Pasos

**Depende de:** `04-implementacion-api.md`  
**Proyecto:** Smart-Ticket — Sistema de Boletaje Digital, Valle del Mezquital  
**Fecha de sesión:** 09 de septiembre de 2026  
**Estado al cierre de sesión:** API scaffoldeada, MongoDB instalándose con Compass

---

## 1. Lo que se hizo en esta sesión ✅

### 1.1 Decisión estratégica — Local primero, Railway después
Se cambió la estrategia original (Atlas directo) por un flujo de dos fases:

- **Fase A — Local:** MongoDB local + Express en `localhost:3000`. Sin credenciales de nube, iteración rápida.
- **Fase B — Deploy:** Railway como hosting del servidor Node + MongoDB plugin de Railway. El código no cambia, solo la variable `MONGODB_URI`.

Tutorial de referencia para el deploy: https://youtu.be/UWRsyP7iAnU

---

### 1.2 Archivos creados en `API/`

```
API/
├── .env                        ✅ MONGODB_URI local (no va a git)
├── .env.example                ✅ Plantilla pública (sí va a git)
├── .gitignore                  ✅ Excluye .env y node_modules
├── package.json                ✅ Scripts: dev, start, seed, seed:limpiar
└── src/
    ├── index.js                ✅ Servidor Express + middleware (cors, json)
    ├── db.js                   ✅ Conexión Mongoose (funciona igual local y Railway)
    ├── seeder.js               ✅ Datos de prueba reales del Valle del Mezquital
    ├── models/
    │   ├── Evento.js           ✅ Schema completo (doc 01 §3.2)
    │   ├── Organizador.js      ✅ Schema completo (doc 01 §3.1)
    │   ├── Usuario.js          ✅ Schema completo (doc 01 §3.4)
    │   ├── Boleto.js           ✅ Schema completo (doc 01 §3.3)
    │   └── Transaccion.js      ✅ Schema completo (doc 01 §3.5)
    └── routes/
        └── eventos.js          ✅ GET /api/v1/eventos + GET /api/v1/eventos/:id
```

### 1.3 Dependencias instaladas en `API/`

| Paquete | Versión | Rol |
|---|---|---|
| `express` | ^5.2.1 | Servidor HTTP y rutas |
| `mongoose` | ^9.9.5 | ODM para MongoDB |
| `dotenv` | ^17.4.2 | Variables de entorno |
| `cors` | ^2.8.6 | Peticiones cross-origin (App + WEB) |
| `nodemon` *(dev)* | ^3.1.14 | Reinicio automático en desarrollo |

### 1.4 Datos del seeder (`src/seeder.js`)

El seeder inserta datos reales del Valle del Mezquital para pruebas:

| Colección | Datos insertados |
|---|---|
| `organizadores` | Comité Fiestas Patronales Ixmiquilpan + Asociación de Charros Actopan |
| `usuarios` | 2 compradores de prueba |
| `eventos` | **4 eventos** — 3 publicados + 1 en borrador |

Eventos publicados (aparecen en `GET /api/v1/eventos`):
1. Feria Patronal Ixmiquilpan 2026 — 15 Oct 2026 — $150
2. Gran Baile de Octubre (Los Yonics) — 20 Oct 2026 — $200
3. Campeonato Estatal de Charrería, Actopan — 05 Nov 2026 — $80

Evento en borrador (NO aparece en la API — verifica que la lógica funciona):
4. Palenque de Navidad 2026, Actopan — $300

---

## 2. Estado de instalación de herramientas al cierre

| Herramienta | Estado |
|---|---|
| Node.js + npm | ✅ Instalado |
| mongo-express | ✅ Instalado globalmente (196 paquetes) |
| MongoDB Community 8.3.9 | ⏳ Instalando vía MSI — wizard en progreso |
| MongoDB Compass | ⏳ Instalando (parte del mismo MSI, recomendado por maestro) |

---

## 3. Pasos a seguir DURANTE/DESPUÉS de la instalación de MongoDB

### 3.1 Cuando el wizard termine → Click en "Finish"
Al terminar el instalador, MongoDB queda corriendo como **servicio de Windows** de forma automática. No necesitas levantarlo manualmente cada vez — arranca con Windows.

Verifica que funciona abriendo una terminal nueva y corriendo:
```powershell
mongod --version
# Debe mostrar: db version v8.3.9
```

Si el comando no se reconoce, cierra y vuelve a abrir la terminal (el PATH se actualiza después de instalar).

---

### 3.2 Abrir MongoDB Compass
1. Búscalo en el menú de inicio: **"MongoDB Compass"**
2. En la pantalla de conexión, usa esta URI:
   ```
   mongodb://localhost:27017
   ```
3. Click en **"Connect"**
4. Deberías ver las bases de datos del sistema (`admin`, `config`, `local`) — eso confirma que MongoDB está corriendo correctamente.

> La base de datos `smart-ticket` aparecerá aquí hasta que corras el seeder (paso 3.4).

---

### 3.3 Levantar la API en modo desarrollo
Abre una terminal, navega a la carpeta `API/` y corre:
```bash
cd Smart-locker-/API
npm run dev
```

**Salida esperada:**
```
✅ MongoDB conectado → mongodb://127.0.0.1:27017/smart-ticket
🚀 API corriendo en http://localhost:3000
   → Healthcheck: http://localhost:3000/api/v1/health
   → Eventos:     http://localhost:3000/api/v1/eventos
```

Si ves `❌ Error de conexión a MongoDB` — MongoDB no está corriendo. Revisa el paso 3.1.

---

### 3.4 Poblar la base de datos con el seeder
En otra terminal (deja la del servidor corriendo):
```bash
cd Smart-locker-/API
npm run seed
```

**Salida esperada:**
```
✅ MongoDB conectado → mongodb://127.0.0.1:27017/smart-ticket
🗑️  Colecciones limpiadas
✅ 2 organizadores insertados
✅ 2 usuarios insertados
✅ 4 eventos insertados

📋 IDs útiles para probar con Postman/Thunder Client:
   Feria Patronal Ixmiquilpan 2026:     6XXXXXXXXXXXXXXXXXXXXXXXXX
   Gran Baile de Octubre — Los Yonics:  6XXXXXXXXXXXXXXXXXXXXXXXXX
   Campeonato Estatal de Charrería:     6XXXXXXXXXXXXXXXXXXXXXXXXX

🎉 Seeder completado. Prueba: GET http://localhost:3000/api/v1/eventos
```

---

### 3.5 Verificar en MongoDB Compass
Después del seeder, regresa a Compass y refresca. Deberías ver:
- Base de datos: `smart-ticket`
- Colecciones: `eventos` (4 docs), `organizadores` (2 docs), `usuarios` (2 docs)

Haz click en la colección `eventos` y explora los documentos — así confirmas visualmente que el schema de Mongoose se aplicó correctamente.

---

### 3.6 Probar los endpoints con Thunder Client (VS Code)

Instala la extensión **Thunder Client** en VS Code si no la tienes.  
Prueba cada request en este orden:

| # | Método | URL | Qué verifica |
|---|---|---|---|
| 1 | GET | `http://localhost:3000/api/v1/health` | Servidor corriendo |
| 2 | GET | `http://localhost:3000/api/v1/eventos` | Lista 3 eventos publicados |
| 3 | GET | `http://localhost:3000/api/v1/eventos?municipio=Ixmiquilpan` | Filtro por municipio |
| 4 | GET | `http://localhost:3000/api/v1/eventos?categoria=charreada` | Filtro por categoría |
| 5 | GET | `http://localhost:3000/api/v1/eventos/[ID_del_paso_3.4]` | Detalle por ID |
| 6 | GET | `http://localhost:3000/api/v1/eventos/id-invalido-123` | Debe responder `400 - ID inválido` |

✅ **La sesión del Paso 4 estará completa cuando los 6 requests funcionen correctamente.**

---

## 4. Siguiente documento (Doc 06 — a redactar en la próxima sesión)

Una vez que los 6 tests pasen, el siguiente paso será:

**Conectar `WEB/` a la API real**
- Crear el scaffold de `WEB/` (estructura HTML/CSS/JS del doc 01 §4-B)
- Implementar `WEB/js/api.js` con `fetch()` apuntando a `http://localhost:3000/api/v1`
- Mostrar los eventos del seeder en la página de catálogo real (reemplaza datos estáticos)
- Cuando funcione de punta a punta (MongoDB → API → navegador), se hace el deploy a Railway siguiendo el tutorial del video

---

## 5. Qué NO hacer todavía

- No implementar `POST /eventos` ni `PUT /eventos/:id` — el Paso 4 es solo de lectura
- No conectar `App/Smart-Ticket` todavía — primero va `WEB/` (más simple de depurar)
- No hacer el deploy a Railway hasta que el ciclo local esté 100% verificado
- No implementar autenticación ni pasarela de pago — están marcadas como pendientes
