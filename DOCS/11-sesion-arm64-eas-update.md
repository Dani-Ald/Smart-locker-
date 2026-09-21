# Documento 11 — Sesión: Compatibilidad arm64 y EAS Update OTA

**Depende de:** `10-sesion-eas-build-apk-android.md`
**Proyecto:** Smart-Ticket — Sistema de Boletaje Digital, Valle del Mezquital
**Fecha de sesión:** 11 de septiembre de 2026
**Estado al cierre:** ✅ Compatibilidad arm64 corregida — EAS Update implementado y primera actualización OTA enviada

---

## 1. Problema de partida

El APK generado en la sesión 10 era rechazado al intentar instalarlo en un **Google Pixel 9 Pro** (Android 14/15/16) con el mensaje:

> "No puedes instalar la app en tu dispositivo"

**Causa raíz:** El Pixel 9 Pro es un dispositivo exclusivamente de 64 bits (`arm64-v8a`).
El build anterior no declaraba arquitectura objetivo ni versiones de SDK modernas, lo que hace que Android rechace la instalación en hardware 64-bit only.

---

## 2. Correcciones de compatibilidad

### 2.1 Cambios en `app.json`

| Campo | Valor anterior | Valor nuevo | Por qué |
|-------|---------------|-------------|---------|
| `minSdkVersion` | sin definir | `26` (Android 8.0) | Mínimo recomendado para React Native moderno |
| `targetSdkVersion` | sin definir | `35` (Android 15) | Requerido por Google Play desde agosto 2025 |
| `compileSdkVersion` | sin definir | `35` | Debe coincidir con targetSdkVersion |
| `buildToolsVersion` | sin definir | `"35.0.0"` | Herramientas alineadas con SDK 35 |

```json
"android": {
  "package": "com.daniald.SmartTicket",
  "minSdkVersion": 26,
  "targetSdkVersion": 35,
  "compileSdkVersion": 35,
  "buildToolsVersion": "35.0.0"
}
```

### 2.2 Cambios en `eas.json`

Se reestructuraron los perfiles de build para diferenciar casos de uso:

| Perfil | Tipo | Uso |
|--------|------|-----|
| `development` | APK debug | Desarrollo con Dev Client |
| `preview` | APK release universal | Pruebas generales en cualquier Android |
| `preview-arm64` | APK release arm64-v8a | **Pixel 9 Pro y dispositivos 64-bit only** |
| `production` | AAB | Subida a Google Play Store |

Comando para compilar APK compatible con Pixel 9 Pro:

```powershell
eas build --platform android --profile preview-arm64
```

---

## 3. Implementación de EAS Update (actualizaciones OTA)

### 3.1 ¿Qué es EAS Update?

Permite enviar cambios de JavaScript (UI, lógica, estilos, assets) a la app ya instalada **sin necesidad de recompilar ni redistribuir un APK nuevo**.

El usuario con la app instalada recibe el cambio automáticamente en segundo plano.
Al volver a abrir la app, ya tiene la versión actualizada.

### 3.2 Regla de decisión: eas update vs eas build

| Tipo de cambio | Comando | Tiempo estimado |
|---------------|---------|-----------------|
| Cambios en `.tsx` / `.ts` / `.js` | `eas update` | ~30 segundos |
| Cambios de estilos, assets, imágenes | `eas update` | ~30 segundos |
| Nuevas librerías solo JavaScript | `eas update` | ~30 segundos |
| Nuevos permisos o plugins en `app.json` | `eas build` | ~10-15 minutos |
| Nuevas dependencias con código nativo | `eas build` | ~10-15 minutos |
| Cambios en `eas.json` | `eas build` | ~10-15 minutos |

> **Red de seguridad:** El campo `runtimeVersion: { policy: "appVersion" }` en `app.json`
> evita que un update incompatible cause crashes — la app simplemente lo ignora.

### 3.3 Primera actualización OTA enviada

Se reemplazó la pantalla Home genérica de Expo template por un Home
con identidad propia de Smart-Ticket.

**Comando ejecutado:**

```powershell
eas update --branch preview --message "feat: Home Smart-Ticket actualizado"
```

**Archivo modificado:** `src/app/index.tsx`

**Cambios en el Home:**

| Antes (Expo template) | Después (Smart-Ticket) |
|----------------------|------------------------|
| "Welcome to Expo" genérico | Header con chip **ST** azul + nombre de la app |
| Hints de desarrollo | Tarjeta de **estado del locker** con indicador verde |
| — | Grid de 4 acciones: 🎟️ Tickets, 🔓 Locker, 📋 Historial, ⚙️ Ajustes |
| — | Badge "✨ Actualizado vía EAS Update" de confirmación |

---

## 4. Flujo de trabajo establecido

```
¿Qué tipo de cambio hice?
          │
          ├─── Solo .tsx / .ts / assets / lógica / estilos
          │           │
          │           ▼
          │    eas update --branch preview --message "descripcion"
          │           │
          │           ▼
          │    App instalada recibe el cambio en segundo plano
          │    Al reabrir la app → versión nueva activa (~30 seg total)
          │
          └─── Nuevo plugin / permiso / dependencia nativa / app.json
                      │
                      ▼
               eas build --platform android --profile preview-arm64
                      │
                      ▼
               Nuevo APK → compartir link → instalar en dispositivo
                                            (~10-15 min total)
```

---

## 5. Lo que se hizo en esta sesión

| # | Acción | Resultado |
|---|--------|-----------|
| 1 | Agregar `minSdkVersion: 26` en `app.json` | Base mínima moderna para React Native |
| 2 | Agregar `targetSdkVersion: 35` en `app.json` | Cumple requisitos Google Play 2025 |
| 3 | Agregar `compileSdkVersion: 35` en `app.json` | SDK de compilación alineado |
| 4 | Reestructurar `eas.json` con 4 perfiles | Separación clara dev / preview / arm64 / prod |
| 5 | Rediseñar `src/app/index.tsx` | Home con identidad Smart-Ticket |
| 6 | Ejecutar `eas update --branch preview` | Primera actualización OTA enviada con éxito |

---

## 6. Próximos pasos

- Instalar el nuevo APK `preview-arm64` en el Pixel 9 Pro y confirmar que instala correctamente
- Confirmar que el EAS Update del Home llega al dispositivo
- Pantalla de detalle de evento (tocar tarjeta → ver info completa)
- Formatear fechas en español
- Mostrar aforo disponible
- Filtros por categoría y municipio
- Compra de boletos (POST /api/v1/boletos)
