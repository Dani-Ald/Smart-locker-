/**
 * routes/eventos.js — Endpoints del recurso /api/v1/eventos.
 *
 * Implementados ahora (solo lectura):
 *   GET /api/v1/eventos        → lista eventos publicados (filtros: categoria, municipio, fecha)
 *   GET /api/v1/eventos/:id    → detalle de un evento por ID
 *
 * Pendientes (Paso 7 del plan):
 *   POST   /api/v1/eventos          → crear evento (estado inicial: borrador)
 *   PUT    /api/v1/eventos/:id      → editar evento
 *   POST   /api/v1/eventos/:id/publicar → cambiar estado a publicado
 */
const express = require('express');
const router  = express.Router();
const Evento  = require('../models/Evento');

// ── GET /api/v1/eventos ──────────────────────────────────────────────────────
// Lista todos los eventos en estado "publicado".
// Query params opcionales: ?categoria=palenque  ?municipio=Ixmiquilpan  ?fecha=2026-10-01
router.get('/', async (req, res) => {
  try {
    const { categoria, municipio, fecha } = req.query;
    const filtro = { estado: 'publicado' };

    if (categoria) filtro.categoria = categoria;
    if (municipio) filtro.municipio = { $regex: municipio, $options: 'i' }; // búsqueda parcial
    if (fecha)     filtro.fechaHora = { $gte: new Date(fecha) };

    const eventos = await Evento.find(filtro).sort({ fechaHora: 1 });
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/v1/eventos/:id ──────────────────────────────────────────────────
// Detalle de un evento por su _id de MongoDB.
router.get('/:id', async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(evento);
  } catch (err) {
    // Si el id tiene formato inválido, Mongoose lanza CastError
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'ID de evento inválido' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
