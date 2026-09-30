/**
 * routes/usuarios.js — Endpoints de autenticación para usuarios compradores.
 *
 * Rutas:
 *   POST /api/v1/usuarios/registro  -> Crear cuenta nueva y enviar correo de verificación
 *   GET  /api/v1/usuarios/verificar -> Confirmar token de correo
 *   POST /api/v1/usuarios/login     -> Iniciar sesión
 */
const express = require('express');
const crypto  = require('crypto');
const rateLimit = require('express-rate-limit');
const Usuario = require('../models/UsuarioAuth');
const { sendVerificationEmail } = require('../services/emailService');

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

// -- Utilidades de contraseña -------------------------------------------

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

    const nuevoUsuario = await Usuario.create({
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      passwordHash,
      isVerified: false,
      verificationToken,
    });

    // Enviar correo de verificación de forma asíncrona
    sendVerificationEmail(nuevoUsuario.correo, nuevoUsuario.nombre, verificationToken);

    return res.status(201).json({
      message: 'Cuenta creada exitosamente. Te hemos enviado un correo de verificación.',
      userId: nuevoUsuario._id,
    });
  } catch (err) {
    console.error('[registro]', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// -- GET /api/v1/usuarios/verificar ------------------------------------

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
