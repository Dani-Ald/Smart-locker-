const nodemailer = require('nodemailer');

/**
 * Servicio para envío de correos transaccionales (Verificación de cuenta, etc.)
 */
async function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: Ethereal test SMTP (si no se configuran llaves SMTP en .env)
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

/**
 * Envía el correo de verificación al nuevo usuario.
 */
async function sendVerificationEmail(destinatario, nombre, token) {
  try {
    const transporter = await createTransporter();
    const appUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`;
    const verificationUrl = `${appUrl}/api/v1/usuarios/verificar?token=${token}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #208AEF; text-align: center;">Smart Ticket</h2>
        <h3>¡Hola, ${nombre}! 👋</h3>
        <p>Gracias por registrarte en <strong>Smart Ticket</strong>. Para activar completamente tu cuenta, por favor confirma tu correo electrónico haciendo clic en el siguiente botón:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #208AEF; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verificar mi cuenta</a>
        </div>
        <p style="font-size: 12px; color: #64748b; text-align: center;">
          Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Smart Ticket" <${process.env.SMTP_FROM || 'no-reply@smartticket.com'}>`,
      to: destinatario,
      subject: '🎟️ Confirma tu correo electrónico - Smart Ticket',
      html: htmlContent,
    });

    console.log(`✉️ Correo de verificación enviado a: ${destinatario}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 Vista previa del correo enviada (Ethereal): ${previewUrl}`);
    }
    console.log(`🔗 Enlace directo de verificación: ${verificationUrl}`);
    return info;
  } catch (error) {
    console.error('❌ Error enviando correo de verificación:', error.message);
  }
}

module.exports = {
  sendVerificationEmail,
};
