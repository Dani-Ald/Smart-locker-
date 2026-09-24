/**
 * index.js â€” Entry point del servidor Express.
 *
 * Carga variables de entorno â†’ conecta a MongoDB â†’ levanta el servidor HTTP.
 * Rutas disponibles por ahora:
 *   GET /api/v1/health      â†’ healthcheck (siempre disponible, sin BD)
 *   GET /api/v1/eventos     â†’ lista eventos publicados (con filtros opcionales)
 *   GET /api/v1/eventos/:id â†’ detalle de un evento
 */
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB   = require('./db');
const eventosRouter = require('./routes/eventos');
const usuariosRouter = require('./routes/usuarios');

const app  = express();
const PORT = process.env.PORT || 3000;

// â”€â”€ Middlewares â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use(cors());          // Permite peticiones desde App (Expo) en desarrollo
app.use(express.json());  // Parsea cuerpos JSON en POST/PUT

// â”€â”€ Healthcheck â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Ãštil para confirmar que el servidor corre (no requiere BD)
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// â”€â”€ Rutas de entidades â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use('/api/v1/eventos', eventosRouter);
app.use('/api/v1/usuarios', usuariosRouter);

// â”€â”€ Arranque â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`ðŸš€ API corriendo en http://localhost:${PORT}`);
    console.log(`   â†’ Healthcheck: http://localhost:${PORT}/api/v1/health`);
    console.log(`   â†’ Eventos:     http://localhost:${PORT}/api/v1/eventos`);
  });
});

