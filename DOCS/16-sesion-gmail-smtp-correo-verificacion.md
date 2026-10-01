# Documento 16 - Sesion: Fix de Entrega de Correos con Gmail SMTP

**Depende de:** `15-sesion-bd-test-verificacion-pin-resend.md`
**Proyecto:** Smart-Ticket - Sistema de Boletaje Digital, Valle del Mezquital
**Fecha de sesion:** 30 de septiembre de 2026
**Estado al cierre:** Correos de verificacion PIN entregados a cualquier Gmail via SMTP

---

## 1. Problema detectado

Los usuarios registrados desde la app no recibian el correo con el codigo PIN de 6 digitos.
La pantalla de verificacion se mostraba correctamente pero el inbox permanecia vacio.

### Diagnostico

Se probo la Resend API directamente con `node -e "fetch(...)"`:

```json
{
  "statusCode": 403,
  "name": "validation_error",
  "message": "You can only send testing emails to your own email address (230110150@itsoeh.edu.mx). To send emails to other recipients, please verify a domain at resend.com/domains"
}
```

**Causa raiz:** Resend en modo sin dominio verificado solo puede enviar al correo del dueno de la cuenta.
Cualquier otro destinatario (Gmail, Hotmail, etc.) recibe un 403.

---

## 2. Solucion implementada - Gmail SMTP

Se configuro Gmail SMTP con una cuenta dedicada del proyecto usando una Contrasena de Aplicacion de Google.

### 2.1 Variables de entorno agregadas

**Local (API/.env) y Railway (produccion):**

| Variable | Valor |
|---|---|
| SMTP_HOST | smtp.gmail.com |
| SMTP_PORT | 587 |
| SMTP_SECURE | false |
| SMTP_USER | smart.ticket.contacto@gmail.com |
| SMTP_PASS | [App Password 16 chars] |
| SMTP_FROM | Smart Ticket <smart.ticket.contacto@gmail.com> |

### 2.2 Cambio en emailService.js - Nueva prioridad

| Prioridad | Metodo | Condicion | Estado |
|---|---|---|---|
| 1 | Gmail SMTP | SMTP_HOST + SMTP_USER presentes | Activo |
| 2 | Resend API | RESEND_API_KEY presente | Solo si dominio verificado |
| 3 | Ethereal | Sin configuracion SMTP | Solo desarrollo |

**Antes:** Resend primero → falla silenciosamente → cae a Ethereal (no entrega).
**Despues:** Gmail SMTP primero → entrega real a cualquier correo.

---

## 3. Resultado

Correo recibido exitosamente en danly3er@gmail.com:
- Remitente: Smart Ticket <smart.ticket.contacto@gmail.com>
- Asunto: Tu codigo de verificacion es 847291
- Diseno HTML con codigo grande y espaciado
- Aviso de expiracion a 15 minutos

---

## 4. Commit

| Commit | Descripcion |
|---|---|
| `5b7eb73` | fix(email): priorizar Gmail SMTP sobre Resend para envio sin dominio verificado |

---

## 5. Estado al cierre de sesion

| Componente | Estado | Detalle |
|---|---|---|
| MongoDB Atlas - BD test | Activo | |
| API Node.js en Railway | ACTIVE | Con redeploy post-commit |
| Gmail SMTP | Configurado | smart.ticket.contacto@gmail.com |
| Resend API | Desactivado temporalmente | Requiere dominio verificado |
| Correo de verificacion | Funcional | Llega a cualquier correo |
| Flujo completo App → API → Correo | Probado | PIN recibido y verificado |

---

## 6. Proximos pasos sugeridos

- Probar flujo completo end-to-end desde la app: registro → correo → PIN → login.
- Verificar que Railway redeploy termino con las nuevas variables SMTP.
- A futuro: configurar dominio propio en Resend (mas profesional que Gmail).
- Continuar con roadmap (doc 14): Suscripciones y Notificaciones Push.
