// ---- Web Push sem dependências: VAPID (ES256) + AES128GCM ----
// Funciona no runtime Node da Vercel usando apenas o módulo crypto nativo.
import crypto from 'crypto';

const PUB = process.env.VAPID_PUBLIC_KEY || '';
const PRIV = process.env.VAPID_PRIVATE_KEY || '';
const SUBJECT = process.env.VAPID_SUBJECT || 'mailto:arquitetoluizgamm@gmail.com';

export const pushReady = () => !!(PUB && PRIV);

const b64url = (buf) => Buffer.from(buf).toString('base64')
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (str) => Buffer.from(String(str).replace(/-/g, '+').replace(/_/g, '/'), 'base64');

// ---- JWT VAPID (ES256) ----
function vapidToken(audience) {
  const header = b64url(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const payload = b64url(JSON.stringify({
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: SUBJECT,
  }));
  const data = `${header}.${payload}`;

  const d = fromB64url(PRIV);
  const pubRaw = fromB64url(PUB);
  const key = crypto.createPrivateKey({
    key: {
      kty: 'EC', crv: 'P-256',
      d: b64url(d),
      x: b64url(pubRaw.subarray(1, 33)),
      y: b64url(pubRaw.subarray(33, 65)),
    },
    format: 'jwk',
  });
  const sig = crypto.sign('sha256', Buffer.from(data), { key, dsaEncoding: 'ieee-p1363' });
  return `${data}.${b64url(sig)}`;
}

// ---- Criptografia do payload (RFC 8291 / aes128gcm) ----
function encrypt(payload, p256dh, auth) {
  const clientPub = fromB64url(p256dh);
  const authSecret = fromB64url(auth);
  const salt = crypto.randomBytes(16);

  const ecdh = crypto.createECDH('prime256v1');
  ecdh.generateKeys();
  const serverPub = ecdh.getPublicKey();
  const shared = ecdh.computeSecret(clientPub);

  const hmac = (key, info) => crypto.createHmac('sha256', key).update(info).digest();
  const hkdf = (salt_, ikm, info, len) => {
    const prk = hmac(salt_, ikm);
    return hmac(prk, Buffer.concat([info, Buffer.from([1])])).subarray(0, len);
  };

  const prkInfo = Buffer.concat([
    Buffer.from('WebPush: info\0'), clientPub, serverPub,
  ]);
  const ikm = hkdf(authSecret, shared, prkInfo, 32);
  const cek = hkdf(salt, ikm, Buffer.from('Content-Encoding: aes128gcm\0'), 16);
  const nonce = hkdf(salt, ikm, Buffer.from('Content-Encoding: nonce\0'), 12);

  const body = Buffer.concat([Buffer.from(payload, 'utf8'), Buffer.from([2])]);
  const cipher = crypto.createCipheriv('aes-128-gcm', cek, nonce);
  const enc = Buffer.concat([cipher.update(body), cipher.final(), cipher.getAuthTag()]);

  const rs = Buffer.alloc(4);
  rs.writeUInt32BE(4096, 0);
  return Buffer.concat([salt, rs, Buffer.from([serverPub.length]), serverPub, enc]);
}

// Envia um push. Retorna { ok, status } — 404/410 = inscrição morta.
export async function sendPush(sub, data) {
  if (!pushReady()) return { ok: false, status: 0 };
  try {
    const url = new URL(sub.endpoint);
    const body = encrypt(JSON.stringify(data), sub.p256dh, sub.auth);
    const res = await fetch(sub.endpoint, {
      method: 'POST',
      headers: {
        TTL: '86400',
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream',
        Authorization: `vapid t=${vapidToken(url.origin)}, k=${PUB}`,
      },
      body,
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, status: 0 };
  }
}
