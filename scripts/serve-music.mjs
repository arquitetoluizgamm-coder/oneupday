#!/usr/bin/env node
import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '');
const port = Number(process.argv[3]) || 5055;
if (!process.argv[2]) {
  console.error('Uso: node scripts/serve-music.mjs <catalogo-one-up-day> [porta]');
  process.exit(1);
}

http.createServer(async (req, res) => {
  try {
    const name = path.basename(decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname));
    if (!name.toLowerCase().endsWith('.mp3')) throw new Error('not found');
    const file = path.join(root, name);
    const info = await stat(file);
    const range = req.headers.range;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', 'audio/mpeg');
    if (!range) {
      res.writeHead(200, { 'Content-Length': info.size });
      createReadStream(file).pipe(res);
      return;
    }
    const [startText, endText] = range.replace('bytes=', '').split('-');
    const start = Math.max(0, Number(startText) || 0);
    const end = Math.min(info.size - 1, endText ? Number(endText) : info.size - 1);
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${info.size}`,
      'Content-Length': end - start + 1,
    });
    createReadStream(file, { start, end }).pipe(res);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`music-server http://127.0.0.1:${port}`));
