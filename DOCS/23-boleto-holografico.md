# Sesión 23 — Rediseño holográfico de boletos

## Objetivo

Adaptar a React Native el ejemplo de ticket holográfico de uiverse.io, manteniendo intactos el flujo de navegación, los datos del boleto, la disponibilidad del QR y las acciones de detalle.

## Cambios

- Se creó `HoloTicket`, componente visual reutilizable para variantes destacada, compacta y detalle.
- El fondo holográfico usa SVG con sectores de color, reflejo, muescas, perforaciones y línea punteada. Se omitió `#bump`: `feTurbulence` y `feSpecularLighting` no están soportados en nativo por `react-native-svg`.
- Se añadió un brillo animado solo para el boleto destacado y respetando la preferencia de reducir movimiento.
- La lista conserva el boleto próximo destacado y presenta los siguientes en formato compacto.
- El detalle muestra el QR existente dentro del ticket, junto con fecha y lugar; las acciones de mapa y soporte se mantienen fuera de la tarjeta.
- No se añadieron dependencias ni se modificaron navegación, configuración Expo, icono ni publicación.

## Verificación

- `npm run lint`
- `npx tsc --noEmit`

Ambos comandos deben completarse sin errores. La revisión visual en dispositivos Android/iOS queda pendiente de ejecutar en simulador o dispositivo físico.
