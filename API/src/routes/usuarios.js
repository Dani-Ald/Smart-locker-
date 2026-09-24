/**
 * routes/usuarios.js — Endpoints de autenticacion para usuarios compradores.
 * Agregado en Sesion 13 para soportar login/registro desde la app movil.
 *
 * Rutas:
 *   POST /api/v1/usuarios/registro  -> Crear cuenta nueva
 *   POST /api/v1/usuarios/login     -> Iniciar sesion
 */
const express = require('express');
const crypto  = require('crypto');
const rateLimit = require('express-rate-limit');
const Usuario = require('../models/UsuarioAuth');

const router = express.Router();

// -- Rate limiting -------------------------------------------------------

const limiterRegistro = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: { error: 'Demasiados intentos de registro. Intentalo en unos minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos. Intentalo en unos minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// -- Utilidades de contrasena -------------------------------------------

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
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contrasena debe tener al menos 8 caracteres.' });
  }
  if (password !== passwordConfirm) {
    return res.status(400).json({ error: 'Las contrasenas no coinciden.' });
  }

  try {
    const existe = await Usuario.findOne({ correo: correo.toLowerCase() });
    if (existe) {
      return res.status(409).json({ error: 'Ese correo ya esta registrado.' });
    }

    const passwordHash = hashPassword(password);
    await Usuario.create({
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      passwordHash,
    });

    return res.status(201).json({ message: 'Cuenta creada exitosamente.' });
  } catch (err) {
    console.error('[registro]', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
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
      return res.status(401).json({ error: 'Correo o contrasena incorrectos.' });
    }

    const passwordOk = verifyPassword(password, usuario.passwordHash);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Correo o contrasena incorrectos.' });
    }

    const token = generateToken();

    return res.status(200).json({
      token,
      nombre: usuario.nombre,
      correo: usuario.correo,
      _id: usuario._id.toString(),
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
