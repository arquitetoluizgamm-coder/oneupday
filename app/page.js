import { getSupabase } from '../lib/supabase';
import { getLocale } from '../lib/locale';
import { getDict, fill } from '../lib/i18n';
import Logo from '../components/Logo';

export const dynamic = 'force-dynamic';

async function loadDemo() {
  try {
    const sb = getSupabase();
    const { data: journeys } = await sb.from('journeys')
      .select('id, slug, title, cover_color, total_days, owner_id')
      .eq('is_public', true).order('created_at', { ascending: false }).limit(12);
    let photoOnly = null, fallback = null;
    for (const j of (journeys || [])) {
      const { data: st } = await sb.from('journey_stats').select('*').eq('journey_id', j.id).maybeSingle();
      if (!st || (st.current_day || 0) < 1) continue;
      const { data: ups } = await sb.from('updates')
        .select('photo_url, day_number').eq('journey_id', j.id)
        .not('photo_url', 'is', null).order('day_number', { ascending: false }).limit(1);
      const photo = ups && ups[0] ? ups[0].photo_url : null;
      const { data: owner } = await sb.from('profiles').select('name, avatar_color, avatar_url').eq('id', j.owner_id).maybeSingle();
      const item = { journey: j, stats: st, owner: owner || {}, photo };
      if (photo && owner && owner.avatar_url) return item;  // melhor: foto real + rosto real
      if (photo && !photoOnly) photoOnly = item;            // 2ª opção: só foto
      if (!fallback) fallback = item;                       // 3ª: válida sem foto
    }
    return photoOnly || fallback;
  } catch (e) {}
  return null;
}

export default async function Home() {
  const t = getDict(getLocale());
  const real = await loadDemo();
  const demo = (real && real.photo) ? real : {
    journey: { slug: '__demo', title: t.demoFbTitle, cover_color: '#0ea5e9', total_days: 60 },
    stats: { current_day: 21, progress_pct: 35, streak: 21 },
    owner: { name: 'Marina', avatar_url: '/demo-avatar.jpg', avatar_color: '#0ea5e9' },
    photo: '/demo-cover.jpg',
    fallback: true,
  };

  const ideas = [
    { k: 'start', b: t.ideaStart, l: t.ideaStartL, d: 'M12 5v14M5 12h14' },
    { k: 'share', b: t.ideaShare, l: t.ideaShareL, d: 'M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13' },
    { k: 'continue', b: t.ideaContinue, l: t.ideaContinueL, d: 'M5 12h14M13 6l6 6-6 6' },
  ];

  return (
    <>
      <header className="top land-top"><Logo href="/" size={40} /></header>

      <main className="landing">
        <section className="land-hero">
          <h1>{t.landHeadline}</h1>
          <p className="land-sub">{t.landSub}</p>
          <p className="land-explain">{t.landExplain}</p>
          <a className="cta grow land-cta" href="/login">{t.landCta}</a>
          <p className="land-safety">{t.landSafety}</p>
        </section>

        {demo && (() => {
          const pct = Math.min(100, demo.stats.progress_pct || 0);
          const day = demo.stats.current_day || 0;
          const initial = (demo.owner.name || '?')[0];
          return (
            <section className="land-demo">
              <span className="land-demo-label">{t.demoLabel}</span>
              <a className="demo-card" href={demo.fallback ? '/login' : `/${demo.journey.slug}`}>
                <div className="demo-cover" style={demo.photo
                  ? { backgroundImage: `linear-gradient(180deg, rgba(9,12,42,.05), rgba(9,12,42,.55)), url(${demo.photo})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: `linear-gradient(135deg, var(--night), ${demo.journey.cover_color})` }}>
                  <span className="demo-day">{t.cardDay} {day}</span>
                </div>
                <div className="demo-body">
                  <div className="demo-who">
                    <span className="demo-ava" style={{ background: demo.owner.avatar_color || 'var(--orange)' }}>
                      {demo.owner.avatar_url ? <img src={demo.owner.avatar_url} alt="" /> : initial}
                    </span>
                    <b>{demo.journey.title}</b>
                  </div>
                  <div className="bar"><span style={{ width: pct + '%' }} /></div>
                  <small>{demo.owner.name} · {fill(t.dayXofY, { d: day, t: demo.journey.total_days })}</small>
                </div>
              </a>
            </section>
          );
        })()}

        <section className="land-ideas">
          {ideas.map(i => (
            <div key={i.k}>
              <span className="idea-ico">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={i.d} /></svg>
              </span>
              <b>{i.b}</b>
              <span className="idea-l">{i.l}</span>
            </div>
          ))}
        </section>

        <section className="examples">
          <b>{t.examplesTitle}</b>
          <div className="example-pills">
            {[t.ex1, t.ex2, t.ex3, t.ex4, t.ex5].map((ex, i) => (
              <a key={i} href="/login" className="example-pill">{ex}</a>
            ))}
          </div>
        </section>
      </main>

      <footer className="foot">One <b>Up</b> Day · {t.tagline}</footer>
    </>
  );
}
