# Política de seguridad

## Reportes

No abras un issue público con credenciales, payloads QR reales o detalles explotables. Utiliza un **GitHub Private Vulnerability Report** del repositorio.

Incluye versión, plataforma, pasos mínimos de reproducción e impacto. Elimina tokens, correos, folios y claves de cualquier captura o registro.

## Secretos

- Los secretos del backend viven únicamente en `API/.env` o en el proveedor de despliegue.
- La clave privada Ed25519 nunca debe distribuirse con la app.
- Ante una filtración, rota inmediatamente la clave afectada y cambia `QR_KEY_ID`.
- No publiques códigos OTP ni tokens de sesión en producción.
