# Documento 12 — Sesión: EAS Update Forzado (OTA Inmediato al Arranque)

**Depende de:** `11-sesion-arm64-eas-update.md`
**Proyecto:** Smart-Ticket — Sistema de Boletaje Digital, Valle del Mezquital
**Fecha de sesión:** 11 de septiembre de 2026
**Estado al cierre:** ✅ OTA forzado funcionando — la app se auto-actualiza al abrirse sin reinstalar el APK

---

## 1. Problema de partida

En la sesión 11 se implementó EAS Update correctamente, pero las actualizaciones **no se aplicaban de forma inmediata**.
El comportamiento por default de `expo-updates` es:

```
1er arranque  →  descarga el update en background
2do arranque  →  recién aplica el update
```

Esto requería que el usuario abriera la app dos veces para ver los cambios.
Adicionalmente, ninguna actualización publicada llegaba al dispositivo, por una razón distinta.

---

## 2. Diagnóstico — Canal incorrecto en el build

### El error raíz

El perfil `preview-arm64` en `eas.json` **no tenía `channel` definido**.

Cuando EAS Build no encuentra un `channel` en el perfil, usa el **nombre del perfil como canal**:

| | Canal que escucha el APK | Canal donde publicábamos updates |
|---|---|---|
| **Antes (mal)** | `preview-arm64` | `production` ❌ |
| **Después (bien)** | `production` | `production` ✅ |

Por eso los updates aparecían correctamente en expo.dev pero **nunca llegaban al dispositivo** — estaban en canales distintos.

### Corrección en `eas.json`

```json
// ANTES
"preview-arm64": {
  "extends": "preview",
  "distribution": "internal",
  ...
}

// DESPUÉS
"preview-arm64": {
  "extends": "preview",
  "channel": "production",   // ← línea agregada
  "distribution": "internal",
  ...
}
```

> **Regla:** Cualquier perfil de build que deba recibir updates del canal `production` DEBE declarar `"channel": "production"` explícitamente.

---

## 3. Implementación — Hook `useOtaUpdate`

Para resolver la necesidad de dos arranques, se creó un hook que **busca, descarga y aplica el update al primer arranque**.

### Archivo creado: `src/hooks/use-ota-update.ts`

```typescript
import * as Updates from 'expo-updates';
import { useEffect } from 'react';

/**
 * Busca actualizaciones OTA al montar el componente.
 * Si encuentra una, la descarga y recarga la app de inmediato.
 * Solo actúa en producción (no en __DEV__).
 */
export function useOtaUpdate() {
  useEffect(() => {
    if (__DEV__) return;

    async function checkAndApply() {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (result.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync(); // Recarga inmediata ✅
        }
      } catch (e) {
        console.warn('[OTA] Error al verificar update:', e);
      }
    }

    checkAndApply();
  }, []);
}
```

### Integrado en `src/app/_layout.tsx`

```typescript
import { useOtaUpdate } from '@/hooks/use-ota-update';

export default function TabLayout() {
  useOtaUpdate(); // ← Se ejecuta al montar la app
  // ...
}
```

---

## 4. Flujo OTA forzado (resultado final)

```
Usuario abre la app
        ↓
useOtaUpdate() se ejecuta en background
        ↓
checkForUpdateAsync()  →  ¿Hay update en canal "production"?
        ↓ Sí
fetchUpdateAsync()     →  Descarga el bundle nuevo
        ↓
reloadAsync()          →  La app "parpadea" y recarga
        ↓
✅ Usuario ve la versión actualizada — en un solo arranque
```

El "parpadeo" visible en el dispositivo es el `reloadAsync()` aplicando el bundle nuevo en tiempo real. Es el comportamiento correcto y esperado.

---

## 5. Lo que se hizo en esta sesión

| # | Acción | Resultado |
|---|--------|-----------|
| 1 | Diagnóstico: canal `preview-arm64` vs `production` | Causa raíz encontrada |
| 2 | Agregar `"channel": "production"` a `eas.json` | Canal sincronizado |
| 3 | Crear `src/hooks/use-ota-update.ts` | Hook de actualización forzada |
| 4 | Integrar hook en `_layout.tsx` | Activo en toda la app |
| 5 | Nuevo build `preview-arm64` con canal correcto | APK actualizado con el hook |
| 6 | Publicar 4 updates OTA de prueba | Flujo validado end-to-end ✅ |

### Builds generados esta sesión

| Build ID | Motivo |
|----------|--------|
| `a516cbd5-...` | Canal aún incorrecto (sin `channel` en perfil) |
| `7ca80026-...` | ✅ Canal correcto + hook integrado — **APK en uso** |

### Updates OTA publicados esta sesión

| Update Group ID | Mensaje | Resultado |
|-----------------|---------|-----------|
| `f6bf70e9-...` | Segunda actualizacion via EAS Update | No llegó (canal incorrecto) |
| `598e1ecf-...` | Agrega actualizacion forzada OTA al iniciar | No llegó (canal incorrecto) |
| `44ad95d2-...` | Tercera actualizacion - prueba hook OTA forzado | No llegó (canal incorrecto) |
| `5cc8e048-...` | Cuarta actualizacion - validacion OTA hook | ✅ Llegó y aplicó inmediatamente |

---

## 6. Regla de decisión actualizada

```
¿Qué tipo de cambio hice?
          │
          ├─── Solo .tsx / .ts / assets / lógica / estilos
          │           │
          │           ▼
          │    eas update --channel production --environment production
          │           │
          │           ▼
          │    App instalada recarga sola al siguiente arranque
          │    (hook descarga y aplica en ~3-5 segundos)
          │
          └─── Nuevo plugin / permiso / dependencia nativa / cambio en eas.json
                        │
                        ▼
                 eas build --platform android --profile preview-arm64
                        │
                        ▼
                 Nuevo APK → instalar en dispositivo (~10-15 min)
```

---

## 7. Próximos pasos

- Pantalla de detalle de evento (tocar tarjeta → ver info completa)
- Formatear fechas en español
- Mostrar aforo disponible
- Filtros por categoría y municipio
- Compra de boletos (`POST /api/v1/boletos`)
