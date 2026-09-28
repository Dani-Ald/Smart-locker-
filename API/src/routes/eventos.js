/**
 * routes/eventos.js â€” Endpoints del recurso /api/v1/eventos.
 *
 * Implementados ahora (solo lectura):
 *   GET /api/v1/eventos        â†’ lista eventos publicados (filtros: categoria, municipio, fecha)
 *   GET /api/v1/eventos/:id    â†’ detalle de un evento por ID
 *
 * Pendientes (Paso 7 del plan):
 *   POST   /api/v1/eventos          â†’ crear evento (estado inicial: borrador)
 *   PUT    /api/v1/eventos/:id      â†’ editar evento
 *   POST   /api/v1/eventos/:id/publicar â†’ cambiar estado a publicado
 */
const express = require('express');
const router  = express.Router();
const Evento  = require('../models/Evento');

// â”€â”€ GET /api/v1/eventos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Lista todos los eventos en estado "publicado".
// Query params opcionales: ?categoria=palenque  ?municipio=Ixmiquilpan  ?fecha=2026-10-01
router.get('/', async (req, res) => {
  try {
    const { categoria, municipio, fecha } = req.query;
    const filtro = { estado: 'publicado' };

    if (categoria) filtro.categoria = categoria;
    if (municipio) filtro.municipio = { $regex: municipio, $options: 'i' }; // bÃºsqueda parcial
    if (fecha)     filtro.fechaHora = { $gte: new Date(fecha) };

    const eventos = await Evento.find(filtro).sort({ fechaHora: 1 });
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ GET /api/v1/eventos/:id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Detalle de un evento por su _id de MongoDB.
router.get('/:id', async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(evento);
  } catch (err) {
    // Si el id tiene formato invÃ¡lido, Mongoose lanza CastError
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'ID de evento invÃ¡lido' });
    }
    res.status(500).json({ error: err.message });
  }
});


// ── POST /api/v1/eventos ─────────────────────────────────────────────────────
// Crea un nuevo evento en estado 'borrador'.
// Agregado en Sesion 13 para soportar CreateEventScreen en la app movil.
router.post('/', async (req, res) => {
  try {
    const {
      organizadorId, nombre, categoria, municipio,
      fechaHora, ubicacion, descripcion, imagenUrl,
      precioDesde, aforoTotal,
    } = req.body;

    // Validacion minima server-side
    if (!nombre || !categoria || !municipio || !fechaHora || !aforoTotal) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios: nombre, categoria, municipio, fechaHora, aforoTotal.',
      });
    }

    const evento = await Evento.create({
      organizadorId: organizadorId || null,
      nombre: nombre.trim(),
      categoria,
      municipio: municipio.trim(),
      fechaHora: new Date(fechaHora),
      ubicacion: ubicacion?.trim() ?? '',
      descripcion: descripcion?.trim() ?? '',
      imagenUrl: imagenUrl?.trim() ?? '',
      precioDesde: Number(precioDesde) || 0,
      aforoTotal: Number(aforoTotal),
      estado: 'borrador',
    });

    res.status(201).json(evento);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;

