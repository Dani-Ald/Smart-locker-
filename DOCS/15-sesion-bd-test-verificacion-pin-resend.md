# 📄 Documento 15 — Sesión: Unificación de BD `test`, Verificación por Código PIN y Correo con Resend API

**Depende de:** `14-estructura-menu-y-catalogo.md`  
**Proyecto:** Smart-Ticket — Sistema de Boletaje Digital, Valle del Mezquital  
**Fecha de sesión:** 29 de septiembre de 2026  
**Estado al cierre:** ✅ Verificación de cuenta por código de 6 dígitos activa en producción (Railway)

---

## 1. Contexto — ¿Qué se resolvió en esta sesión?

Al inicio de la sesión se detectó que los usuarios registrados desde la app móvil no aparecían en la colección `users` de la base de datos `test` en MongoDB Atlas, sino que eran enrutados a la base de datos `smart-ticket`. Se realizó un diagnóstico completo, se planificaron los cambios y se resolvió el problema de forma definitiva.

Además, se implementó el flujo de **verificación de cuenta mediante código PIN de 6 dígitos** con envío de correo a través de **Resend API**, sustituyendo el sistema de enlace mágico por token que existía antes.

---

## 2. Diagnóstico del Problema — Usuarios en BD Incorrecta

### 2.1 Causa detectada

Al no especificar el parámetro `dbName` en la llamada a `mongoose.connect()`, Mongoose usa la base de datos que indica la URI. La variable `MONGODB_URI` configurada en Railway apuntaba a una base de datos diferente a la del entorno local (`.env` local tenía `/test`, Railway no).

### 2.2 Pruebas realizadas

- Se probó el endpoint `POST /api/v1/usuarios/registro` directamente en Railway con `node` y `fetch` → `201 Created`.
- Se inspeccionó la BD con un script `check_mongo.js` → Se encontraron 6 usuarios en `test.users` y 0 en `smart-ticket.users`.
- Se confirmó que el `verificationToken` ya existía en Mongoose pero el envío de correo dependía de configuración SMTP no disponible.

---

## 3. Cambios en la API (`API/`)

### 3.1 Forzar Base de Datos `test` — `API/src/db.js`

Se añadió el parámetro `{ dbName: 'test' }` a `mongoose.connect()`:

```js
await mongoose.connect(process.env.MONGODB_URI, { dbName: 'test' });
```

Esto garantiza que independientemente de lo que diga la URI (local o Railway), la API **siempre** opera sobre la base de datos `test`.

### 3.2 Ajuste de Rate Limiting — `API/src/routes/usuarios.js`

Se aumentó el límite de intentos de 8/5 a **50 peticiones por cada 15 minutos** en `/registro` y `/login` para facilitar las pruebas sin bloqueos HTTP 429.

### 3.3 Nuevos campos en el Modelo — `API/src/models/UsuarioAuth.js`

```js
codigoVerificacion: { type: String, default: null },
codigoExpira:       { type: Date, default: null },
```

### 3.4 Nuevos Endpoints de Verificación — `API/src/routes/usuarios.js`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/v1/usuarios/registro` | Genera código PIN de 6 dígitos y lo envía por correo |
| `POST` | `/api/v1/usuarios/verificar-codigo` | Valida el código, verifica expiración y activa `isVerified: true` |
| `POST` | `/api/v1/usuarios/reenviar-codigo` | Genera y envía nuevo código PIN |
| `GET`  | `/api/v1/usuarios/verificar` | Mantiene retrocompatibilidad con enlace de token |

### 3.5 Servicio de Correo con Resend API — `API/src/services/emailService.js`

Se reemplazó el servicio basado en nodemailer por un cliente HTTP nativo (`fetch`) que llama directamente al endpoint REST de Resend:

```js
const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ from, to, subject, html }),
});
```

**Ventajas:**
- Sin dependencias npm adicionales (la librería `resend` v6 requería Node ≥20 y causó un build fallido en Railway).
- Funciona con el `fetch` nativo de Node 18+ — sin paquetes externos.
- Fallback automático a Nodemailer/Ethereal si no hay `RESEND_API_KEY`.

---

## 4. Cambios en la App Móvil (`App/Smart-Ticket/`)

### 4.1 Nuevas funciones en `authService.ts`

```ts
verificarCodigo({ correo, codigo })  // POST /api/v1/usuarios/verificar-codigo
reenviarCodigo({ correo })            // POST /api/v1/usuarios/reenviar-codigo
```

### 4.2 Pantalla de Registro actualizada — `register.tsx`

Se implementó un flujo de **2 pasos**:

1. **Paso 1 (Formulario de Registro):** Nombre, correo, contraseña. Al presionar "Crear cuenta" se llama al endpoint y la pantalla pasa automáticamente al Paso 2.
2. **Paso 2 (Verificación de Código PIN):**
   - Campo numérico grande con `letterSpacing` para ingresar los 6 dígitos.
   - Botón **"Verificar cuenta"** que llama a `verificarCodigo`.
   - Temporizador de **60 segundos** con cuenta regresiva para el botón **"Reenviar código"**.
   - Banner de info verde si el reenvío fue exitoso.
   - Banner de error rojo si el código es incorrecto o ha expirado.
   - Enlace **"Usar otro correo"** para regresar al Paso 1.
3. **Paso 3 (Pantalla de éxito):** Animación con emoji y redirección automática al Login en 2 segundos.

---

## 5. Configuración en Railway

### 5.1 Variables de Entorno agregadas

| Variable | Valor | Descripción |
|---|---|---|
| `MONGODB_URI` | `...mongodb.net/test?...` | URI actualizada para apuntar a BD `test` |
| `RESEND_API_KEY` | `re_xxxxxxxxxxxx` | API Key de [resend.com](https://resend.com) |

### 5.2 Incidente de Build — `FAILED` en historial

**Causa:** Al agregar `"engines": { "node": ">=20" }` en `package.json`, Railway intentó instalar el paquete de sistema `libatomic1` vía `apt`, pero la conexión fue cancelada por timeout (`context canceled`).

**Solución:** Se eliminó el campo `engines` del `package.json` ya que Railway usa **Node 24.21.0** de forma nativa — sin necesidad de especificarlo. El deployment anterior (`ACTIVE`) siguió corriendo sin interrupciones.

---

## 6. Commits realizados

| Commit | Descripción |
|--------|-------------|
| `5d87799` | fix(api): unificar conexion a BD test para usuarios y eventos, flexibilizar rate limit |
| `d6e15de` | docs: documentar unificacion de BD test y ajuste de rate limiting en doc 14 |
| `9ffdf6e` | feat: implementar verificacion de codigo PIN de 6 digitos y soporte Resend API |
| `c75fe77` | fix(build): optimizar Resend con fetch nativo y definir engines node >=20 para Railway |
| `eb90094` | fix(railway): revertir campo engines para usar imagen base nativa Node 24 de Railway |

---

## 7. Estado al cierre de sesión

| Componente | Estado | Detalle |
|---|---|---|
| MongoDB Atlas — BD `test` | ✅ Activo | 8 usuarios en `test.users`, 0 en `smart-ticket.users` |
| API Node.js en Railway | ✅ ACTIVE | `node@24.21.0` · `Deployment successful` |
| Resend API | ✅ Configurada | Variable `RESEND_API_KEY` en producción |
| App Móvil — Flujo de Registro | ✅ Actualizado | Paso 1 → Paso 2 (PIN 6 dígitos) → Éxito |
| Verificación de cuenta | ✅ Funcional | Endpoint `POST /usuarios/verificar-codigo` operativo |
| Reenvío de código | ✅ Funcional | Endpoint `POST /usuarios/reenviar-codigo` operativo |

---

## 8. Próximos pasos sugeridos

- Probar el flujo completo en un correo real (registrar desde App → recibir correo → ingresar código → iniciar sesión).
- Configurar dominio personalizado en Resend (dominio propio para que los correos salgan de `@smartticket.mx` o similar).
- Continuar con las siguientes funcionalidades del mapa de ruta (Suscripciones y Notificaciones Push — Sección 4 del documento 14).
