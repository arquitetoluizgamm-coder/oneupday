#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const sourceDir = process.argv[2];
const dryRun = process.argv.includes('--dry-run');
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/\/$/, '');
const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

if (!sourceDir) {
  console.error('Uso: node scripts/upload-official-music.mjs <catalogo-one-up-day> [--dry-run]');
  process.exit(1);
}
if (!dryRun && (!supabaseUrl || !serviceRole)) {
  console.error('NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.');
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(await readFile(path.join(here, 'official-music-catalog.json'), 'utf8'));
const sourceRoot = path.resolve(sourceDir);

async function verifiedBytes(track) {
  const bytes = await readFile(path.join(sourceRoot, track.fileName));
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (hash !== track.sha256) throw new Error(`Hash inesperado em ${track.fileName}`);
  return bytes;
}

const files = [];
for (const track of catalog) {
  const bytes = await verifiedBytes(track);
  files.push({ track, bytes });
}

if (dryRun) {
  console.log(JSON.stringify({ verified: files.length, bytes: files.reduce((sum, item) => sum + item.bytes.length, 0) }, null, 2));
  process.exit(0);
}

const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });

function metadata(values) {
  return Object.entries(values)
    .map(([key, value]) => `${key} ${Buffer.from(String(value)).toString('base64')}`)
    .join(',');
}

async function resumableUpload(objectPath, bytes) {
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  const endpoint = `https://${projectRef}.storage.supabase.co/storage/v1/upload/resumable`;
  const headers = {
    Authorization: `Bearer ${serviceRole}`,
    apikey: serviceRole,
    'Tus-Resumable': '1.0.0',
  };
  const created = await fetch(endpoint, {
    method: 'POST',
    headers: {
      ...headers,
      'Upload-Length': String(bytes.length),
      'Upload-Metadata': metadata({
        bucketName: 'music',
        objectName: objectPath,
        contentType: 'audio/mpeg',
        cacheControl: '31536000',
      }),
    },
  });
  if (!created.ok) throw new Error(`TUS create ${objectPath}: ${created.status} ${await created.text()}`);
  const location = created.headers.get('location');
  if (!location) throw new Error(`TUS create ${objectPath}: resposta sem Location`);
  const uploadUrl = new URL(location, endpoint).toString();
  const chunkSize = 6 * 1024 * 1024;
  let offset = 0;
  while (offset < bytes.length) {
    const chunk = bytes.subarray(offset, Math.min(bytes.length, offset + chunkSize));
    const patched = await fetch(uploadUrl, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/offset+octet-stream',
        'Upload-Offset': String(offset),
      },
      body: chunk,
    });
    if (!patched.ok) throw new Error(`TUS patch ${objectPath}: ${patched.status} ${await patched.text()}`);
    offset = Number(patched.headers.get('upload-offset'));
    if (!Number.isFinite(offset)) throw new Error(`TUS patch ${objectPath}: offset inválido`);
  }
}

const bucketName = 'music';
const { data: buckets, error: listError } = await supabase.storage.listBuckets();
if (listError) throw listError;
const bucket = (buckets || []).find((item) => item.id === bucketName);
if (!bucket) {
  const { error } = await supabase.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: 20 * 1024 * 1024,
    allowedMimeTypes: ['audio/mpeg'],
  });
  if (error) throw error;
} else if (!bucket.public) {
  throw new Error('O bucket music já existe, mas não é público. Revise-o antes de continuar.');
}

let uploaded = 0;
let skipped = 0;
const { data: existingRows, error: existingError } = await supabase.storage.from(bucketName).list('one-up-day', { limit: 100 });
if (existingError) throw existingError;
const existing = new Set((existingRows || []).map((item) => item.name));
for (const { track, bytes } of files) {
  const objectPath = `one-up-day/${track.fileName}`;
  if (existing.has(track.fileName)) {
    skipped += 1;
    continue;
  }
  if (bytes.length > 6 * 1024 * 1024) {
    await resumableUpload(objectPath, bytes);
    uploaded += 1;
    continue;
  }
  const { error } = await supabase.storage.from(bucketName).upload(objectPath, bytes, {
    contentType: 'audio/mpeg',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error && /already exists|duplicate/i.test(error.message || '')) {
    skipped += 1;
    continue;
  }
  if (error) throw new Error(`${objectPath}: ${error.message}`);
  uploaded += 1;
}

console.log(JSON.stringify({ uploaded, skipped, total: files.length, bucket: bucketName }, null, 2));
