const nodemailer = require('nodemailer');

function cleanVal(v) {
  if (!v) return '';
  return String(v).replace(/^["']|["']$/g, '').trim();
}

/**
 * Crea el transporter de Nodemailer con configuración optimizada para producción/nube.
 */
function createSmtpTransporter() {
  const host = cleanVal(process.env.SMTP_HOST);
  const isGmail = host.includes('gmail');
  const port = Number(cleanVal(process.env.SMTP_PORT)) || (isGmail ? 465 : 587);
  const secure = cleanVal(process.env.SMTP_SECURE) === 'true' || (isGmail && port === 465);

  const config = {
    host,
    port,
    secure,
    auth: {
      user: cleanVal(process.env.SMTP_USER),
      pass: cleanVal(process.env.SMTP_PASS),
    },
    connectionTimeout: 10000,
    greetingTimeout: 7000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false,
    },
  };

  return nodemailer.createTransport(config);
}

/**
 * Prueba y diagnostica la conexión del proveedor de correo activo.
 */
async function testEmailConnection() {
  if (process.env.BREVO_API_KEY) {
    return {
      ok: true,
      provider: 'Brevo REST API (HTTPS port 443)',
      note: 'Conexión HTTPS libre de bloqueos de puertos.',
    };
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = createSmtpTransporter();
      await transporter.verify();
      return {
        ok: true,
        provider: process.env.SMTP_HOST.includes('brevo')
          ? 'Brevo SMTP'
          : process.env.SMTP_HOST.includes('gmail')
          ? 'Gmail SMTP'
          : 'SMTP Personalizado',
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
      };
    } catch (err) {
      return {
        ok: false,
        provider: 'SMTP',
        host: process.env.SMTP_HOST,
        error: err.message,
      };
    }
  }

  if (process.env.RESEND_API_KEY) {
    return {
      ok: true,
      provider: 'Resend API',
      note: 'Requiere dominio verificado para destinatarios generales.',
    };
  }

  return {
    ok: false,
    provider: 'Ninguno',
    error: 'No hay variables SMTP ni Resend configuradas en este entorno.',
  };
}

/**
 * Envía el correo transaccional con el código de 6 dígitos.
 *
 * Prioridad:
 *   1. SMTP (Gmail / Brevo / Custom)
 *   2. Resend API (HTTP directo)
 *
 * Si falla el envío real, lanza error en lugar de engañar al sistema con Ethereal.
 */
async function sendVerificationCode(destinatario, nombre, codigo) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 40px;">🎟️</span>
        <h2 style="color: #208AEF; margin: 8px 0 0 0; font-size: 24px;">Smart Ticket</h2>
      </div>
      <h3 style="color: #1e293b; font-size: 18px; margin-bottom: 8px;">¡Hola, ${nombre}! 👋</h3>
      <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
        Gracias por registrarte en Smart Ticket. Usa el siguiente código de 6 dígitos para verificar tu cuenta:
      </p>
      <div style="text-align: center; margin: 24px 0; background-color: #f1f5f9; padding: 16px; border-radius: 12px; border: 1px solid #cbd5e1;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #208AEF;">${codigo}</span>
      </div>
      <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 24px;">
        Este código expirará en 15 minutos.<br>
        Si no solicitaste este registro, puedes ignorar este mensaje.
      </p>
    </div>
  `;

  let lastError = null;

  // 1. Brevo REST API (HTTPS puerto 443 — NO se bloquea en ningún plan de Railway)
  const brevoApiKey = cleanVal(process.env.BREVO_API_KEY);
  if (brevoApiKey) {
    try {
      const remitenteEmail = cleanVal(process.env.BREVO_SENDER) || 'smart.ticket.contacto@gmail.com';
      const remitenteName = cleanVal(process.env.BREVO_SENDER_NAME) || 'Smart Ticket';

      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: remitenteName, email: remitenteEmail },
          to: [{ email: destinatario, name: nombre }],
          subject: `🎟️ Tu código de verificación es ${codigo}`,
          htmlContent: htmlContent,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`✉️ [Brevo REST API] Correo enviado a ${destinatario} (ID: ${data.messageId})`);
        return { delivered: true, provider: 'Brevo API', messageId: data.messageId };
      } else {
        console.error('❌ Error de respuesta de Brevo API:', data);
        lastError = new Error(data.message || JSON.stringify(data));
      }
    } catch (err) {
      console.error('❌ Error enviando correo con Brevo API:', err.message);
      lastError = err;
    }
  }

  // 2. SMTP tradicional (Gmail / Brevo)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = createSmtpTransporter();
      const remitente = process.env.SMTP_FROM || `"Smart Ticket" <${process.env.SMTP_USER}>`;

      const info = await transporter.sendMail({
        from: remitente,
        to: destinatario,
        subject: `🎟️ Tu código de verificación es ${codigo}`,
        html: htmlContent,
      });

      console.log(`✉️ [SMTP] Correo enviado exitosamente a ${destinatario}. MessageId: ${info.messageId}`);
      return { delivered: true, provider: 'SMTP', messageId: info.messageId };
    } catch (err) {
      console.error('❌ Error enviando correo con SMTP:', err.message);
      lastError = err;
    }
  }

  // 3. Resend API — fallback si está configurada la llave
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'Smart Ticket <onboarding@resend.dev>',
          to: [destinatario],
          subject: `🎟️ Tu código de verificación es ${codigo}`,
          html: htmlContent,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`✉️ [Resend API] Correo enviado exitosamente a ${destinatario} (ID: ${data.id})`);
        return { delivered: true, provider: 'Resend', id: data.id };
      } else {
        console.error('❌ Error de respuesta de Resend API:', data);
        lastError = new Error(data.message || 'Error en Resend API');
      }
    } catch (err) {
      console.error('❌ Error enviando correo con Resend API:', err.message);
      lastError = err;
    }
  }

  // Log visible del código en consola para desarrollo/debug
  console.log(`🔑 [Smart Ticket] CÓDIGO DE VERIFICACIÓN PARA ${destinatario}: [ ${codigo} ]`);

  // Lanzar error real si ningún proveedor pudo entregar
  const msg = lastError ? lastError.message : 'No hay proveedor SMTP ni Resend configurado';
  const error = new Error(msg);
  error.codigoVerificacion = codigo;
  throw error;
}

module.exports = {
  sendVerificationCode,
  testEmailConnection,
};
