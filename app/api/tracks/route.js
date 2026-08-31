import { NextResponse } from 'next/server';
import catalog from '../../../scripts/official-music-catalog.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const storageBase = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const localBase = (process.env.ONE_MUSIC_BASE_URL || '').trim().replace(/\/$/, '');
  if (!storageBase && !localBase) return NextResponse.json({ tracks: [], configured: false });
  const audioRoot = localBase || `${storageBase}/storage/v1/object/public/music/one-up-day`;
  const q = (new URL(req.url).searchParams.get('q') || '').trim();
  const needle = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const tracks = catalog
    .filter((track) => {
      if (!needle) return true;
      const haystack = `${track.title} ${track.collection}`
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return haystack.includes(needle);
    })
    .map((track) => ({
      id: track.id,
      title: track.title,
      artist: 'One Up Day',
      duration: track.duration,
      collection: track.collection,
      audio_url: `${audioRoot}/${track.fileName}`,
    }));
  return NextResponse.json({ tracks, configured: true });
}
