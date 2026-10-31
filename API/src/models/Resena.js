const mongoose = require('mongoose');

const resenaSchema = new mongoose.Schema(
  {
    eventoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evento',
      required: true,
      index: true,
    },
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UsuarioAuth',
      required: true,
      index: true,
    },
    boletoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Boleto',
      required: true,
    },
    calificacion: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true },
);

resenaSchema.index({ eventoId: 1, usuarioId: 1 }, { unique: true });

module.exports = mongoose.model('Resena', resenaSchema, 'reviews');
