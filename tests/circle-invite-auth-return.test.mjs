import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { safeAuthNext } from '../lib/authNext.mjs';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('destino pós-login aceita somente caminhos internos', () => {
  assert.equal(safeAuthNext('/circulos/convite/abc-123'), '/circulos/convite/abc-123');
  assert.equal(safeAuthNext('/circulos/convite/abc?origem=email'), '/circulos/convite/abc?origem=email');
  assert.equal(safeAuthNext('https://site-malicioso.example'), '/home');
  assert.equal(safeAuthNext('//site-malicioso.example'), '/home');
  assert.equal(safeAuthNext('/\\site-malicioso.example'), '/home');
});

test('login preserva o convite no Google e no código por e-mail', async () => {
  const page = await read('app/login/page.js');
  const google = await read('app/login/GoogleButton.jsx');
  const email = await read('app/login/EmailLogin.jsx');
  assert.match(page, /safeAuthNext\(searchParams\?\.next\)/);
  assert.match(page, /GoogleButton[^>]+nextPath=\{nextPath\}/);
  assert.match(page, /EmailLogin[^>]+nextPath=\{nextPath\}/);
  assert.match(google, /callback\.searchParams\.set\('next', nextPath\)/);
  assert.match(email, /window\.location\.href = nextPath/);
});

test('callback OAuth usa o destino validado e mantém o convite em caso de nova tentativa', async () => {
  const callback = await read('app/auth/callback/route.js');
  assert.match(callback, /safeAuthNext\(searchParams\.get\('next'\) \|\| cookieNext\(request\)\)/);
  assert.match(callback, /new URL\(next, origin\)/);
  assert.match(callback, /retry\.searchParams\.set\('next', next\)/);
});
