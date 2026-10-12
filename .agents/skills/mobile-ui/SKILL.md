---
name: mobile-ui
description: Úsala siempre que crees o modifiques pantallas, componentes visuales, estilos, colores, tipografía, animaciones o iconos en App/Smart-Ticket.
---

# Diseño móvil en Smart-Ticket

Complementa a @frontend-design (criterio estético). Aquí van las reglas específicas de React Native y Expo.

## Antes de diseñar
- Revisa el estilo actual de la app y reutilízalo. Si no hay un sistema, créalo en un único archivo de tema (colores, tipografía, espaciado, radios, sombras). Nunca valores sueltos en las pantallas.
- Elige una dirección visual clara (moderna, con un color de acento) y mantenla en todas las pantallas.

## Reglas
- Soporta modo claro y oscuro con `useColorScheme`.
- Respeta las safe areas y usa áreas táctiles de al menos 44 pt.
- Contraste mínimo AA, `accessibilityLabel` en botones e iconos y textos que escalen.
- Cada pantalla con datos tiene estado de carga, vacío y error.
- Animaciones sutiles (150-300 ms). No añadas librerías nuevas sin preguntar.
- Prueba en pantalla pequeña y en Android e iOS.

## Checklist de revisión
- [ ] ¿Todo sale del archivo de tema?
- [ ] ¿Se ve bien en modo oscuro y en pantalla pequeña?
- [ ] ¿Están los estados de carga, vacío y error?
- [ ] ¿Son accesibles los elementos táctiles?

## Al terminar
Indica qué puntos del checklist comprobaste y cómo.