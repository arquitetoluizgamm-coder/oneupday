#!/usr/bin/env node
import { copyFile, mkdir, readFile, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceDir = process.argv[2];
const destinationDir = process.argv[3];

if (!sourceDir || !destinationDir) {
  console.error('Uso: node scripts/organize-music-library.mjs <origem> <destino>');
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(await readFile(path.join(here, 'official-music-catalog.json'), 'utf8'));
const sourceRoot = path.resolve(sourceDir);
const destinationRoot = path.resolve(destinationDir);

if (sourceRoot === destinationRoot || destinationRoot.startsWith(`${sourceRoot}${path.sep}`)) {
  console.error('O destino deve ficar fora da pasta temporária de origem.');
  process.exit(1);
}

async function sha256(filePath) {
  const bytes = await readFile(filePath);
  return createHash('sha256').update(bytes).digest('hex');
}

const files = (await readdir(sourceRoot, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.mp3'))
  .map((entry) => entry.name);

const byHash = new Map();
for (const file of files) {
  const hash = await sha256(path.join(sourceRoot, file));
  const matches = byHash.get(hash) || [];
  matches.push(file);
  byHash.set(hash, matches);
}

const expectedHashes = new Set(catalog.map((track) => track.sha256));
const unknown = [...byHash.keys()].filter((hash) => !expectedHashes.has(hash));
const missing = catalog.filter((track) => !byHash.has(track.sha256));
const duplicateTargets = catalog
  .map((track) => track.fileName.toLowerCase())
  .filter((name, index, all) => all.indexOf(name) !== index);

if (unknown.length || missing.length || duplicateTargets.length) {
  console.error(JSON.stringify({ unknown, missing: missing.map((track) => track.id), duplicateTargets }, null, 2));
  process.exit(1);
}

await mkdir(destinationRoot, { recursive: true });
const report = [];
for (const track of catalog) {
  const sourceNames = byHash.get(track.sha256);
  const preferred = sourceNames.find((name) => !name.startsWith('AUDIO-')) || sourceNames[0];
  const source = path.join(sourceRoot, preferred);
  const destination = path.join(destinationRoot, track.fileName);
  await copyFile(source, destination, constants.COPYFILE_EXCL);
  const copiedHash = await sha256(destination);
  if (copiedHash !== track.sha256) throw new Error(`Falha de integridade em ${track.fileName}`);
  report.push({
    source: preferred,
    duplicatesInSource: sourceNames.filter((name) => name !== preferred),
    title: track.title,
    fileName: track.fileName,
    sha256: copiedHash,
  });
}

console.log(JSON.stringify({ copied: report.length, destination: destinationRoot, report }, null, 2));
