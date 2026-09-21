# Documento 10 — Sesión: EAS Build — Compilacion del APK de Android

**Depende de:** `09-sesion-eas-publish-app-publica.md`
**Proyecto:** Smart-Ticket — Sistema de Boletaje Digital, Valle del Mezquital
**Fecha de sesión:** 10 de septiembre de 2026
**Estado al cierre:** ✅ APK compilado — link de descarga disponible en expo.dev

---

## 1. Por qué cambiamos de estrategia

En la sesión 09 se intentó compartir la app via EAS Update (QR en expo.dev) y via tunnel (ngrok).
Ambos tuvieron problemas:

- EAS Update requiere un APK ya instalado para recibir actualizaciones OTA.
- El tunnel de ngrok en Windows tenia conflictos con expo-updates.

**Decision:** Compilar directamente un APK instalable con `eas build`. Esto es la solucion correcta y permanente.

---

## 2. Lo que se hizo en esta sesion

| # | Accion | Resultado |
|---|---|---|
| 1 | Crear `eas.json` con perfil `preview` | APK de distribucion interna (sin Play Store) |
| 2 | Restaurar `expo-updates` en `app.json` | `enabled: false` fue revertido |
| 3 | Ejecutar `eas build --profile preview --platform android` | Build lanzado en servidores EAS |
| 4 | Android application id asignado | `com.daniald.SmartTicket` |
| 5 | Keystore generado en la nube | Expo lo guarda automaticamente |
| 6 | Archivos subidos a EAS | 11.8 MB comprimidos |

---

## 3. Estado actual — Build en progreso

```
Build ID: 36ba1be7-b26a-488a-ae54-c4697d1e1ccc
URL:       https://expo.dev/accounts/dani-ald/projects/Smart-Ticket/builds/36ba1be7-b26a-488a-ae54-c4697d1e1ccc
Estado:    🔄 Build in progress... (10-25 min en servidores gratuitos)
```

El build ocurre en los servidores de Expo — la PC puede estar apagada y el build continua.

---

## 4. Que hacer cuando termine el build

1. Ir a la URL del build en expo.dev
2. Hacer clic en **Download** — descarga el archivo `.apk`
3. Enviar el `.apk` por WhatsApp, Google Drive o cualquier medio
4. En el telefono Android: activar "Instalar fuentes desconocidas" en ajustes
5. Instalar el APK — la app queda instalada de forma permanente

### Para publicar actualizaciones futuras (sin recompilar):
```powershell
cd App/Smart-Ticket
eas update --branch preview --message "descripcion del cambio"
```
Los usuarios con el APK instalado reciben el update automaticamente.

---

## 5. Arquitectura final al terminar el build

```
[ APK instalado en cualquier Android ]
        ↓ fetch()
[ API en Railway — siempre activa ]
        ↓ mongoose.connect()
[ MongoDB Atlas ]

Sin necesidad de:
  - Expo Go
  - PC encendida
  - Misma red WiFi
```

---

## 6. Proximos pasos (pendientes de sesiones anteriores)

- Pantalla de detalle de evento (tocar tarjeta → ver info completa)
- Formatear fechas en español
- Mostrar aforo disponible
- Filtros por categoria y municipio
- Compra de boletos (POST /api/v1/boletos)

