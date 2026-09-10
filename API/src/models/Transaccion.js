/**
 * models/Transaccion.js — Schema Mongoose para la colección `transacciones`.
 * Refleja DOCS/01-modelo-datos-y-arquitectura.md §3.5.
 * La comisión escalonada (Fase 1 §5.1) se calcula en el endpoint de boletos.
 */
const mongoose = require('mongoose');

const transaccionSchema = new mongoose.Schema({
  boletoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boleto',
    required: true,
  },
  montoBoleto:      { type: Number, required: true },
  comision:         { type: Number, required: true }, // Calculada según modelo escalonado
  montoOrganizador: { type: Number, required: true }, // montoBoleto - comision
  estadoPago: {
    type: String,
    enum: ['pendiente', 'confirmado', 'fallido'],
    default: 'pendiente',
  },
  fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaccion', transaccionSchema);
