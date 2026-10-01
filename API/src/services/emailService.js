const nodemailer = require('nodemailer');

/**
 * Envía el correo transaccional con el código de 6 dígitos.
 *
 * Prioridad:
 *   1. Gmail SMTP (SMTP_HOST + SMTP_USER) — funciona sin dominio propio ✅
 *   2. Resend API (RESEND_API_KEY) — requiere dominio verificado en resend.com
 *   3. Ethereal (fallback de pruebas, sin entrega real)
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

  // 1. Gmail SMTP — prioridad alta, no requiere dominio verificado
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Smart Ticket" <${process.env.SMTP_USER}>`,
        to: destinatario,
        subject: `🎟️ Tu código de verificación es ${codigo}`,
        html: htmlContent,
      });

      console.log(`✉️ [Gmail SMTP] Correo enviado a ${destinatario}. MessageId: ${info.messageId}`);
      return info;
    } catch (err) {
      console.error('❌ Error enviando correo con Gmail SMTP:', err.message);
    }
  }

  // 2. Resend API — requiere dominio verificado en resend.com/domains
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
        console.log(`✉️ [Resend API] Correo enviado a ${destinatario} (ID: ${data.id})`);
        return data;
      } else {
        console.error('❌ Error de respuesta de Resend API:', data);
      }
    } catch (err) {
      console.error('❌ Error enviando correo con Resend API:', err.message);
    }
  }

  // 3. Fallback Ethereal — solo desarrollo, no entrega correos reales
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });

    const info = await transporter.sendMail({
      from: '"Smart Ticket" <no-reply@smartticket.com>',
      to: destinatario,
      subject: `🎟️ Tu código de verificación es ${codigo}`,
      html: htmlContent,
    });

    console.log(`✉️ [Ethereal] Correo de prueba. Código: ${codigo}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`🔗 Vista previa (Ethereal): ${previewUrl}`);
    return info;
  } catch (error) {
    console.error('❌ Error en el servicio de correo:', error.message);
    console.log(`🔑 CÓDIGO DE VERIFICACIÓN (Consola Fallback): ${codigo} para ${destinatario}`);
  }
}

module.exports = { sendVerificationCode };
