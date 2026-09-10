/**
 * models/Evento.js — Schema Mongoose para la colección `eventos`.
 *
 * Refleja exactamente el modelo definido en DOCS/01-modelo-datos-y-arquitectura.md §3.2.
 * Si necesitas cambiar un campo, actualiza primero ese documento.
 */
const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema(
  {
    organizadorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizador',
      required: [true, 'El organizador es obligatorio'],
    },
    nombre: {
      type: String,
      required: [true, 'El nombre del evento es obligatorio'],
      trim: true,
    },
    categoria: {
      type: String,
      enum: ['feria_patronal', 'baile', 'palenque', 'charreada', 'jaripeo'],
      required: [true, 'La categoría es obligatoria'],
    },
    municipio: {
      type: String,
      required: [true, 'El municipio es obligatorio'],
      trim: true,
    },
    fechaHora: {
      type: Date,
      required: [true, 'La fecha y hora son obligatorias'],
    },
    ubicacion: { type: String, trim: true },
    descripcion: { type: String },
    imagenUrl: { type: String },
    precioDesde: { type: Number, default: 0, min: 0 },
    aforoTotal: {
      type: Number,
      required: [true, 'El aforo total es obligatorio'],
      min: [1, 'El aforo debe ser al menos 1'],
    },
    aforoVendido: { type: Number, default: 0, min: 0 },
    estado: {
      type: String,
      enum: ['borrador', 'publicado', 'finalizado'],
      default: 'borrador',
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

module.exports = mongoose.model('Evento', eventoSchema);
