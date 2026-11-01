// SQLite real en memoria con el adaptador asíncrono de Expo simulado.
// Ejecutar: node --test scripts/wallet-repository.test.cjs (Node 24).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function repository() {
  const sqlite = new DatabaseSync(':memory:');
  let failInsert = false;
  let initializations = 0;
  let failBegin = false;
  let rollbacks = 0;
  const turn = () => new Promise((done) => setImmediate(done));
  const db = {
    async execAsync(sql) {
      await turn();
      if (sql.includes('CREATE TABLE')) initializations++;
      if (sql === 'ROLLBACK') rollbacks++;
      if (sql === 'BEGIN TRANSACTION' && failBegin) { failBegin = false; throw new Error('inicio simulado'); }
      sqlite.exec(sql);
    },
    async isInTransactionAsync() { return sqlite.isTransaction; },
    async runAsync(sql, ...params) {
      await turn();
      if (failInsert && sql.includes('INSERT') && params[0] === 'fallo') throw new Error('escritura simulada');
      return sqlite.prepare(sql).run(...params);
    },
    async getAllAsync(sql, ...params) { await turn(); return sqlite.prepare(sql).all(...params); },
    async getFirstAsync(sql, ...params) { await turn(); return sqlite.prepare(sql).get(...params) ?? null; },
  };
  const exports = {};
  const code = ts.transpileModule(readFileSync(resolve(__dirname, '../src/data/ticketRepository.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { exports, require: () => ({ openDatabaseAsync: async () => db }), __DEV__: false });
  return { api: exports, sqlite, fail: () => { failInsert = true; }, failBegin: () => { failBegin = true; }, initializations: () => initializations, rollbacks: () => rollbacks };
}
const ticket = (id) => ({ id, tipoBoleto: 'General', estado: 'pagado', qrPayload: 'sintetico', qrGeneradoAt: null,
  evento: { id: 'evento', nombre: 'Prueba', fechaHora: '2030-01-01', ubicacion: 'Prueba', municipio: 'Prueba', imagen: '' },
  createdAt: '2026-01-01', updatedAt: '2026-01-01' });

test('reproducción controlada: transacciones Expo solapadas pueden ocultar BEGIN con rollback', async () => {
  const source = readFileSync(resolve(__dirname, '../node_modules/expo-sqlite/src/SQLiteDatabase.ts'), 'utf8');
  const start = source.indexOf('  public async withTransactionAsync(');
  const end = source.indexOf('\n  }', start) + 4;
  assert.ok(start >= 0 && end > start, 'Se requiere revisar el adaptador al actualizar Expo');
  const exports = {};
  const code = ts.transpileModule(`export class Original { ${source.slice(start, end)} }`, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { exports });
  const sqlite = new DatabaseSync(':memory:');
  const original = new exports.Original();
  original.execAsync = async (sql) => {
    await new Promise((done) => setImmediate(done));
    sqlite.exec(sql);
  };
  try {
    const results = await Promise.allSettled([
      original.withTransactionAsync(() => original.execAsync('SELECT 1')),
      original.withTransactionAsync(() => original.execAsync('SELECT 2')),
    ]);
    assert.ok(results.some((r) => r.status === 'rejected' && /cannot rollback - no transaction is active/.test(r.reason.message)));
  } finally { sqlite.close(); }
});

test('reemplazos y lecturas concurrentes conservan atomicidad y cuentas aisladas', async () => {
  const r = repository();
  try {
    await r.api.replaceLocalTickets('otra', [ticket('otro')], 'antes');
    await Promise.all(Array.from({ length: 20 }, (_, i) => Promise.all([
      r.api.replaceLocalTickets('cuenta', [ticket(String(i))], 'ahora'), r.api.getLocalTickets('cuenta'),
    ])));
    assert.equal((await r.api.getLocalTickets('cuenta'))[0].id, '19');
    assert.equal((await r.api.getLocalTickets('otra'))[0].id, 'otro');
    assert.equal(r.initializations(), 1);
  } finally { r.sqlite.close(); }
});

test('fallo parcial restaura caché anterior y la cola permite reintentar', async () => {
  const r = repository();
  try {
    await r.api.replaceLocalTickets('cuenta', [ticket('previo')], 'antes');
    r.fail();
    await assert.rejects(r.api.replaceLocalTickets('cuenta', [ticket('nuevo'), ticket('fallo')], 'ahora'), /escritura simulada/);
    assert.equal((await r.api.getLocalTickets('cuenta')).length, 1);
    assert.equal((await r.api.getLocalTickets('cuenta'))[0].id, 'previo');
    assert.equal(r.rollbacks(), 1);
    await r.api.replaceLocalTickets('cuenta', [], 'despues');
    assert.equal((await r.api.getLocalTickets('cuenta')).length, 0);
  } finally { r.sqlite.close(); }
});

test('fallo de BEGIN preserva el primer error sin rollback inexistente', async () => {
  const r = repository();
  try {
    await r.api.replaceLocalTickets('cuenta', [ticket('previo')], 'antes');
    r.failBegin();
    await assert.rejects(r.api.replaceLocalTickets('cuenta', [], 'ahora'), /inicio simulado/);
    assert.equal(r.rollbacks(), 0);
    assert.equal((await r.api.getLocalTickets('cuenta'))[0].id, 'previo');
  } finally { r.sqlite.close(); }
});
