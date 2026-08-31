import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';

function synchsafe(bytes, offset = 0) {
  return ((bytes[offset] & 0x7f) << 21)
    | ((bytes[offset + 1] & 0x7f) << 14)
    | ((bytes[offset + 2] & 0x7f) << 7)
    | (bytes[offset + 3] & 0x7f);
}

function decodeText(bytes, encoding) {
  if (!bytes?.length) return '';
  let value = '';
  if (encoding === 0) value = new TextDecoder('windows-1252').decode(bytes);
  else if (encoding === 3) value = new TextDecoder('utf-8').decode(bytes);
  else if (encoding === 2) {
    const swapped = Buffer.alloc(bytes.length - (bytes.length % 2));
    for (let i = 0; i < swapped.length; i += 2) {
      swapped[i] = bytes[i + 1];
      swapped[i + 1] = bytes[i];
    }
    value = new TextDecoder('utf-16le').decode(swapped);
  } else {
    const hasBeBom = bytes[0] === 0xfe && bytes[1] === 0xff;
    const source = hasBeBom
      ? Buffer.from(bytes.subarray(2)).swap16()
      : bytes[0] === 0xff && bytes[1] === 0xfe
        ? bytes.subarray(2)
        : bytes;
    value = new TextDecoder('utf-16le').decode(source);
  }
  return value.replaceAll('\u0000', '').trim();
}

function textTerminator(bytes, encoding) {
  if (encoding === 0 || encoding === 3) {
    const index = bytes.indexOf(0);
    return index < 0 ? { index: bytes.length, size: 0 } : { index, size: 1 };
  }
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    if (bytes[i] === 0 && bytes[i + 1] === 0) return { index: i, size: 2 };
  }
  return { index: bytes.length, size: 0 };
}

function parseId3(buffer) {
  if (buffer.length < 10 || buffer.toString('ascii', 0, 3) !== 'ID3') {
    return { offset: 0, title: '', artist: '', lyrics: '', sourceUrl: '' };
  }
  const version = buffer[3];
  const tagSize = synchsafe(buffer, 6);
  const end = Math.min(buffer.length, 10 + tagSize);
  const meta = { offset: end, title: '', artist: '', lyrics: '', sourceUrl: '' };
  let cursor = 10;

  while (cursor + 10 <= end) {
    const id = buffer.toString('ascii', cursor, cursor + 4);
    if (!/^[A-Z0-9]{4}$/.test(id)) break;
    const frameSize = version === 4
      ? synchsafe(buffer, cursor + 4)
      : buffer.readUInt32BE(cursor + 4);
    if (!frameSize || cursor + 10 + frameSize > end) break;
    const payload = buffer.subarray(cursor + 10, cursor + 10 + frameSize);

    if ((id === 'TIT2' || id === 'TPE1') && payload.length > 1) {
      const value = decodeText(payload.subarray(1), payload[0]);
      if (id === 'TIT2') meta.title = value;
      else meta.artist = value;
    } else if (id === 'USLT' && payload.length > 4) {
      const encoding = payload[0];
      const body = payload.subarray(4);
      const terminator = textTerminator(body, encoding);
      meta.lyrics = decodeText(body.subarray(terminator.index + terminator.size), encoding);
    } else if (id === 'WOAS') {
      meta.sourceUrl = new TextDecoder('windows-1252').decode(payload).replaceAll('\u0000', '').trim();
    }
    cursor += 10 + frameSize;
  }
  return meta;
}

const BITRATES_V1_L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const BITRATES_V2_L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
const SAMPLE_RATES = {
  3: [44100, 48000, 32000],
  2: [22050, 24000, 16000],
  0: [11025, 12000, 8000],
};

function mp3Duration(buffer, initialOffset) {
  let cursor = initialOffset;
  let seconds = 0;
  let frames = 0;
  while (cursor + 4 <= buffer.length) {
    const b0 = buffer[cursor];
    const b1 = buffer[cursor + 1];
    const b2 = buffer[cursor + 2];
    if (b0 !== 0xff || (b1 & 0xe0) !== 0xe0) {
      cursor += 1;
      continue;
    }
    const version = (b1 >> 3) & 0x03;
    const layer = (b1 >> 1) & 0x03;
    const bitrateIndex = (b2 >> 4) & 0x0f;
    const sampleRateIndex = (b2 >> 2) & 0x03;
    const padding = (b2 >> 1) & 0x01;
    if (version === 1 || layer !== 1 || bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3) {
      cursor += 1;
      continue;
    }
    const sampleRate = SAMPLE_RATES[version]?.[sampleRateIndex];
    const bitrate = (version === 3 ? BITRATES_V1_L3 : BITRATES_V2_L3)[bitrateIndex];
    if (!sampleRate || !bitrate) {
      cursor += 1;
      continue;
    }
    const samples = version === 3 ? 1152 : 576;
    const frameLength = Math.floor((version === 3 ? 144000 : 72000) * bitrate / sampleRate) + padding;
    if (frameLength < 24 || cursor + frameLength > buffer.length) break;
    seconds += samples / sampleRate;
    frames += 1;
    cursor += frameLength;
  }
  return frames ? Number(seconds.toFixed(3)) : null;
}

function firstChorus(lyrics) {
  const match = lyrics.match(/\[(?:Chorus|Refr[aã]o)\]([\s\S]*?)(?=\[(?:Verse|Verso|Bridge|Ponte|Post-Chorus|Final Chorus|Outro|Pre-Chorus)\]|$)/i);
  const text = (match?.[1] || lyrics).replace(/\[[^\]]+\]/g, ' ').replace(/\s+/g, ' ').trim();
  return text.slice(0, 600);
}

async function analyze(directory) {
  const names = (await readdir(directory)).filter((name) => extname(name).toLowerCase() === '.mp3').sort();
  const rows = [];
  for (const name of names) {
    const file = join(directory, name);
    const buffer = await readFile(file);
    const meta = parseId3(buffer);
    rows.push({
      file: name,
      bytes: buffer.length,
      sha256: createHash('sha256').update(buffer).digest('hex'),
      duration: mp3Duration(buffer, meta.offset),
      title: meta.title || basename(name, extname(name)),
      artist: meta.artist,
      sourceUrl: meta.sourceUrl,
      chorus: firstChorus(meta.lyrics),
      lyrics: meta.lyrics,
    });
  }
  return rows;
}

const directory = resolve(process.argv[2] || '.');
console.log(JSON.stringify(await analyze(directory), null, 2));
