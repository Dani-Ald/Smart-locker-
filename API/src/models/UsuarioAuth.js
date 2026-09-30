/**
 * models/UsuarioAuth.js — Usuario con autenticación.
 * Mapea a la colección 'users' en la base de datos 'test'.
 */
const mongoose = require('mongoose');

const usuarioAuthSchema = new mongoose.Schema(
  {
    nombre:            { type: String, required: true, trim: true },
    correo:            { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash:      { type: String, required: true },
    isVerified:        { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    codigoVerificacion:{ type: String, default: null },
    codigoExpira:      { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UsuarioAuth', usuarioAuthSchema, 'users');
