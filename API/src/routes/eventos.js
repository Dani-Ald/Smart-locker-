/**
 * routes/eventos.js — Endpoints del recurso /api/v1/eventos.
 */
const express = require('express');
const router  = express.Router();
const Evento  = require('../models/Evento');

// ── GET /api/v1/eventos ──────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { categoria, municipio, fecha, estado } = req.query;
    const filtro = {};

    if (estado) {
      filtro.estado = estado;
    }
    if (categoria) {
      filtro.categoria = { $regex: categoria, $options: 'i' };
    }
    if (municipio) {
      filtro.municipio = { $regex: municipio, $options: 'i' };
    }
    if (fecha) {
      filtro.fechaHora = { $gte: new Date(fecha) };
    }

    const eventos = await Evento.find(filtro).sort({ fechaHora: 1 });
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/v1/eventos/:id ──────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(evento);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'ID de evento inválido' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/v1/eventos ─────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      organizadorId, nombre, categoria, municipio,
      fechaHora, ubicacion, descripcion, imagen, imagenUrl,
      precioBoleto, precioDesde, cantidadBoletos, aforoTotal, estado,
    } = req.body;

    if (!nombre || !fechaHora) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios: nombre y fechaHora.',
      });
    }

    const img = (imagenUrl || imagen || '').trim();
    const precio = precioDesde !== undefined ? Number(precioDesde) : (precioBoleto !== undefined ? Number(precioBoleto) : 0);
    const aforo = aforoTotal !== undefined ? Number(aforoTotal) : (cantidadBoletos !== undefined ? Number(cantidadBoletos) : 100);

    const evento = await Evento.create({
      organizadorId: organizadorId || null,
      nombre: nombre.trim(),
      categoria: categoria ? categoria.trim() : 'General',
      municipio: municipio ? municipio.trim() : (ubicacion ? ubicacion.trim() : 'Valle del Mezquital'),
      fechaHora: new Date(fechaHora),
      ubicacion: ubicacion?.trim() ?? '',
      descripcion: descripcion?.trim() ?? '',
      imagen: img,
      imagenUrl: img,
      precioBoleto: precio,
      precioDesde: precio,
      cantidadBoletos: aforo,
      aforoTotal: aforo,
      estado: estado || 'publicado',
    });

    return res.status(201).json(evento);
  } catch (err) {
    console.error('[create event error]', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

