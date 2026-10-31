const crypto = require('crypto');
const Sesion = require('../models/Sesion');

const SESSION_DAYS = 30;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function createSession(usuarioId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await Sesion.create({ usuarioId, tokenHash: hashToken(token), expiresAt });
  return token;
}

async function revokeSession(token) {
  await Sesion.deleteOne({ tokenHash: hashToken(token) });
}

module.exports = { createSession, hashToken, revokeSession };
