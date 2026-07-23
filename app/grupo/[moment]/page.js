import { getSupabase } from '../../../lib/supabase';
import { getLocale } from '../../../lib/locale';
import { getDict, fill } from '../../../lib/i18n';
import Logo from '../../../components/Logo';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const MOMENTS = ['starting', 'notgiveup', 'rebuilding', 'health', 'courage', 'hardphase', 'building'];

export async function generateMetadata({ params }) {
  const t = getDict(getLocale());
  const labels = momentLabels(t);
  const l = labels[params.moment];
  return { title: l ? `${l} · One Up Day` : 'One Up Day' };
}

function momentLabels(t) {
  return {
    starting: t.mStarting, notgiveup: t.mNotgiveup, rebuilding: t.mRebuilding,
    health: t.mHealth, courage: t.mCourage, hardphase: t.mHardphase, building: t.mBuilding,
  };
}

export default async function Group({ params }) {
  const moment = params.moment;
  if (!MOMENTS.includes(moment)) notFound();
  const t = getDict(getLocale());
  const label = momentLabels(t)[moment];

  const sb = getSupabase();
  const { data: journeys } = await sb.from('journeys')
    .select('*').eq('visibility', 'public').eq('moment', moment)
    .order('created_at', { ascending: false }).limit(40);
  const js = journeys || [];
  const statsById = {};
  const owners = {};
  if (js.length) {
    const { data: stats } = await sb.from('journey_stats').select('*').in('journey_id', js.map(j => j.id));
    (stats || []).forEach(s => { statsById[s.journey_id] = s; });
    const oIds = [...new Set(js.map(j => j.owner_id))];
    const { data: profs } = await sb.from('profiles').select('id, name, avatar_color, avatar_url, handle').in('id', oIds);
    (profs || []).forEach(pr => { owners[pr.id] = pr; });
  }
  const people = new Set(js.map(j => j.owner_id)).size;

  return (
    <>
      <header className="top"><Logo href="/" /><div className="top-right"><a className="cta" href="/login">{t.startYourJourney}</a></div></header>
      <main className="wrap">
        <section className="group-hero">
          <p className="eyebrow">{t.groups}</p>
          <h1>{label}</h1>
          <p className="group-sub">{fill(t.groupPeople, { n: people })} · {t.groupIntro}</p>
        </section>

        {js.length === 0 && <div className="empty"><b>{t.groupEmpty}</b></div>}
        <div className="pj-grid">
          {js.map(j => {
            const st = statsById[j.id] || {};
            const pct = Math.min(100, st.progress_pct || 0);
            const o = owners[j.owner_id] || {};
            return (
              <a className="pj-card" key={j.id} href={`/${j.slug}`}>
                <div className="pj-thumb" style={{ background: `linear-gradient(135deg, var(--night), ${j.cover_color})` }}>
                  <span>{fill(t.dayShort, { d: st.current_day || 0 })}</span>
                </div>
                <div className="pj-body">
                  <div className="pj-who">
                    <span className="pj-ava" style={{ background: o.avatar_color || 'var(--orange)' }}>
                      {o.avatar_url ? <img src={o.avatar_url} alt="" /> : (o.name || '?')[0]}
                    </span>
                    <b>{j.title}</b>
                  </div>
                  <div className="bar"><span style={{ width: (pct > 0 ? Math.max(pct, 6) : 0) + '%' }} /></div>
                  <small>{o.name} · {fill(t.dayOf, { d: st.current_day || 0, t: j.total_days, s: st.streak || 0 })}</small>
                </div>
              </a>
            );
          })}
        </div>
      </main>
    </>
  );
}
