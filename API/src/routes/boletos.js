const crypto = require('crypto');
const express = require('express');
const Boleto = require('../models/Boleto');
const { requireAuth } = require('../middleware/auth');
const { createSignedTicketPayload, getPublicKey } = require('../services/qrService');

const router = express.Router();

router.get('/clave-publica', (req, res) => {
  try {
    return res.json({
      alg: 'Ed25519',
      kid: process.env.QR_KEY_ID || 'smart-ticket-1',
      publicKey: getPublicKey(),
    });
  } catch (err) {
    console.error('[clave-publica]', err);
    return res.status(503).json({ error: 'La verificación QR todavía no está configurada.' });
  }
});

router.get('/mios', requireAuth, async (req, res) => {
  try {
    const boletos = await Boleto.find({ usuarioId: req.usuarioId })
      .populate('eventoId')
      .sort({ createdAt: -1 });

    for (const boleto of boletos) {
      if (!boleto.qrPayload && ['pagado', 'usado'].includes(boleto.estado)) {
        const nonce = boleto.codigoVerificacion || crypto.randomUUID();
        boleto.codigoVerificacion = nonce;
        boleto.qrPayload = createSignedTicketPayload({
          ticketId: boleto._id.toString(),
          eventId: boleto.eventoId?._id?.toString() || boleto.eventoId.toString(),
          holderId: req.usuarioId,
          nonce,
          issuedAt: new Date().toISOString(),
        });
        boleto.qrGeneradoAt = new Date();
        await boleto.save();
      }
    }

    const data = boletos.filter((boleto) => boleto.eventoId).map((boleto) => {
      const evento = boleto.eventoId;
      return {
        id: boleto._id.toString(),
        tipoBoleto: boleto.tipoBoleto,
        estado: boleto.estado,
        qrPayload: boleto.qrPayload,
        qrGeneradoAt: boleto.qrGeneradoAt,
        evento: evento ? {
          id: evento._id.toString(),
          nombre: evento.nombre,
          fechaHora: evento.fechaHora,
          ubicacion: evento.ubicacion,
          municipio: evento.municipio,
          imagen: evento.imagen || evento.imagenUrl || '',
        } : null,
        createdAt: boleto.createdAt,
        updatedAt: boleto.updatedAt,
      };
    });

    return res.json({ data, sincronizadoAt: new Date().toISOString() });
  } catch (err) {
    console.error('[boletos/mios]', err);
    return res.status(500).json({ error: 'No fue posible cargar tus boletos.' });
  }
});

module.exports = router;
