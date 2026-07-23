import { getSupabase } from '../../../lib/supabase';
import { getLocale } from '../../../lib/locale';
import { getDict, fill } from '../../../lib/i18n';
import { TOPICS } from '../../../lib/topics';
import Logo from '../../../components/Logo';
import { notFound } from 'next/navigation';

export const revalidate = 300;

async function load(topic) {
  const sb = getSupabase();
  const col = topic.by;
  const { data: journeys } = await sb.from('journeys')
    .select('id, slug, title, cover_color, total_days').eq('visibility', 'public').eq(col, topic.val)
    .order('created_at', { ascending: false }).limit(24);
  const js = journeys || [];
  const statsById = {}, photoBy = {};
  if (js.length) {
    const ids = js.map(j => j.id);
    const { data: stats } = await sb.from('journey_stats').select('*').in('journey_id', ids);
    (stats || []).forEach(s => { statsById[s.journey_id] = s; });
    const { data: ph } = await sb.from('updates').select('journey_id, photo_url, day_number').in('journey_id', ids).not('photo_url', 'is', null).order('day_number', { ascending: false });
    (ph || []).forEach(u => { if (!photoBy[u.journey_id]) photoBy[u.journey_id] = u.photo_url; });
  }
  return { journeys: js, statsById, photoBy };
}

export async function generateMetadata({ params }) {
  const topic = TOPICS[params.slug];
  if (!topic) return { title: 'One Up Day' };
  const loc = getLocale(); const c = topic[loc] || topic.pt;
  return { title: `${c.h} · One Up Day`, description: c.d, openGraph: { title: c.h, description: c.d } };
}

export default async function Tema({ params }) {
  const topic = TOPICS[params.slug];
  if (!topic) notFound();
  const loc = getLocale(); const c = topic[loc] || topic.pt;
  const t = getDict(loc);
  const { journeys, statsById, photoBy } = await load(topic);

  return (
    <>
      <header className="top"><Logo href="/" /><div className="top-right"><a className="cta" href="/login">{t.startYourJourney}</a></div></header>
      <main className="wrap">
        <section className="tema-hero">
          <p className="eyebrow">{t.demoLabelDemo}</p>
          <h1>{c.h}</h1>
          <p>{c.d}</p>
          <a className="cta grow" href="/login">{t.landCta}</a>
        </section>
        {journeys.length === 0 && <div className="empty"><b>{t.noPublicJourneys}</b></div>}
        <div className="pj-grid">
          {journeys.map(j => {
            const st = statsById[j.id] || {};
            const pct = Math.min(100, st.progress_pct || 0);
            return (
              <a className="pj-card" key={j.id} href={`/${j.slug}`}>
                <div className="pj-thumb" style={photoBy[j.id] ? { backgroundImage: `linear-gradient(180deg, rgba(9,12,42,.1), rgba(9,12,42,.5)), url(${photoBy[j.id]})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: `linear-gradient(135deg, var(--night), ${j.cover_color})` }}>
                  <span>{fill(t.dayShort, { d: st.current_day || 0 })}</span>
                </div>
                <div className="pj-body">
                  <b>{j.title}</b>
                  <div className="bar"><span style={{ width: (pct > 0 ? Math.max(pct, 6) : 0) + '%' }} /></div>
                  <small>{fill(t.dayOf, { d: st.current_day || 0, t: j.total_days, s: st.streak || 0 })}</small>
                </div>
              </a>
            );
          })}
        </div>
      </main>
      <footer className="foot">One <b>Up</b> Day · {t.tagline}</footer>
    </>
  );
}
