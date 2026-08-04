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

function ShareCard({ title, excerpt, image, totalDays, currentDay }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#10152f', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', height: 390, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#dfe5d8', overflow: 'hidden' }}>
        {image ? <img src={image} width="1200" height="390" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center' }} /> : <div style={{ display: 'flex', fontSize: 42, color: '#5d6c57', textAlign: 'center', padding: 40 }}>ONE UP DAY</div>}
      </div>
      <div style={{ width: '100%', height: 240, display: 'flex', flexDirection: 'column', padding: '24px 52px 20px' }}>
        <div style={{ display: 'flex', fontSize: 18, letterSpacing: 2, fontWeight: 700, color: '#d78b6d' }}>ONE UP DAY  ·  JORNADA EM ANDAMENTO</div>
        <div style={{ display: 'flex', marginTop: 10, fontSize: 42, lineHeight: 1.08, fontWeight: 800 }}>{title}</div>
        <div style={{ display: 'flex', marginTop: 'auto', fontSize: 20, color: '#d6dfd0' }}>Dia {currentDay || 1} de {totalDays || 'uma jornada'}  ·  {excerpt || 'Um passo real de cada vez.'}</div>
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
    const mediaUrl = query.get('media') || data?.update?.photo_url || data?.journey?.cover_url;
    const image = await imageData(mediaUrl);
    const totalDays = query.get('total') || data?.journey?.total_days;
    const currentDay = query.get('day') || data?.update?.day_number || 1;
    return new ImageResponse(
      <ShareCard title={title} excerpt={excerpt} image={image} totalDays={totalDays} currentDay={currentDay} />,
      { ...SIZE, headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } },
    );
  } catch {
    return fetch(new URL('/og-capa.png', request.url), { cache: 'no-store' });
  }
}
