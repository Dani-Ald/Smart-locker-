const crypto = require('crypto');

const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');

console.log('Configura estas variables directamente en tu proveedor de despliegue:');
console.log(`QR_ED25519_PRIVATE_KEY=${privateKey.export({ format: 'der', type: 'pkcs8' }).toString('base64')}`);
console.log(`QR_ED25519_PUBLIC_KEY=${publicKey.export({ format: 'der', type: 'spki' }).toString('base64')}`);
console.log('QR_KEY_ID=smart-ticket-1');
