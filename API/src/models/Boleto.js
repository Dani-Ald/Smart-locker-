/**
 * models/Boleto.js — Schema Mongoose para la colección `boletos`.
 * Refleja DOCS/01-modelo-datos-y-arquitectura.md §3.3.
 * codigoVerificacion es placeholder para el QR (fase posterior).
 * La lógica de control de aforo se aplica en el endpoint POST /boletos (no aquí).
 */
const mongoose = require('mongoose');

const boletoSchema = new mongoose.Schema(
  {
    eventoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evento',
      required: true,
    },
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null, // Puede ser nulo si el comprador no se identificó aún
    },
    tipoBoleto: { type: String, required: true }, // Ej. General, VIP, Preventa
    precio:     { type: Number, required: true, min: 0 },
    metodoPago: {
      type: String,
      enum: ['linea', 'efectivo_taquilla'],
      required: true,
    },
    estado: {
      type: String,
      enum: ['apartado', 'pagado', 'usado', 'cancelado'],
      default: 'apartado',
    },
    // Placeholder — se generará como UUID+QR en fase posterior (RF-08)
    codigoVerificacion: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Boleto', boletoSchema);
