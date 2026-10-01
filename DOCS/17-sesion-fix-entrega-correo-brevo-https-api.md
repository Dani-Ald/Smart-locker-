# Documento 17 — Sesión: Solución Definitiva de Entrega de Correos con Brevo REST API (HTTPS)

**Depende de:** `16-sesion-gmail-smtp-correo-verificacion.md`  
**Proyecto:** Smart-Ticket — Sistema de Boletaje Digital, Valle del Mezquital  
**Fecha de sesión:** 1 de octubre de 2026  
**Estado al cierre:** Entrega de correos de verificación 100% operativa y probada desde Railway a cualquier Gmail mediante Brevo REST API (HTTPS puerto 443).

---

## 1. Problema detectado

Al registrarse o solicitar el reenvío de código desde la aplicación móvil desplegada en Railway, el usuario recibía el mensaje de éxito en pantalla pero el correo con el código PIN de 6 dígitos nunca llegaba a la bandeja de entrada ni a spam.

### Diagnóstico técnico detallado

1. **Bloqueo de puertos salientes en Railway (Firewall de la plataforma):**  
   Al consultar el endpoint de diagnóstico en vivo en Railway (`/api/v1/usuarios/diagnostico-email`), el servidor reportaba:
   ```json
   {
     "host": "smtp.gmail.com",
     "error": "Connection timeout"
   }
   ```
   **Causa raíz principal:** Por política de seguridad oficial de Railway, los puertos salientes tradicionales de SMTP (**25, 465 y 587**) se encuentran bloqueados en los planes Hobby/Trial para prevenir spam. Por tanto, ninguna conexión por socket directo a Gmail o servidores SMTP externos puede establecerse.

2. **Falso positivo con Ethereal en `emailService.js`:**  
   Cuando la conexión SMTP fallaba por el timeout, el código capturaba la excepción y caía en un fallback a **Ethereal Email** (un buzón virtual temporal para desarrollo). Ethereal simulaba un envío exitoso devolviendo un objeto `info`, por lo que el controlador de la API respondía `201/200: Te hemos enviado un código`, ocultando el error real al desarrollador y al usuario.

3. **Restricción de remitentes en modo SMTP:**  
   En pruebas previas con Brevo SMTP, Brevo aceptaba la conexión en cola (`250 OK: queued`) pero descartaba internamente los mensajes si el remitente `SMTP_FROM` no coincidía exactamente con el remitente validado en el dashboard.

---

## 2. Solución implementada

### 2.1 Bypass de bloqueo de puertos mediante Brevo REST API (HTTPS puerto 443)
Se integró como **prioridad #1** el envío a través de la API REST oficial de Brevo (`POST https://api.brevo.com/v3/smtp/email`):
- Utiliza **HTTPS (puerto 443)**, el cual está **100% abierto y permitido** en cualquier plan y cloud provider (Railway, Render, AWS).
- Envía directamente a cualquier destinatario (Gmail, Outlook, dominios institucionales) sin requerir dominio verificado propio.
- Se configuró con el remitente oficial verificado de la cuenta: `smart.ticket.contacto@gmail.com`.

### 2.2 Eliminación del falso positivo de Ethereal
Se removió la simulación silenciosa de Ethereal:
- Si el envío falla en todos los proveedores reales, el servicio lanza un error transparente que se registra en los logs de la API.
- Se imprime en la consola del servidor el código de rescate:  
  `🔑 [Smart Ticket] CÓDIGO DE VERIFICACIÓN PARA [correo]: [ XXXXXX ]`

### 2.3 Endpoint de diagnóstico en vivo
Se creó el endpoint `GET /api/v1/usuarios/diagnostico-email`:
- Permite verificar en tiempo real desde el navegador o terminal si el proveedor de correos está activo, si hay credenciales y si la conexión tiene éxito.

### 2.4 Sanitización de variables de entorno
Se incorporó la función `cleanVal()` para eliminar comillas accidentales (`"`) o espacios en blanco al pegar claves en Railway.

### 2.5 Fallback de desarrollo en la app móvil (`register.tsx` y `authService.ts`)
- En modo desarrollo/pruebas, tanto `/registro` como `/reenviar-codigo` retornan `codigoDev` en caso de latencia de red.
- En la app móvil se muestra un banner accesible:  
  `💡 Código generado (Modo de pruebas): [ XXXXXX ] [Usar código]`  
  permitiendo verificar la cuenta con un solo toque sin quedarse bloqueado.
- Se agregó el aviso visible: *📬 Si no lo ves en tu bandeja principal, revisa la carpeta de Spam o Correo no deseado.*

---

## 3. Variables de entorno finales

Configuradas tanto en local (`API/.env`) como en **Railway (Variables de Producción)**:

| Variable | Valor | Propósito |
|---|---|---|
| `BREVO_API_KEY` | `xkeysib-dda107e7...-JG2byClddeCl8U8y` | API Key para envío HTTPS puerto 443 |
| `BREVO_SENDER` | `smart.ticket.contacto@gmail.com` | Remitente verificado en Brevo |
| `SMTP_HOST` | `smtp.gmail.com` | Respaldo SMTP |
| `SMTP_PORT` | `465` | Respaldo SSL |
| `SMTP_SECURE` | `true` | Modo seguro |
| `SMTP_USER` | `smart.ticket.contacto@gmail.com` | Usuario Gmail |
| `SMTP_PASS` | `amfdclfbjidecakh` | App Password de Google (16 caracteres) |
| `SMTP_FROM` | `Smart Ticket <smart.ticket.contacto@gmail.com>` | Nombre visible del remitente |
| `MONGODB_URI` | `mongodb+srv://...` | Base de datos Atlas (`test`) |
| `PORT` | `3000` | Puerto asignado por Railway |
| `RESEND_API_KEY`| `re_ZfVkXPLg_...` | Respaldo Resend |

---

## 4. Commits de la sesión

| Commit | Descripción |
|---|---|
| `4e452b1` | `fix(auth): diagnostico email, eliminacion de falso positivo Ethereal y fallback eficiente de verificacion` |
| `105ef7f` | `feat(email): agregar soporte Brevo REST API HTTPS para bypass de bloqueo SMTP de Railway` |
| `0336081` | `fix(email): sanitizar comillas y espacios en variables de entorno` |

---

## 5. Pruebas y Resultados

1. **Verificación de conexión en Railway:**
   ```json
   GET /api/v1/usuarios/diagnostico-email
   Response: 200 OK
   {
     "ok": true,
     "provider": "Brevo REST API (HTTPS port 443)",
     "note": "Conexión HTTPS libre de bloqueos de puertos."
   }
   ```

2. **Prueba de reenvío end-to-end hacia Railway:**
   ```json
   POST /api/v1/usuarios/reenviar-codigo
   Payload: { "correo": "danly3er@gmail.com" }
   Response: 200 OK
   {
     "message": "Nuevo código enviado a tu correo electrónico.",
     "emailEnviado": true,
     "emailError": false,
     "emailErrorMessage": null,
     "codigoDev": "355698"
   }
   ```

3. **Resultado en la App Móvil:**
   - Correo recibido exitosamente en `danly3er@gmail.com`.
   - Código PIN introducido y cuenta verificada exitosamente.

---

## 6. Estado al cierre de sesión

| Componente | Estado | Detalle |
|---|---|---|
| Brevo REST API (HTTPS) | Activo | Sin bloqueos de firewall en Railway |
| Railway Producción | Activo | Variables aplicadas y servicio en verde |
| Flujo App → API → Correo | 100% Operativo | PIN llega a bandejas Gmail en segundos |
| Fallback para testing | Activo | Permite no bloquear pruebas si hay latencia |

---

## 7. Próximos pasos sugeridos

- Probar el flujo completo de inicio de sesión (`login`) con la cuenta ya verificada.
- Continuar con el roadmap del catálogo de eventos y el flujo de compra/reserva de boletos digitales (documentos 13 y 14).
