/**
 * models/Organizador.js — Schema Mongoose para la colección `organizadores`.
 * Refleja DOCS/01-modelo-datos-y-arquitectura.md §3.1.
 * cuentaBancaria y planSuscripcion son placeholders para fases posteriores.
 */
const mongoose = require('mongoose');

const organizadorSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    tipoOrganizador: {
      type: String,
      enum: ['comite_feria', 'asociacion_charros', 'promotor_independiente'],
      required: true,
    },
    municipio: { type: String, required: true, trim: true },
    contacto: {
      email:    { type: String, trim: true },
      telefono: { type: String, trim: true },
    },
    // Placeholder — se llena cuando se integre la pasarela de pago
    cuentaBancaria: {
      clabe: { type: String },
      banco: { type: String },
    },
    planSuscripcion: {
      type: String,
      enum: ['ninguno', 'temporada'],
      default: 'ninguno',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organizador', organizadorSchema);
