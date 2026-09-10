/**
 * seeder.js — Pobla la base de datos con datos de prueba.
 *
 * Uso en LOCAL:
 *   node src/seeder.js           → inserta los datos de prueba
 *   node src/seeder.js --limpiar → borra TODOS los documentos de las colecciones
 *
 * Uso para RAILWAY (deploy):
 *   Cambia MONGODB_URI en .env a la URL de Railway y corre el mismo comando.
 *   Esto verifica que la cadena de producción funciona de punta a punta.
 *
 * Referencia: paso 12:00-14:33 del tutorial https://youtu.be/UWRsyP7iAnU
 */
require('dotenv').config();
const mongoose     = require('mongoose');
const connectDB    = require('./db');
const Organizador  = require('./models/Organizador');
const Evento       = require('./models/Evento');
const Usuario      = require('./models/Usuario');

// ── Datos de prueba ──────────────────────────────────────────────────────────

const organizadoresSeed = [
  {
    nombre: 'Comité de Fiestas Patronales Ixmiquilpan',
    tipoOrganizador: 'comite_feria',
    municipio: 'Ixmiquilpan',
    contacto: { email: 'fiestas@ixmiquilpan.gob.mx', telefono: '7591234567' },
    planSuscripcion: 'temporada',
  },
  {
    nombre: 'Asociación de Charros Valle del Mezquital',
    tipoOrganizador: 'asociacion_charros',
    municipio: 'Actopan',
    contacto: { email: 'charros@mezquital.mx', telefono: '7719876543' },
    planSuscripcion: 'ninguno',
  },
];

const usuariosSeed = [
  { nombre: 'Juan Hernández', email: 'juan@example.com', telefono: '7591110001' },
  { nombre: 'María López',    email: 'maria@example.com', telefono: '7591110002' },
];

// ── Lógica del seeder ────────────────────────────────────────────────────────

const importarDatos = async () => {
  try {
    await connectDB();

    // Limpiar colecciones antes de insertar (evitar duplicados)
    await Organizador.deleteMany();
    await Evento.deleteMany();
    await Usuario.deleteMany();
    console.log('🗑️  Colecciones limpiadas');

    // Insertar organizadores y usuarios
    const orgs     = await Organizador.insertMany(organizadoresSeed);
    const usuarios = await Usuario.insertMany(usuariosSeed);
    console.log(`✅ ${orgs.length} organizadores insertados`);
    console.log(`✅ ${usuarios.length} usuarios insertados`);

    // Insertar eventos usando los IDs reales de los organizadores
    const eventosSeed = [
      {
        organizadorId: orgs[0]._id,
        nombre:        'Feria Patronal Ixmiquilpan 2026',
        categoria:     'feria_patronal',
        municipio:     'Ixmiquilpan',
        fechaHora:     new Date('2026-10-15T18:00:00'),
        ubicacion:     'Explanada Municipal, Ixmiquilpan, Hgo.',
        descripcion:   'La feria patronal más grande del Valle del Mezquital con palenque, bailes y feria.',
        imagenUrl:     'https://via.placeholder.com/800x400?text=Feria+Ixmiquilpan',
        precioDesde:   150,
        aforoTotal:    2000,
        aforoVendido:  0,
        estado:        'publicado',
      },
      {
        organizadorId: orgs[0]._id,
        nombre:        'Gran Baile de Octubre — Los Yonics',
        categoria:     'baile',
        municipio:     'Ixmiquilpan',
        fechaHora:     new Date('2026-10-20T21:00:00'),
        ubicacion:     'Salón Jardín Las Palmas, Ixmiquilpan',
        descripcion:   'Baile familiar con Los Yonics en vivo.',
        imagenUrl:     'https://via.placeholder.com/800x400?text=Baile+Los+Yonics',
        precioDesde:   200,
        aforoTotal:    800,
        aforoVendido:  0,
        estado:        'publicado',
      },
      {
        organizadorId: orgs[1]._id,
        nombre:        'Campeonato Estatal de Charrería',
        categoria:     'charreada',
        municipio:     'Actopan',
        fechaHora:     new Date('2026-11-05T11:00:00'),
        ubicacion:     'Lienzo Charro Municipal, Actopan, Hgo.',
        descripcion:   'Competencia estatal con los mejores equipos charros de Hidalgo.',
        imagenUrl:     'https://via.placeholder.com/800x400?text=Charreria+Actopan',
        precioDesde:   80,
        aforoTotal:    1200,
        aforoVendido:  0,
        estado:        'publicado',
      },
      {
        organizadorId: orgs[1]._id,
        nombre:        'Palenque de Navidad 2026',
        categoria:     'palenque',
        municipio:     'Actopan',
        fechaHora:     new Date('2026-12-22T20:00:00'),
        ubicacion:     'Palenque Municipal, Actopan, Hgo.',
        descripcion:   'Peleas de gallos de alto nivel con música en vivo.',
        precioDesde:   300,
        aforoTotal:    600,
        aforoVendido:  0,
        estado:        'borrador', // ← este NO aparece en GET /eventos (solo los publicados)
      },
    ];

    const eventos = await Evento.insertMany(eventosSeed);
    console.log(`✅ ${eventos.length} eventos insertados`);
    console.log('\n📋 IDs útiles para probar con Postman/Thunder Client:');
    eventos
      .filter(e => e.estado === 'publicado')
      .forEach(e => console.log(`   ${e.nombre}: ${e._id}`));

    console.log('\n🎉 Seeder completado. Prueba: GET http://localhost:3000/api/v1/eventos');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en seeder:', err.message);
    process.exit(1);
  }
};

const limpiarDatos = async () => {
  try {
    await connectDB();
    await Organizador.deleteMany();
    await Evento.deleteMany();
    await Usuario.deleteMany();
    console.log('🗑️  Base de datos limpiada completamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al limpiar:', err.message);
    process.exit(1);
  }
};

// ── Punto de entrada ─────────────────────────────────────────────────────────
if (process.argv[2] === '--limpiar') {
  limpiarDatos();
} else {
  importarDatos();
}
