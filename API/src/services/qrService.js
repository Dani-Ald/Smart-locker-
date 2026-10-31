const crypto = require('crypto');

function getPrivateKey() {
  const encodedKey = process.env.QR_ED25519_PRIVATE_KEY;
  if (!encodedKey) throw new Error('QR_ED25519_PRIVATE_KEY no está configurada.');
  return crypto.createPrivateKey({
    key: Buffer.from(encodedKey, 'base64'),
    format: 'der',
    type: 'pkcs8',
  });
}

function createSignedTicketPayload(claims) {
  const payload = Buffer.from(JSON.stringify({
    v: 1,
    ticketId: claims.ticketId,
    eventId: claims.eventId,
    holderId: claims.holderId,
    nonce: claims.nonce,
    issuedAt: claims.issuedAt,
  })).toString('base64url');
  const signature = crypto.sign(null, Buffer.from(payload), getPrivateKey()).toString('base64url');

  return JSON.stringify({
    v: 1,
    alg: 'Ed25519',
    kid: process.env.QR_KEY_ID || 'smart-ticket-1',
    payload,
    signature,
  });
}

function getPublicKey() {
  const configured = process.env.QR_ED25519_PUBLIC_KEY;
  if (configured) return configured;
  return crypto.createPublicKey(getPrivateKey()).export({ format: 'der', type: 'spki' }).toString('base64');
}

module.exports = { createSignedTicketPayload, getPublicKey };
