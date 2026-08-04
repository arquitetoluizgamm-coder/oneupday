import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const SIZE = { width: 1200, height: 630 };
const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();

async function fetchJourney(slug) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !key) return null;
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const journeyUrl = `${base}/rest/v1/journeys?slug=eq.${encodeURIComponent(slug)}&is_public=eq.true&select=id,title,goal,cover_url,total_days,updated_at,created_at&limit=1`;
  const journeyResponse = await fetch(journeyUrl, { headers, cache: 'no-store' });
  if (!journeyResponse.ok) return null;
  const [journey] = await journeyResponse.json();
  if (!journey) return null;
  const updatesUrl = `${base}/rest/v1/updates?journey_id=eq.${journey.id}&select=text,photo_url,day_number,created_at&order=day_number.desc&limit=1`;
  const updatesResponse = await fetch(updatesUrl, { headers, cache: 'no-store' });
  const [update] = updatesResponse.ok ? await updatesResponse.json() : [];
  const text = clean(update?.text || journey.goal);
  return {
    journey,
    update,
    excerpt: text.length > 160 ? `${text.slice(0, 157).trimEnd()}...` : text,
  };
}

async function imageData(url) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return `data:${response.headers.get('content-type') || 'image/jpeg'};base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

function ShareCard({ title, excerpt, image, totalDays }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#f8f5ee', color: '#10152f', fontFamily: 'sans-serif', padding: 52 }}>
      <div style={{ width: '53%', display: 'flex', flexDirection: 'column', paddingRight: 42 }}>
        <div style={{ display: 'flex', fontSize: 27, fontWeight: 800, color: '#5d6c57' }}>ONE UP DAY</div>
        <div style={{ display: 'flex', marginTop: 28, fontSize: 20, letterSpacing: 2, fontWeight: 700, color: '#c47152' }}>PUBLIC JOURNEY</div>
        <div style={{ display: 'flex', marginTop: 18, fontSize: 48, lineHeight: 1.08, fontWeight: 800 }}>{title}</div>
        <div style={{ display: 'flex', marginTop: 22, fontSize: 25, lineHeight: 1.25, color: '#4d5562' }}>{excerpt || 'One real step at a time.'}</div>
        <div style={{ display: 'flex', marginTop: 'auto', fontSize: 23, fontWeight: 700, color: '#5d6c57' }}>Day 1 of {totalDays || 'a journey'}</div>
        <div style={{ display: 'flex', marginTop: 12, fontSize: 20, color: '#8a6e5e' }}>Coming back is progress.</div>
      </div>
      <div style={{ width: '47%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#dfe5d8', borderRadius: 28, overflow: 'hidden' }}>
        {image ? <img src={image} width="510" height="526" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', fontSize: 34, color: '#5d6c57', textAlign: 'center', padding: 40 }}>One day at a time.</div>}
      </div>
    </div>
  );
}

export async function GET(request, { params }) {
  try {
    const slug = decodeURIComponent(params.slug);
    const data = await fetchJourney(slug);
    const query = new URL(request.url).searchParams;
    const title = clean(query.get('title')) || data?.journey?.title || 'One Up Day';
    const excerpt = clean(query.get('description')) || data?.excerpt;
    const image = await imageData(data?.update?.photo_url || data?.journey?.cover_url);
    return new ImageResponse(
      <ShareCard title={title} excerpt={excerpt} image={image} totalDays={data?.journey?.total_days} />,
      { ...SIZE, headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } },
    );
  } catch {
    return fetch(new URL('/og-capa.png', request.url), { cache: 'no-store' });
  }
}
