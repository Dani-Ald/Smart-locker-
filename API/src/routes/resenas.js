const express = require('express');
const mongoose = require('mongoose');
const Boleto = require('../models/Boleto');
const Resena = require('../models/Resena');
const { requireAuth } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.get('/mia', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Evento inválido.' });
  try {
    const resena = await Resena.findOne({ eventoId: req.params.id, usuarioId: req.usuarioId });
    return res.json({ data: resena });
  } catch (err) {
    console.error('[resenas/mia]', err);
    return res.status(500).json({ error: 'No fue posible cargar la reseña.' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { id: eventoId } = req.params;
  const { calificacion, comentario = '' } = req.body;

  if (!mongoose.isValidObjectId(eventoId)) return res.status(400).json({ error: 'Evento inválido.' });
  if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
    return res.status(400).json({ error: 'La calificación debe ser un entero entre 1 y 5.' });
  }
  if (typeof comentario !== 'string' || comentario.trim().length > 1000) {
    return res.status(400).json({ error: 'El comentario no puede superar 1000 caracteres.' });
  }

  try {
    const boleto = await Boleto.findOne({ eventoId, usuarioId: req.usuarioId, estado: 'usado' }).populate('eventoId');
    if (!boleto) return res.status(403).json({ error: 'Solo los asistentes pueden reseñar este evento.' });
    if (!boleto.eventoId?.fechaHora || new Date(boleto.eventoId.fechaHora) > new Date()) {
      return res.status(409).json({ error: 'Podrás reseñar el evento cuando haya concluido.' });
    }

    const resena = await Resena.findOneAndUpdate(
      { eventoId, usuarioId: req.usuarioId },
      { boletoId: boleto._id, calificacion, comentario: comentario.trim() },
      { upsert: true, new: true, runValidators: true },
    );
    return res.status(200).json({ data: resena });
  } catch (err) {
    console.error('[resenas]', err);
    return res.status(500).json({ error: 'No fue posible guardar la reseña.' });
  }
});

module.exports = router;
