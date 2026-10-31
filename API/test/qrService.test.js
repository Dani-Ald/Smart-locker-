const assert = require('node:assert/strict');
const crypto = require('crypto');
const test = require('node:test');

const { createSignedTicketPayload } = require('../src/services/qrService');

test('firma un boleto que puede validarse con la clave pública', () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  process.env.QR_ED25519_PRIVATE_KEY = privateKey
    .export({ format: 'der', type: 'pkcs8' })
    .toString('base64');
  process.env.QR_KEY_ID = 'test-key';

  const encoded = createSignedTicketPayload({
    ticketId: 'ticket-1',
    eventId: 'event-1',
    holderId: 'user-1',
    nonce: 'nonce-1',
    issuedAt: '2026-10-31T00:00:00.000Z',
  });
  const envelope = JSON.parse(encoded);

  assert.equal(envelope.alg, 'Ed25519');
  assert.equal(envelope.kid, 'test-key');
  assert.equal(
    crypto.verify(
      null,
      Buffer.from(envelope.payload),
      publicKey,
      Buffer.from(envelope.signature, 'base64url'),
    ),
    true,
  );
});
