import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('home não espera mais pelo card de próximo capítulo', async () => {
  const source = await read('app/home/page.js');
  assert.doesNotMatch(source, /NextChapter|computeNextChapter|ncLabels/);
  assert.doesNotMatch(source, /from\('journeys'\)|from\('journey_stats'\)/);
  assert.match(source, /<AppTop\s+sino\s+authenticated\s*\/>/);
  assert.match(source, /<BottomNav[^>]+userId=\{user\.id\}[^>]+initialProfile=\{profile\}/);
});

test('requisições auxiliares aguardam a primeira página do feed', async () => {
  const source = await read('app/home/FeedClient.jsx');
  assert.match(source, /if \(!started \|\| secondaryStartedRef\.current\)/);
  assert.match(source, /requestIdleCallback/);
  assert.match(source, /aria-busy=\{!started\}/);
});

test('endpoint do feed não repete consultas para montar a faixa musical', async () => {
  const source = await read('app/api/feed/route.js');
  assert.doesNotMatch(source, /\.select\('\*'\)/);
  assert.doesNotMatch(source, /tracksR|trackMetaR|trackMixR|mediaMoodR/);
  assert.match(source, /trackByUpdate\[item\.id\] = \{/);
});
