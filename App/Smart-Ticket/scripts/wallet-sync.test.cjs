const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function setup() {
  let networkListener;
  let resolveRequest;
  let rejectRequest;
  let calls = 0;
  let writes = 0;
  let offline = false;
  let readFailure = false;
  const local = [{ id: 'guardado' }];
  const net = {
    fetch: async () => ({ isConnected: !offline, isInternetReachable: !offline }),
    addEventListener: (callback) => { networkListener = callback; return () => { networkListener = undefined; }; },
  };
  const imports = {
    '@react-native-community/netinfo': { __esModule: true, default: net },
    react: { createContext: () => ({}) },
    '@/context/SessionContext': {},
    '@/data/ticketRepository': {
      getLocalTickets: async () => { if (readFailure) throw new Error('lectura simulada'); return local; },
      replaceLocalTickets: async () => { writes++; },
    },
    '@/services/ticketService': { fetchMyTickets: () => {
      calls++;
      return new Promise((resolve, reject) => { resolveRequest = resolve; rejectRequest = reject; });
    } },
  };
  const exports = {};
  const code = ts.transpileModule(readFileSync(resolve(__dirname, '../src/hooks/use-wallet.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code + '\nexports.createWallet = createWallet;', { exports, require: (id) => imports[id], __DEV__: false });
  const store = exports.createWallet('cuenta-sintetica', 'sesion-sintetica');
  return {
    store, calls: () => calls, writes: () => writes,
    emit: (online) => { offline = !online; networkListener?.({ isConnected: online, isInternetReachable: online }); },
    succeed: () => resolveRequest({ data: [], sincronizadoAt: '2026-10-31' }),
    fail: () => rejectRequest(new Error('error interno que no debe mostrarse')),
    failRead: () => { readFailure = true; },
  };
}
const turn = () => new Promise((done) => setImmediate(done));

test('dos suscriptores y refresh repetido comparten una petición; éxito solo al terminar', async () => {
  const r = setup();
  const stop1 = r.store.subscribe(() => {});
  const stop2 = r.store.subscribe(() => {});
  assert.equal(r.store.snapshot().diagnostics.stage, 'inicializando');
  r.emit(true);
  await turn();
  const a = r.store.refresh();
  const b = r.store.refresh();
  assert.equal(a, b);
  assert.equal(r.calls(), 1);
  assert.equal(r.store.snapshot().diagnostics.stage, 'consultando-api');
  r.succeed();
  await a;
  assert.equal(r.writes(), 1);
  assert.equal(r.store.snapshot().diagnostics.stage, 'sincronizado');
  stop1(); stop2();
});

test('fallo remoto conserva caché, no expone error crudo ni inventa desconexión', async () => {
  const r = setup();
  const stop = r.store.subscribe(() => {});
  r.emit(true);
  await turn();
  const pending = r.store.refresh();
  r.fail();
  await pending;
  assert.equal(r.store.snapshot().tickets[0].id, 'guardado');
  assert.equal(r.store.snapshot().offline, false);
  assert.equal(r.store.snapshot().diagnostics.stage, 'error');
  assert.equal(r.store.snapshot().error.includes('error interno'), false);
  assert.equal(r.writes(), 0);
  stop();
});

test('respuesta después de abandonar sesión no escribe ni publica datos', async () => {
  const r = setup();
  const stop = r.store.subscribe(() => {});
  r.emit(true);
  await turn();
  const pending = r.store.refresh();
  stop();
  r.succeed();
  await pending;
  assert.equal(r.writes(), 0);
  assert.notEqual(r.store.snapshot().diagnostics.stage, 'sincronizado');
});

test('arranque sin red lee caché sin consultar API', async () => {
  const r = setup();
  const stop = r.store.subscribe(() => {});
  r.emit(false);
  await turn();
  assert.equal(r.store.snapshot().diagnostics.stage, 'sin-conexion');
  assert.equal(r.store.snapshot().tickets[0].id, 'guardado');
  assert.equal(r.calls(), 0);
  stop();
});

test('fallo de lectura termina carga con error local sin segundo fallo que lo oculte', async () => {
  const r = setup();
  r.failRead();
  const stop = r.store.subscribe(() => {});
  r.emit(true);
  await turn();
  assert.equal(r.store.snapshot().loading, false);
  assert.equal(r.store.snapshot().refreshing, false);
  assert.equal(r.store.snapshot().diagnostics.stage, 'error');
  assert.equal(r.calls(), 0);
  stop();
});
