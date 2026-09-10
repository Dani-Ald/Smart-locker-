# Documento 08 — Sesión: Deploy de la API en Railway y Preparación de EAS

**Depende de:** `07-sesion-conexion-atlas-y-primer-consumo-api.md`
**Proyecto:** Smart-Ticket — Sistema de Boletaje Digital, Valle del Mezquital
**Fecha de sesión:** 10 de septiembre de 2026
**Estado al cierre:** ✅ API en producción en Railway — EAS pendiente de login

---

## 1. Contexto — Por qué se hizo este paso

Hasta la sesión 07, la API corría únicamente en `localhost:3000` en la máquina de desarrollo. Esto significaba que:

- Solo funcionaba en la misma red WiFi donde estaba la PC encendida.
- Nadie más podía probar la app desde su teléfono.
- La URL hardcodeada `http://192.168.100.34:3000` dejaba de funcionar al cambiar de red.

El maestro sugirió subir el proyecto a **Expo Go** (EAS) para compartirlo vía link/QR. Para eso, primero era necesario tener la API accesible públicamente en internet.

**Solución adoptada:** desplegar la API en **Railway** (plataforma de hosting en la nube, gratuita en trial).

---

## 2. Lo que se hizo en esta sesión ✅

### 2.1 Arquitectura antes y después

**Antes (local):**
```
[ Expo Go — mismo WiFi ]
        ↕ http://192.168.100.34:3000/api/v1
[ API — localhost:3000 en la PC del desarrollador ]
        ↕ mongoose.connect()
[ MongoDB Atlas ]
```

**Después (producción):**
```
[ Expo Go — cualquier red, cualquier dispositivo ]
        ↕ https://smart-locker-production-ecda.up.railway.app/api/v1
[ API — Railway (Node.js + Express, siempre activa) ]
        ↕ mongoose.connect(MONGODB_URI)
[ MongoDB Atlas ]
```

---

### 2.2 Pasos realizados en Railway

| # | Paso | Detalle |
|---|---|---|
| 1 | Crear cuenta | Login con GitHub en railway.app |
| 2 | Nuevo proyecto | + New → Deploy a GitHub Repository |
| 3 | Seleccionar repo | Dani-Ald/Smart-locker- |
| 4 | Configurar Root Directory | Settings del servicio → Root Directory = API |
| 5 | Agregar variables de entorno | Variables → MONGODB_URI (cadena SRV de Atlas) + PORT=3000 |
| 6 | Primer deploy fallido | Error de build — sin Root Directory configurado |
| 7 | Re-conectar repo | Desconectar y volver a conectar para resolver "GitHub Repo not found" |
| 8 | Deploy exitoso | Servicio en estado Online ✅ |
| 9 | Generar dominio público | Networking → Generate Domain |

---

### 2.3 Error encontrado y solución

**Error:** `Failed to build an image` — Railway mostraba la estructura del repo y no encontraba package.json en la raíz.

**Causa:** Railway intentaba construir el repo completo. La API está en la subcarpeta API/.

**Solución:** En Settings del servicio (no del proyecto), campo Root Directory → escribir `API`.

---

### 2.4 Archivo modificado en la App

`App/Smart-Ticket/src/constants/api.ts`

ANTES:
  export const API_BASE_URL = 'http://192.168.100.34:3000/api/v1';

DESPUÉS:
  export const API_BASE_URL = 'https://smart-locker-production-ecda.up.railway.app/api/v1';

---

### 2.5 Verificación

GET https://smart-locker-production-ecda.up.railway.app/api/v1/eventos
Respuesta: JSON con los 3 eventos publicados desde MongoDB Atlas ✅

---

## 3. Estado de la arquitectura al cierre

| Componente | Estado | URL / Ubicación |
|---|---|---|
| MongoDB Atlas | ✅ En la nube | Cluster smart-ticket |
| API Node.js | ✅ En Railway | https://smart-locker-production-ecda.up.railway.app |
| App Expo | 🔄 En desarrollo local | Pendiente de publicar con EAS |

---

## 4. Lo que quedó pendiente (Siguiente sesión — Doc 09)

### 4.1 EAS — Publicar la App

Para que cualquier teléfono pueda ver la app sin necesitar estar en la misma red:

```
1. eas login          → iniciar sesión con cuenta expo.dev
2. eas init           → vincular el proyecto App/Smart-Ticket a la cuenta Expo
3. eas update         → publicar la app y obtener link/QR compartible
```

### 4.2 Auto-deploy en Railway

Railway está configurado con Auto deploys when pushed to GitHub. Cada git push al branch main actualiza la API automáticamente.

### 4.3 Pantalla de detalle de evento

- Hacer tarjetas tocables en EventosScreen.tsx
- Crear src/app/evento/[id].tsx (ruta dinámica Expo Router)
- Crear src/screens/EventoDetalleScreen.tsx

---

## 5. Reglas vigentes del proyecto

1. La cadena de conexión de Atlas NUNCA va en el código — solo en .env local y Variables de Railway.
2. Solo API/ habla con MongoDB. La app solo hace fetch() a la API.
3. No implementar autenticación ni pasarela de pago hasta que se indique.
4. Si se necesita un endpoint nuevo, se agrega primero a 02-contrato-de-api.md.
5. El API_BASE_URL en api.ts apunta a Railway — no cambiar a IP local salvo debug temporal.
6. Railway hace auto-deploy al hacer git push al branch main.
