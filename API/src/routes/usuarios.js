/**
 * routes/usuarios.js — Endpoints de autenticación para usuarios compradores.
 *
 * Rutas:
 *   POST /api/v1/usuarios/registro          -> Crear cuenta nueva y enviar código de 6 dígitos
 *   POST /api/v1/usuarios/verificar-codigo  -> Confirmar código PIN de 6 dígitos
 *   POST /api/v1/usuarios/reenviar-codigo   -> Solicitar nuevo código de 6 dígitos
 *   GET  /api/v1/usuarios/verificar         -> Confirmar vía enlace (retrocompatibilidad)
 *   POST /api/v1/usuarios/login            -> Iniciar sesión
 */
const express = require('express');
const crypto  = require('crypto');
const rateLimit = require('express-rate-limit');
const Usuario = require('../models/UsuarioAuth');
const { sendVerificationCode } = require('../services/emailService');

const router = express.Router();

// -- Rate limiting -------------------------------------------------------

const limiterRegistro = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Demasiados intentos de registro. Inténtalo en unos minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Demasiados intentos. Inténtalo en unos minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// -- Utilidades ----------------------------------------------------------

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const hashVerify = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashVerify, 'hex'));
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generate6DigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// -- POST /api/v1/usuarios/registro ------------------------------------

router.post('/registro', limiterRegistro, async (req, res) => {
  const { nombre, correo, password, passwordConfirm } = req.body;

  if (!nombre || !correo || !password || !passwordConfirm) {
    return res.status(400).json({ error: 'Todos los campos son requeridos.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo.trim())) {
    return res.status(400).json({ error: 'El formato del correo electrónico es inválido.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }
  if (password !== passwordConfirm) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
  }

  try {
    const existe = await Usuario.findOne({ correo: correo.toLowerCase() });
    if (existe) {
      return res.status(409).json({ error: 'Ese correo ya está registrado.' });
    }

    const passwordHash = hashPassword(password);
    const verificationToken = generateToken();
    const codigoVerificacion = generate6DigitCode();
    const codigoExpira = new Date(Date.now() + 15 * 60 * 1000); // Expiración a los 15 minutos

    const nuevoUsuario = await Usuario.create({
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      passwordHash,
      isVerified: false,
      verificationToken,
      codigoVerificacion,
      codigoExpira,
    });

    // Enviar correo de verificación — se espera el resultado para detectar errores SMTP
    try {
      await sendVerificationCode(nuevoUsuario.correo, nuevoUsuario.nombre, codigoVerificacion);
    } catch (emailErr) {
      console.error('[registro] Error al enviar correo:', emailErr.message);
      // Cuenta creada pero correo falló — avisar al cliente
      return res.status(201).json({
        message: 'Cuenta creada, pero no pudimos enviar el correo de verificación. Usa "Reenviar código" en un momento.',
        userId: nuevoUsuario._id,
        correo: nuevoUsuario.correo,
        emailError: true,
      });
    }

    return res.status(201).json({
      message: 'Cuenta creada exitosamente. Te hemos enviado un código de 6 dígitos a tu correo.',
      userId: nuevoUsuario._id,
      correo: nuevoUsuario.correo,
    });
  } catch (err) {
    console.error('[registro]', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// -- POST /api/v1/usuarios/verificar-codigo ----------------------------

router.post('/verificar-codigo', async (req, res) => {
  const { correo, codigo } = req.body;

  if (!correo || !codigo) {
    return res.status(400).json({ error: 'El correo y el código son requeridos.' });
  }

  try {
    const usuario = await Usuario.findOne({ correo: correo.trim().toLowerCase() });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (usuario.isVerified) {
      return res.status(200).json({ message: 'Tu cuenta ya está verificada.' });
    }

    if (!usuario.codigoVerificacion || usuario.codigoVerificacion !== codigo.trim()) {
      return res.status(400).json({ error: 'El código de verificación es incorrecto.' });
    }

    if (usuario.codigoExpira && new Date() > new Date(usuario.codigoExpira)) {
      return res.status(400).json({ error: 'El código ha expirado. Solicita un nuevo código.' });
    }

    usuario.isVerified = true;
    usuario.codigoVerificacion = null;
    usuario.codigoExpira = null;
    usuario.verificationToken = null;
    await usuario.save();

    return res.status(200).json({
      message: '¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.',
    });
  } catch (err) {
    console.error('[verificar-codigo error]', err);
    return res.status(500).json({ error: 'Error al verificar el código.' });
  }
});

// -- POST /api/v1/usuarios/reenviar-codigo -----------------------------

router.post('/reenviar-codigo', async (req, res) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({ error: 'El correo electrónico es requerido.' });
  }

  try {
    const usuario = await Usuario.findOne({ correo: correo.trim().toLowerCase() });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (usuario.isVerified) {
      return res.status(400).json({ error: 'Esta cuenta ya está verificada.' });
    }

    const nuevoCodigo = generate6DigitCode();
    usuario.codigoVerificacion = nuevoCodigo;
    usuario.codigoExpira = new Date(Date.now() + 15 * 60 * 1000);
    await usuario.save();

    try {
      await sendVerificationCode(usuario.correo, usuario.nombre, nuevoCodigo);
    } catch (emailErr) {
      console.error('[reenviar-codigo] Error al enviar correo:', emailErr.message);
      return res.status(500).json({ error: 'No se pudo enviar el correo. Verifica tu dirección o intenta más tarde.' });
    }

    return res.status(200).json({
      message: 'Nuevo código enviado a tu correo electrónico.',
    });
  } catch (err) {
    console.error('[reenviar-codigo error]', err);
    return res.status(500).json({ error: 'Error al reenviar el código.' });
  }
});

// -- GET /api/v1/usuarios/verificar (Retrocompatibilidad Enlace) ------

router.get('/verificar', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('<h2>Token de verificación no proporcionado.</h2>');
  }

  try {
    const usuario = await Usuario.findOne({ verificationToken: token });
    if (!usuario) {
      return res.status(404).send('<h2>Token de verificación inválido o expirado.</h2>');
    }

    usuario.isVerified = true;
    usuario.verificationToken = null;
    usuario.codigoVerificacion = null;
    usuario.codigoExpira = null;
    await usuario.save();

    return res.send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
        <h1 style="color: #208AEF;">🎟️ Smart Ticket</h1>
        <h2 style="color: #16a34a;">¡Cuenta verificada exitosamente! 🎉</h2>
        <p>Tu correo <strong>${usuario.correo}</strong> ha sido confirmado.</p>
        <p>Ya puedes regresar a la aplicación móvil e iniciar sesión.</p>
      </div>
    `);
  } catch (err) {
    console.error('[verificar error]', err);
    return res.status(500).send('<h2>Error al verificar la cuenta.</h2>');
  }
});

// -- POST /api/v1/usuarios/login ---------------------------------------

router.post('/login', limiterLogin, async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ error: 'Completa todos los campos.' });
  }

  try {
    const usuario = await Usuario.findOne({ correo: correo.toLowerCase() });
    if (!usuario) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const passwordOk = verifyPassword(password, usuario.passwordHash);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const token = generateToken();

    return res.status(200).json({
      token,
      nombre: usuario.nombre,
      correo: usuario.correo,
      isVerified: usuario.isVerified,
      _id: usuario._id.toString(),
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
