/**
 * models/Evento.js — Schema Mongoose para la colección `events` en BD `test`.
 */
const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema(
  {
    organizadorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizador',
      required: false,
      default: null,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre del evento es obligatorio'],
      trim: true,
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      trim: true,
    },
    municipio: {
      type: String,
      default: 'Valle del Mezquital',
      trim: true,
    },
    fechaHora: {
      type: Date,
      required: [true, 'La fecha y hora son obligatorias'],
    },
    ubicacion: { type: String, trim: true, default: '' },
    descripcion: { type: String, trim: true, default: '' },
    imagen: { type: String, trim: true, default: '' },
    imagenUrl: { type: String, trim: true, default: '' },
    precioBoleto: { type: Number, default: 0, min: 0 },
    precioDesde: { type: Number, default: 0, min: 0 },
    cantidadBoletos: { type: Number, default: 100, min: 1 },
    aforoTotal: { type: Number, default: 100, min: 1 },
    aforoVendido: { type: Number, default: 0, min: 0 },
    estado: {
      type: String,
      default: 'publicado',
    },
  },
  {
    timestamps: true,
  }
);

// Mapear explícitamente a la colección 'events' en la BD 'test'
module.exports = mongoose.model('Evento', eventoSchema, 'events');
