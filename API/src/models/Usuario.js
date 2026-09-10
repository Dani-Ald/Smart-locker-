/**
 * models/Usuario.js — Schema Mongoose para la colección `usuarios`.
 * Refleja DOCS/01-modelo-datos-y-arquitectura.md §3.4.
 * NOTA: nombre, email y teléfono son datos personales bajo LFPDPPP (Fase 1 §9.2).
 * No implementar autenticación todavía — está marcada como pendiente.
 */
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema(
  {
    nombre:   { type: String, required: true, trim: true },
    email:    { type: String, required: true, trim: true, lowercase: true },
    telefono: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Usuario', usuarioSchema);
