import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const cid = (process.env.JAMENDO_CLIENT_ID || '').trim();
  if (!cid) return NextResponse.json({ tracks: [], configured: false });
  const q = (new URL(req.url).searchParams.get('q') || '').trim();
  const params = new URLSearchParams({
    client_id: cid, format: 'json', limit: '24',
    audioformat: 'mp32', order: 'popularity_month',
  });
  if (q) params.set('search', q); else params.set('tags', 'calm');
  try {
    const r = await fetch(`https://api.jamendo.com/v3.0/tracks/?${params.toString()}`, { cache: 'no-store' });
    const j = await r.json();
    const results = j.results || [];
    const tracks = results.map(t => ({
      id: t.id, title: t.name, artist: t.artist_name,
      audio_url: t.audio, cover: t.image, duration: t.duration,
    })).filter(t => t.audio_url);
    if (!tracks.length) {
      return NextResponse.json({ tracks: [], configured: true, reason: j?.headers?.error_message || 'no results' });
    }
    return NextResponse.json({ tracks, configured: true });
  } catch (e) {
    return NextResponse.json({ tracks: [], configured: true, reason: 'fetch failed' });
  }
}
