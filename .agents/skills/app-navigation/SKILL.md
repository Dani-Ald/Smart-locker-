---
name: app-navigation
description: Úsala siempre que crees, modifiques o revises navegación, pantallas, rutas o parámetros entre pantallas en App/Smart-Ticket.
---

# Navegación en Smart-Ticket

## Reglas
- Instala las dependencias nativas con `npx expo install`, no con `npm install`, para que las versiones sean compatibles con la versión de Expo del proyecto.
- Antes de escribir código, consulta la documentación oficial de la versión instalada; no uses ejemplos de memoria.
- Tipa siempre las rutas y sus parámetros con TypeScript (el proyecto es estricto).
- Cada navegador en su propio archivo; las pantallas no definen navegadores.
- No cambies `constants/api.ts` ni la URL de la API.
- Reutiliza los componentes de pantalla existentes antes de crear otros.

## Checklist de revisión
- [ ] ¿Se usó `npx expo install` para las dependencias?
- [ ] ¿Los parámetros de ruta están tipados?
- [ ] ¿Pasan `expo lint` y `tsc` sin errores?
- [ ] ¿Funcionan el botón atrás y la apertura de la app sin sesión?
- [ ] ¿Se mantuvo el flujo de autenticación existente?

## Al terminar
Indica qué puntos del checklist comprobaste y cómo.