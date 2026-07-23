import { getSupabase } from '../lib/supabase';
import { getLocale } from '../lib/locale';
import { getDict, fill } from '../lib/i18n';
import Logo from '../components/Logo';
import { createClient } from '../lib/supabase/server';
import { redirect } from 'next/navigation';
import ProgressBar from '../components/ProgressBar';

export const dynamic = 'force-dynamic';

let _demoCache = { at: 0, val: undefined };
async function loadDemo() {
  if (_demoCache.val !== undefined && Date.now() - _demoCache.at < 90000) return _demoCache.val;
  try {
    const sb = getSupabase();
    const { data: journeys } = await sb.from('journeys')
      .select('id, slug, title, cover_color, total_days, owner_id')
      .eq('visibility', 'public').order('created_at', { ascending: false }).limit(12);
    const js = journeys || [];
    if (!js.length) return null;
    const ids = js.map(j => j.id);
    // 3 consultas em lote (sem N+1)
    const [{ data: stats }, { data: photos }, { data: profs }] = await Promise.all([
      sb.from('journey_stats').select('*').in('journey_id', ids),
      sb.from('updates').select('journey_id, photo_url, day_number').in('journey_id', ids).not('photo_url', 'is', null).order('day_number', { ascending: false }),
      sb.from('profiles').select('id, name, avatar_color, avatar_url').in('id', js.map(j => j.owner_id)),
    ]);
    const stById = {}; (stats || []).forEach(s => { stById[s.journey_id] = s; });
    const photoBy = {}; (photos || []).forEach(u => { if (!photoBy[u.journey_id]) photoBy[u.journey_id] = u.photo_url; });
    const pById = {}; (profs || []).forEach(pr => { pById[pr.id] = pr; });
    let best = null, photoCount = 0;
    for (const j of js) {
      const st = stById[j.id]; const photo = photoBy[j.id];
      if (!st || (st.current_day || 0) < 1 || !photo) continue;
      photoCount++;
      if (!best) best = { journey: j, stats: st, owner: pById[j.owner_id] || {}, photo };
    }
    // só mostra jornada real quando já há volume (3+ com foto); até lá, usa a demo
    const out = photoCount >= 3 ? best : null;
    _demoCache = { at: Date.now(), val: out };
    return out;
  } catch (e) {}
  _demoCache = { at: Date.now(), val: null };
  return null;
}

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/home');
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
              <span className="land-demo-label">{demo.fallback ? t.demoLabelDemo : t.demoLabel}</span>
              <a className="demo-card" href={demo.fallback ? '/login' : `/${demo.journey.slug}`}>
                <div className="demo-cover" style={demo.photo
                  ? { backgroundImage: `linear-gradient(180deg, rgba(9,12,42,.05), rgba(9,12,42,.55)), url(${demo.photo})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: `linear-gradient(135deg, var(--night), ${demo.journey.cover_color})` }}>
                  <span className="demo-day">{t.cardDay} {day}</span>
                  {demo.fallback && <span className="demo-example">{t.demoExample}</span>}
                </div>
                <div className="demo-body">
                  <div className="demo-who">
                    <span className="demo-ava" style={{ background: demo.owner.avatar_color || 'var(--orange)' }}>
                      {demo.owner.avatar_url ? <img src={demo.owner.avatar_url} alt="" /> : initial}
                    </span>
                    <b>{demo.journey.title}</b>
                  </div>
                  <ProgressBar day={day} total={demo.journey.total_days} dayTpl={t.dayXofY} goalWord={t.goalWord} />
                </div>
              </a>
            </section>
          );
        })()}

        <section className="manifesto">
          <p className="manifesto-1">{t.thesis1}</p>
          <p className="manifesto-2">{t.thesis2}</p>
          <p className="manifesto-sub">{t.thesisSub}</p>
        </section>

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
          <b><a href="/dia1" style={{color:'inherit'}}>{t.examplesTitle}</a></b>
          <div className="example-pills">
            {[t.ex1, t.ex2, t.ex3, t.ex4, t.ex5].map((ex, i) => (
              <a key={i} href="/login" className="example-pill">{ex}</a>
            ))}
          </div>
        </section>
      </main>

      <footer className="foot"><p>One <b>Up</b> Day · {t.tagline}</p><p className="foot-care">{t.notTherapy}</p></footer>
    </>
  );
}
