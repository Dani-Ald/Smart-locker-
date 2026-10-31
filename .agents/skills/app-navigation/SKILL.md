---
name: app-navigation
description: Úsala siempre que crees, modifiques o revises navegación, pantallas, rutas o parámetros entre pantallas en App/Smart-Ticket.
---

# Navegación en Smart-Ticket

Navegación basada en Expo Router con rutas por archivos en `App/Smart-Ticket/src/app`.

## Reglas
- Consulta siempre la documentación oficial de Expo Router para la versión instalada del SDK con `context7`; no programes de memoria ni uses ejemplos de versiones distintas.
- La navegación es por archivos: las rutas y layouts (`_layout.tsx`) residen en `src/app`. Las pantallas reutilizables y la lógica de negocio van en `src/screens/`.
- Organiza los flujos mediante layouts y grupos de rutas entre paréntesis (por ejemplo, `(auth)`, `(tabs)`), sin alterar la URL pública cuando no corresponda.
- Usa rutas tipadas (`experiments.typedRoutes: true`): no uses `as any` ni strings sueltos en rutas dinámicas; usa objetos `{ pathname, params }` y valida los parámetros en ejecución.
- Gestiona la protección de rutas según el estado de sesión de forma centralizada en los layouts (por ejemplo, con `Stack.Protected`), evitando redirecciones redundantes o imperativas dentro de cada pantalla.
- Instala dependencias nativas con `npx expo install`, nunca con `npm install`, para mantener la compatibilidad con el SDK del proyecto.
- No cambies `constants/api.ts` ni la URL de la API.
- Reutiliza los componentes y pantallas existentes antes de crear otros nuevos.

## Checklist de revisión
- [ ] ¿Se consultó la documentación oficial de Expo Router con `context7`?
- [ ] ¿Las rutas y layouts (`_layout.tsx`, grupos como `(auth)`) están organizados en `src/app` y desacoplados de `src/screens`?
- [ ] ¿Las rutas y sus parámetros están tipados con `typedRoutes` sin `as any`?
- [ ] ¿La protección según sesión está centralizada en los layouts?
- [ ] ¿Pasan `expo lint` y `tsc` sin errores?
- [ ] ¿Funcionan el botón atrás, los deep links y el comportamiento sin sesión activa?
- [ ] ¿Se usó `npx expo install` y no se alteró `constants/api.ts`?

## Al terminar
Indica qué puntos del checklist comprobaste y cómo.
