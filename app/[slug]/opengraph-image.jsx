import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'One Up Day';

const esc = (value) => String(value || '').replace(/\s+/g, ' ').trim();

async function readJourney(slug) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !key) return null;
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const journeyUrl = `${base}/rest/v1/journeys?slug=eq.${encodeURIComponent(slug)}&is_public=eq.true&select=id,title,goal,cover_url&limit=1`;
  const jr = await fetch(journeyUrl, { headers, cache: 'no-store' });
  const [journey] = await jr.json();
  if (!journey) return null;
  const updatesUrl = `${base}/rest/v1/updates?journey_id=eq.${journey.id}&select=text,photo_url,day_number&order=day_number.desc&limit=1`;
  const ur = await fetch(updatesUrl, { headers, cache: 'no-store' });
  const [update] = await ur.json();
  const text = esc(update?.text || journey.goal);
  return { journey, update, excerpt: text.length > 190 ? `${text.slice(0, 187).trimEnd()}…` : text };
}

async function asDataUrl(url) {
  if (!url) return null;
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return `data:${response.headers.get('content-type') || 'image/jpeg'};base64,${btoa(binary)}`;
  } catch { return null; }
}

function Card({ title, excerpt, image }) {
  return <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#f8f5ee', color: '#10152f', fontFamily: 'Arial', padding: '46px' }}>
    <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: '#5d6c57' }}>ONE · uma jornada real</div>
    <div style={{ display: 'flex', marginTop: 24, gap: 34, alignItems: 'center' }}>
      {image ? <img src={image} width="370" height="300" style={{ objectFit: 'cover', borderRadius: 18 }} /> : null}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', fontSize: 42, fontWeight: 800, lineHeight: 1.12 }}>{title}</div>
        <div style={{ display: 'flex', marginTop: 24, fontSize: 25, lineHeight: 1.3, color: '#4c5362' }}>{excerpt}</div>
      </div>
    </div>
    <div style={{ display: 'flex', marginTop: 'auto', fontSize: 24, color: '#c47152', fontWeight: 700 }}>oneupday.app</div>
  </div>;
}

export default async function OG({ params }) {
  try {
    const slug = decodeURIComponent(params.slug);
    const data = await readJourney(slug);
    const image = await asDataUrl(data?.update?.photo_url || data?.journey?.cover_url);
    return new ImageResponse(
      <Card title={data?.journey?.title || 'One Up Day'} excerpt={data?.excerpt || 'Um passo real, um dia de cada vez.'} image={image} />,
      { ...size }
    );
  } catch {
    return fetch('https://oneupday.app/og-capa.png');
  }
}
