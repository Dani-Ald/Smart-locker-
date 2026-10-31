const Sesion = require('../models/Sesion');
const { hashToken } = require('../services/sessionService');

async function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Sesión requerida.' });
  }

  try {
    const sesion = await Sesion.findOne({
      tokenHash: hashToken(token),
      expiresAt: { $gt: new Date() },
    });
    if (!sesion) return res.status(401).json({ error: 'Sesión inválida o expirada.' });

    req.usuarioId = sesion.usuarioId.toString();
    req.sessionToken = token;
    sesion.lastUsedAt = new Date();
    await sesion.save();
    return next();
  } catch (err) {
    console.error('[auth]', err);
    return res.status(500).json({ error: 'No fue posible validar la sesión.' });
  }
}

module.exports = { requireAuth };
