/**
 * models/UsuarioAuth.js — Usuario con autenticacion (sesion 13).
 * Separado de Usuario.js (comprador simple sin auth) para no romper flujos existentes.
 */
const mongoose = require('mongoose');

const usuarioAuthSchema = new mongoose.Schema(
  {
    nombre:       { type: String, required: true, trim: true },
    correo:       { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },  // formato: salt:hash (scrypt)
  },
  { timestamps: true }
);

module.exports = mongoose.model('UsuarioAuth', usuarioAuthSchema);
