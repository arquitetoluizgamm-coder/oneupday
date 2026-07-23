import { ImageResponse } from 'next/og';
import { getSupabase } from '../../lib/supabase';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'One Up Day';

function Card({ big, title, sub, foot, kind }) {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', padding: '70px', background: '#090c2a',
      backgroundImage: 'radial-gradient(600px 300px at 90% 0%, rgba(240,47,135,.35), transparent), radial-gradient(600px 300px at 0% 100%, rgba(255,211,61,.22), transparent)',
      fontFamily: 'sans-serif',
    }}>
      <div style={{ display: 'flex', fontSize: 40, fontWeight: 800, color: '#fff' }}>
        One <span style={{ color: '#ff7a45', margin: '0 10px' }}>Up</span> Day
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {kind === 'setback' && (
          <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,.7)', marginBottom: 10, fontWeight: 700 }}>
            SETBACK · STILL IN THE JOURNEY
          </div>
        )}
        <div style={{
          display: 'flex', fontSize: 120, fontWeight: 900, lineHeight: 1,
          backgroundImage: 'linear-gradient(90deg,#f02f87,#ff7a45,#ffd33d)',
          backgroundClip: 'text', color: 'transparent',
        }}>{big}</div>
        <div style={{ display: 'flex', fontSize: 60, fontWeight: 800, color: '#fff', marginTop: 20, maxWidth: 1000 }}>{title}</div>
        {sub ? <div style={{ display: 'flex', fontSize: 34, color: 'rgba(255,255,255,.7)', marginTop: 14 }}>{sub}</div> : null}
      </div>
      <div style={{ display: 'flex', fontSize: 30, color: 'rgba(255,255,255,.6)', fontWeight: 600 }}>{foot}</div>
    </div>
  );
}

export default async function OG({ params }) {
  const slug = decodeURIComponent(params.slug);
  const sb = getSupabase();

  if (slug.startsWith('@')) {
    const { data: p } = await sb.from('profiles').select('name, handle').eq('handle', slug).maybeSingle();
    return new ImageResponse(
      <Card big="" title={p?.name || 'One Up Day'} sub={p?.handle || ''} foot={`oneupday.app/${p?.handle || ''}`} />,
      { ...size }
    );
  }

  const { data: j } = await sb.from('journeys').select('*').eq('slug', slug).eq('is_public', true).maybeSingle();
  if (!j) {
    return new ImageResponse(<Card big="" title="One day. One step up." sub="" foot="oneupday.app" />, { ...size });
  }
  const { data: s } = await sb.from('journey_stats').select('*').eq('journey_id', j.id).maybeSingle();
  const day = s?.current_day || 0;
  return new ImageResponse(
    <Card big={`Day ${day}`} title={j.title} sub={`${s?.streak || 0} day streak · ${day}/${j.total_days}`} foot={`oneupday.app/${j.slug}`} />,
    { ...size }
  );
}
