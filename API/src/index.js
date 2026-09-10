/**
 * index.js — Entry point del servidor Express.
 *
 * Carga variables de entorno → conecta a MongoDB → levanta el servidor HTTP.
 * Rutas disponibles por ahora:
 *   GET /api/v1/health      → healthcheck (siempre disponible, sin BD)
 *   GET /api/v1/eventos     → lista eventos publicados (con filtros opcionales)
 *   GET /api/v1/eventos/:id → detalle de un evento
 */
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB   = require('./db');
const eventosRouter = require('./routes/eventos');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors());          // Permite peticiones desde App (Expo) en desarrollo
app.use(express.json());  // Parsea cuerpos JSON en POST/PUT

// ── Healthcheck ──────────────────────────────────────────────────────────────
// Útil para confirmar que el servidor corre (no requiere BD)
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Rutas de entidades ────────────────────────────────────────────────────────
app.use('/api/v1/eventos', eventosRouter);

// ── Arranque ─────────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 API corriendo en http://localhost:${PORT}`);
    console.log(`   → Healthcheck: http://localhost:${PORT}/api/v1/health`);
    console.log(`   → Eventos:     http://localhost:${PORT}/api/v1/eventos`);
  });
});
