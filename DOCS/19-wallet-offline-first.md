# Wallet móvil offline-first

## Arquitectura

1. Al abrir la wallet se consulta SQLite antes de depender de red.
2. Si existe conectividad, `GET /api/v1/boletos/mios` actualiza la caché dentro de una transacción.
3. Cada cuenta consulta únicamente filas con su `owner_id`.
4. El QR se genera en el dispositivo desde `qrPayload`; nunca se descarga como imagen.
5. La API firma el sobre QR con Ed25519. Los validadores obtienen la clave pública desde `/api/v1/boletos/clave-publica`.

El modo offline garantiza disponibilidad, no revocación en tiempo real. Un validador presencial debe sincronizar previamente boletos cancelados/usados antes del evento.

## Configuración de API

Genera un par de claves fuera del repositorio:

```bash
cd API
npm run keys:qr
```

Copia los valores directamente al proveedor de despliegue. Configura además `OTP_PEPPER` con un valor aleatorio independiente. Nunca guardes estos valores en documentación o Git.

## Prueba en modo avión

- [ ] Iniciar sesión y sincronizar al menos un boleto pagado.
- [ ] Cerrar completamente la app.
- [ ] Activar modo avión.
- [ ] Abrir la app y confirmar que aparece el boleto almacenado.
- [ ] Abrir el detalle y verificar que el QR se renderiza sin solicitudes HTTP.
- [ ] Confirmar que el brillo sube y se restaura al volver.
- [ ] Confirmar que “Cómo llegar” falla de forma controlada si el proveedor de mapas requiere red.
- [ ] Confirmar que una reseña informa que requiere conexión.
- [ ] Volver a activar red y validar sincronización automática.
- [ ] Cambiar de cuenta y verificar que no aparecen boletos del usuario anterior.

## Pruebas de seguridad

- [ ] Un token ausente, revocado o expirado recibe 401.
- [ ] Un OTP expira y se bloquea después del límite de intentos.
- [ ] Producción nunca devuelve `codigoDev`.
- [ ] Una reseña sin boleto usado recibe 403.
- [ ] Alterar cualquier byte del payload o firma invalida el QR en el validador.
- [ ] La app no contiene `QR_ED25519_PRIVATE_KEY`.
