# 📱 Plan de Implementación — App Móvil Smart-Ticket
> Sesión 13 · Fecha de inicio: 2026-09-24

Referencia base: `App/analisis_web_entrada.md`

---

## 🎯 Objetivo de esta fase

Implementar en la app móvil (Expo SDK 57 + React Native + TypeScript + Expo Router) todas las
funcionalidades ya probadas en la web **"Entrada"**: autenticación, registro, listado de eventos
y dashboard de usuario autenticado, consumiendo la misma API REST que corre en Railway.

---

## 🗺 Arquitectura de navegación (Expo Router)

```
app/
├── (auth)/
│   ├── _layout.tsx        ← Stack sin header
│   ├── login.tsx          ← LoginScreen
│   └── register.tsx       ← RegisterScreen
├── (tabs)/
│   ├── _layout.tsx        ← Tab navigator (solo para usuarios autenticados)
│   ├── index.tsx          ← HomeScreen  (carrusel + catálogo de eventos)
│   └── dashboard.tsx      ← DashboardScreen (stats + lista personalizada)
├── event/
│   └── [id].tsx           ← EventDetailScreen
├── _layout.tsx            ← Root layout (fuentes, splash, auth guard)
└── index.tsx              ← Redirect guard (autenticado → tabs / no → login)
```

---

## 📦 Dependencias a instalar

```bash
# Almacenamiento seguro de sesión
npx expo install expo-secure-store

# Formularios y validación
npm install react-hook-form yup @hookform/resolvers

# Notificaciones toast
npm install react-native-toast-message
```

> **Nota:** `react-native-reanimated`, `expo-router`, `expo-splash-screen` ya están instalados.

---

## ✅ Pasos de implementación

### Fase 1 — Infraestructura base

- [x] **1.1** `src/constants/api.ts` — Exportar `API_BASE_URL` (Railway)
- [x] **1.2** `src/services/authService.ts` — `login()`, `register()`
- [x] **1.3** `src/services/eventService.ts` — `getEvents()`
- [x] **1.4** `src/hooks/useSession.ts` — Leer/escribir `SecureStore` (token, nombre, correo, id)
- [x] **1.5** `app/_layout.tsx` — Root layout con auth guard y redirect

### Fase 2 — Pantallas de autenticación

- [x] **2.1** `app/(auth)/login.tsx` — Formulario + validación + manejo errores 400/401/429
- [x] **2.2** `app/(auth)/register.tsx` — Formulario + validación + errores 400/409

### Fase 3 — Pantalla principal (Home)

- [x] **3.1** `app/(tabs)/index.tsx` — Carrusel, FlatList 2 columnas, buscador, filtro por categoría
- [x] **3.2** `src/components/EventCard.tsx` — Tarjeta de evento reutilizable

### Fase 4 — Dashboard del usuario

- [x] **4.1** `app/(tabs)/dashboard.tsx` — Stats (total eventos, próx. 30 días, categorías), logout

### Fase 5 — Detalle de evento

- [ ] **5.1** `app/event/[id].tsx` — Imagen full-width, info completa, botón "Comprar" (placeholder)

### Fase 6 — Crear evento (organizador)

- [ ] **6.1** `app/(tabs)/create-event.tsx` — Formulario completo, `POST /api/events`

### Fase 7 — Pulido

- [ ] **7.1** `src/constants/theme.ts` — Tokens de color, tipografía, spacing
- [ ] **7.2** Toast global de errores/éxitos
- [ ] **7.3** Empty states y estados de error
- [ ] **7.4** Animaciones con `react-native-reanimated`
- [ ] **7.5** EAS Update para OTA

---

## 📋 Orden de ejecución sugerido

```
Fase 1 → Fase 2 → Fase 3 (sin filtros) → Fase 4 → Fase 5 → Fase 3 (con filtros) → Fase 6 → Fase 7
```

Prioridad: tener el flujo completo **login → ver eventos → dashboard → logout** antes de extras.

---

## 🔗 Referencias

- `App/analisis_web_entrada.md` — Funcionalidades de la web a migrar
- `DOCS/02-contrato-de-api.md` — Endpoints disponibles
- `DOCS/01-modelo-datos-y-arquitectura.md` — Modelos de datos
- `DOCS/08-sesion-deploy-railway-y-eas.md` — URL de la API en Railway

---

## 📝 Notas de sesión

| Fecha | Nota |
|---|---|
| 2026-09-24 | Documento creado. App web analizada, plan definido. Pendiente iniciar Fase 1. |




