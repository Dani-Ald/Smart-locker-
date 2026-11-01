# Changelog

## Unreleased

### Added

- Wallet móvil offline con caché SQLite.
- Inicio de sesión con correo y contraseña, verificación de cuenta por código y sesiones revocables.
- QR local firmado con Ed25519 y brillo de presentación.
- Historial, reseñas verificadas y bloqueo biométrico opcional.
- Redirecciones web para compras y publicación de eventos.
- Icono BOT y animación breve de apertura.
- Rediseño Liquid Glass adaptable y animado para el inicio de sesión.
- Panel temporal de diagnóstico para la sincronización de boletos en la wallet.

### Fixed

- La API deja de imprimir la URI de MongoDB en los logs del despliegue.
- Proporción del icono BOT en launchers Android/iOS y pantallas de autenticación.
- Diseño unificado para inicio de sesión, registro y verificación de cuenta.
- Mensajes claros cuando la API de autenticación no está disponible o agota el tiempo de espera.
- Inicio de sesión tolerante al arranque en frío del servicio gratuito de Render.
