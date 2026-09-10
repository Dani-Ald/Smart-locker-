# Fase 2 — Documento 03: Resumen de avance, justificación de la arquitectura y próximos pasos

**Depende de:** `01-modelo-datos-y-arquitectura.md`, `02-contrato-de-api.md`
**Proyecto:** Sistema de Boletaje Digital — Valle del Mezquital, Hidalgo (app "Smart-Ticket")

---

## 1. Resumen de lo hecho hasta ahora

### 1.1 Arquitectura de carpetas definida
El repositorio compartido `Smart-locker-` se organiza en **tres proyectos independientes**, coordinados solo por compartir el mismo modelo de datos y la misma API:

- **`App/Smart-Ticket/`** — app móvil nativa, Expo + React Native, probada con Expo Go.
- **`WEB/`** — página web independiente, HTML5 + CSS + JS plano.
- **`API/`** — backend (Node.js + Express + Mongoose), única puerta de entrada a MongoDB Atlas.

Ninguno de los tres le habla directo a otro salvo a través de la API.

### 1.2 Documento 01 — Modelo de datos y arquitectura
Se definieron las 5 colecciones de MongoDB Atlas (`organizadores`, `eventos`, `boletos`, `usuarios`, `transacciones`), sus campos y relaciones, además del stack técnico de `App/` (Expo Router, TypeScript, NativeWind, Zustand, Jest) y de `WEB/` (HTML/CSS/JS plano, fetch contra la API).

### 1.3 Scaffold de `App/Smart-Ticket`
- Se creó con `create-expo-app`, se corrigió dos veces (ubicación de carpeta, versión de SDK) hasta quedar alineado con la versión real de Expo Go instalada (**SDK 57**).
- Confirmado funcionando tanto en navegador (`localhost:8081`) como en celular vía QR con Expo Go.
- Primer commit hecho sobre este scaffold limpio.

### 1.4 Documento 02 — Contrato de API
Se definieron los endpoints REST (`/api/v1/eventos`, `/boletos`, `/organizadores`, `/usuarios`) con sus métodos, query params y bodies esperados, más dos puntos marcados explícitamente como pendientes: integración de pasarela de pago y autenticación.

### 1.5 Decisión de responsabilidad
Confirmaste que tú construyes los tres proyectos (App, WEB y API) — no hay reparto con otro integrante del equipo por ahora. Esto no cambia la arquitectura, pero sí el orden práctico de trabajo: puedes avanzar los tres en paralelo con mocks, pero la API es la que finalmente los hace reales.

---

## 2. Por qué existe una API en medio (justificación)

No es una capa burocrática de más — resuelve problemas concretos que aparecerían si `App/` o `WEB/` hablaran directo con MongoDB Atlas:

**Seguridad de credenciales.** Si el celular o el navegador tuvieran la cadena de conexión de MongoDB, cualquiera podría extraerla del código de la app o del JS del sitio (ambos son, por definición, código que corre en la máquina del usuario, visible o descompilable) y con eso leer, modificar o borrar toda la base de datos. La API es la única pieza que corre en un servidor que tú controlas; ahí sí es seguro guardar esas credenciales.

**Una sola fuente de verdad para las reglas de negocio.** Cosas como el cálculo de la comisión escalada (Fase 1 §5.1), el control de aforo (no vender más boletos de los que caben) o marcar un boleto como "usado" al escanearlo, tienen que aplicarse igual sin importar si la venta ocurrió desde la app o desde la página web. Si cada frontend implementara esa lógica por su cuenta, tarde o temprano se desincronizan — por ejemplo, la web permite vender el boleto 501 y la app lo bloquea, o viceversa. Con la API en medio, la regla vive en un solo lugar.

**Consistencia entre App y WEB.** Ambos consumen exactamente el mismo contrato (documento 02), así que un evento creado desde uno se ve igual de correcto desde el otro, sin duplicar lógica de formateo o validación en dos lenguajes distintos (TypeScript en la app, JS plano en la web).

**Puedes cambiar la base de datos sin romper a los clientes.** Si mañana decides renombrar un campo en MongoDB o cambiar cómo se calcula algo internamente, solo tocas la API — mientras el contrato hacia afuera (los endpoints del documento 02) no cambie, ni `App/` ni `WEB/` se enteran del cambio interno.

**Se puede probar de forma aislada.** Puedes verificar que "vender un boleto cuando el aforo está lleno" da error, usando herramientas como Postman, sin necesidad de tener la app o la web corriendo. Eso hace las pruebas más rápidas y más confiables que probarlo únicamente a través de la interfaz visual.

**Se despliega distinto a los otros dos.** `App/` termina como un `.apk`/`.ipa` instalado en un celular. `WEB/` termina como archivos estáticos servidos por cualquier hosting. `API/` necesita un servidor corriendo 24/7 (Render, Railway, Fly.io, etc.) — son ciclos de vida distintos, y separarla en su propia carpeta/proyecto lo refleja desde la estructura del repo.

---

## 3. Próximos pasos (detallado — este es el bloque más importante ahora mismo)

Todo lo construido hasta hoy (scaffold de App, documentos 01 y 02) es preparación. **Lo que de verdad desbloquea el proyecto es que `API/` empiece a responder datos reales.** Sin eso, tanto `App/` como `WEB/` están condenados a trabajar con datos inventados (mocks) indefinidamente. El orden recomendado:

### Paso 1 — Inicializar el proyecto de la API
Dentro de `API/`, correr `npm init -y` e instalar `express`, `mongoose`, `dotenv`, y como dependencias de desarrollo `nodemon`. Esto es un proyecto Node normal, no necesita Expo ni nada relacionado a React.

### Paso 2 — Conexión a MongoDB Atlas
Crear un archivo `.env` (que **nunca se sube a git** — agrégalo a `.gitignore` de inmediato) con la cadena de conexión de tu clúster de Atlas. Escribir un archivo `db.js` que se conecte a Mongoose al arrancar el servidor y muestre en consola si la conexión fue exitosa. Este paso, por sí solo, ya es una victoria comprobable: si conecta, la infraestructura de datos existe de verdad.

### Paso 3 — Traducir el documento 01 a schemas de Mongoose
Un archivo por colección (`models/Evento.js`, `models/Boleto.js`, etc.) con los campos y tipos exactamente como están en el documento 01. Esto asegura que el "contrato de datos" que ya acordaste contigo mismo se aplique de verdad, no solo en papel.

### Paso 4 — Implementar primero SOLO los endpoints de `eventos`
No implementes las 4 entidades a la vez. Empieza únicamente con `GET /api/v1/eventos` y `GET /api/v1/eventos/:id` (los de solo lectura, los más simples). La meta de este paso es ver una lista de eventos real — aunque sea uno solo, metido a mano en MongoDB Atlas desde su interfaz web — respondida por tu propio servidor.

### Paso 5 — Probar la API sola, antes de tocar App o WEB
Usa Postman, Insomnia, o la extensión Thunder Client de VS Code para llamar a `GET /api/v1/eventos` directamente y confirmar que regresa el JSON esperado. No conectes nada de `App/` o `WEB/` todavía — aislar el problema aquí ahorra horas de debugging después (si falla, sabes que es la API, no la pantalla).

### Paso 6 — Conectar UN frontend a ese único endpoint
Elige uno (recomendado: `WEB/`, por ser más simple de depurar que React Native) y haz que su pantalla de catálogo llame a `GET /api/v1/eventos` con `fetch()` real, reemplazando cualquier dato simulado. Cuando esto funcione de punta a punta (Mongo → API → navegador), tienes la prueba de que toda la cadena de la sección 2 funciona.

### Paso 7 — Repetir el patrón para el resto de endpoints
Boletos, organizadores, usuarios — mismo ciclo cada vez: modelo Mongoose → endpoint → probar aislado con Postman → conectar frontend. No avances al siguiente endpoint hasta que el anterior esté probado.

### Paso 8 — Conectar `App/Smart-Ticket` al mismo backend
Una vez que `WEB/` ya consume la API real, repetir la conexión en la app móvil usando la carpeta `api/` que se definió en el documento 01. Aquí es donde confirmas que ambos frontends de verdad pueden compartir un mismo backend sin duplicar lógica.

### Paso 9 — Seguridad básica antes de exponer la API a internet
Configurar CORS para que solo acepte peticiones desde tus propios orígenes (tu dominio de `WEB/` en producción, y `localhost` en desarrollo), y confirmar que el `.env` con credenciales nunca terminó en un commit de git (`git log -p -- .env` para revisar el historial).

### Paso 10 — Documentar cómo levantar `API/` localmente
Un `README.md` dentro de `API/` con los pasos exactos (`npm install`, variables de entorno necesarias, `npm run dev`) — esto es documentación que tu futuro yo (o cualquiera que retome el repo) va a necesitar.

---

## 4. Qué NO hacer todavía

- No implementes la integración de la pasarela de pago (Mercado Pago) — quedó marcada como pendiente en el documento 02 a propósito. Primero necesitas el flujo completo funcionando con pagos simulados.
- No implementes autenticación/login todavía — el documento 02 ya señala que probablemente solo el organizador la necesite, y eso se define después de tener el catálogo público funcionando.
- No trabajes los 3 proyectos (App, WEB, API) en paralelo sin que ninguno tenga datos reales — es más fácil perder el hilo. Termina el ciclo modelo→endpoint→prueba→conexión para `eventos` de principio a fin antes de abrir otro frente.
