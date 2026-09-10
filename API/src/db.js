/**
 * db.js — Conexión a MongoDB Atlas mediante Mongoose.
 *
 * La cadena de conexión SRV se lee de MONGODB_URI en el archivo .env:
 *   mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/smart-ticket?retryWrites=true&w=majority
 *
 * Para deploy (Render/Railway/etc.), configura MONGODB_URI en las variables
 * de entorno del hosting — el código NO cambia.
 */
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB conectado → ${process.env.MONGODB_URI}`);
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    process.exit(1); // Detiene el servidor si no hay base de datos
  }
};

module.exports = connectDB;
