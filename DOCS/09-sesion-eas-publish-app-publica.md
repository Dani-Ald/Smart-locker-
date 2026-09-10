# Documento 09 — Sesión: Publicación de la App con EAS Update

**Depende de:** `08-sesion-deploy-railway-y-eas.md`
**Proyecto:** Smart-Ticket — Sistema de Boletaje Digital, Valle del Mezquital
**Fecha de sesión:** 10 de septiembre de 2026
**Estado al cierre:** ✅ App publicada en EAS — Accesible desde cualquier teléfono con Expo Go

---

## 1. Contexto — Por qué se hizo este paso

Con la API ya corriendo en Railway (Doc 08), el siguiente obstáculo era que la app solo podía usarse:
- En el mismo dispositivo que corría `npx expo start`
- O en dispositivos conectados a la misma red WiFi

El maestro sugirió usar **EAS (Expo Application Services)** para publicar la app en la nube de Expo y compartirla mediante un link o QR. Cualquier persona con Expo Go instalado puede abrir la app sin necesitar la PC del desarrollador encendida.

---

## 2. Lo que se hizo en esta sesión ✅

### 2.1 Herramientas instaladas

| Herramienta | Comando | Resultado |
|---|---|---|
| EAS CLI | `npm install -g eas-cli` | Instalado globalmente ✅ |
| expo-updates | Instalado automáticamente por `eas update` | Configurado en app.json ✅ |

### 2.2 Pasos realizados

| # | Comando | Resultado |
|---|---|---|
| 1 | `eas login` | Login via navegador (OAuth) — "Authentication successful" ✅ |
| 2 | `eas init --account dani-ald --non-interactive` | Proyecto creado: `@dani-ald/Smart-Ticket` ✅ |
| 3 | `eas update --branch preview --message "Deploy inicial"` | App publicada en branch `preview` ✅ |

### 2.3 Errores encontrados y soluciones

| Error | Causa | Solución |
|---|---|---|
| `You have access to multiple accounts` | EAS detectó dos cuentas: dani-ald y dani-alds-team | Agregar flag `--account dani-ald` |
| `Run this command inside a project directory` | El comando se ejecutó desde la raíz del repo | Ejecutar desde `App/Smart-Ticket/` |
| `ENOTFOUND api.expo.dev` (primer intento) | Error de red momentáneo | Reintentar el comando |
| `--environment flag must be set` | Flag requerido en modo non-interactive | Ejecutar sin `--non-interactive` y seleccionar `preview` del menú |

---

## 3. Archivos modificados automáticamente por EAS

EAS modificó estos archivos al ejecutar `eas init` y `eas update`:

### app.json
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "8330d623-bb4d-423f-9a9e-8543aea15891"
      }
    },
    "owner": "dani-ald",
    "updates": {
      "url": "https://u.expo.dev/8330d623-bb4d-423f-9a9e-8543aea15891"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
```

### package.json / package-lock.json
- Se agregó `expo-updates` como dependencia

---

## 4. Arquitectura completa al cierre

```
[ GitHub — Dani-Ald/Smart-locker- ]
    |
    ├── API/  →  Railway (auto-deploy en cada git push)
    |               URL: https://smart-locker-production-ecda.up.railway.app
    |                     ↕ mongoose.connect()
    |               MongoDB Atlas — cluster smart-ticket
    |
    └── App/Smart-Ticket/  →  EAS (Expo Application Services)
                    Proyecto: @dani-ald/Smart-Ticket
                    Branch publicado: preview
                    Dashboard: https://expo.dev/accounts/dani-ald/projects/Smart-Ticket
```

### Flujo completo de datos

```
[ Cualquier teléfono con Expo Go ]
        ↓ Escanea QR o abre link de EAS
[ App publicada en EAS — branch preview ]
        ↓ fetch() al API
[ API en Railway — Node.js + Express ]
        ↓ mongoose.connect()
[ MongoDB Atlas — cluster smart-ticket ]
```

---

## 5. Cómo compartir la app con otros

1. Ir a: https://expo.dev/accounts/dani-ald/projects/Smart-Ticket
2. Sección "Updates" → hacer clic en "View all"
3. Abrir el update "Deploy inicial" (branch: preview)
4. Compartir el link o QR que aparece ahí
5. La otra persona instala Expo Go y escanea el QR

---

## 6. Cómo publicar una nueva versión

Cada vez que hagas cambios en la app y quieras que se reflejen en el link compartido:

```powershell
# Desde App/Smart-Ticket/
eas update --branch preview --message "Descripcion del cambio"
```

Seleccionar: `preview`

Los usuarios que ya tienen el link verán los cambios automáticamente la próxima vez que abran la app.

---

## 7. Flujo de trabajo diario a partir de ahora

```
1. Hacer cambios en el código de la app
2. git add . && git commit -m "..." && git push
   (Railway se actualiza solo si cambiaste algo en API/)
3. Si cambiaste algo en App/:
   cd App/Smart-Ticket
   eas update --branch preview --message "descripcion"
```

---

## 8. Lo que NO está implementado todavía

- **Pantalla de detalle de evento** — al tocar una tarjeta, mostrar info completa del evento
- **Aforo disponible** — aforoTotal - aforoVendido no se muestra
- **Fecha formateada** — fechaHora se recibe como ISO 8601, falta formatear en español
- **Filtros** — la API soporta ?categoria= y ?municipio= pero la app no los expone
- **Compra de boletos** — POST /api/v1/boletos pendiente en API y App
- **Autenticacion** — pendiente por diseño
- **Pasarela de pago** — pendiente por diseño

---

## 9. Reglas vigentes del proyecto

1. La cadena de conexion de Atlas NUNCA va en el codigo — solo en .env local y Variables de Railway.
2. Solo API/ habla con MongoDB. La app solo hace fetch() a la API.
3. No implementar autenticacion ni pasarela de pago hasta que se indique.
4. Si se necesita un endpoint nuevo, agregarlo primero a 02-contrato-de-api.md.
5. API_BASE_URL en api.ts apunta a Railway — no cambiar a IP local salvo debug temporal.
6. Railway hace auto-deploy al hacer git push al branch main.
7. Publicar en EAS con: eas update --branch preview (desde App/Smart-Ticket/).
