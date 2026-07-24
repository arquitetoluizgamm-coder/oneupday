import { getSupabase } from '../../lib/supabase';
import { getLocale } from '../../lib/locale';
import { getDict, fill } from '../../lib/i18n';
import { buildDemoStories } from '../../lib/demoStories';
import Logo from '../../components/Logo';
import BottomNav from '../../components/BottomNav';

export const dynamic = 'force-dynamic';

const CATS = ['art', 'body', 'work', 'home', 'life'];

export default async function Explore({ searchParams }) {
  const locale = getLocale();
  const t = getDict(locale);
  const q = (searchParams?.q || '').trim();
  const cat = searchParams?.cat || '';
  const moment = searchParams?.moment || '';
  const catLabel = { art: t.catArt, body: t.catBody, work: t.catWork, home: t.catHome, life: t.catLife };
  const MOMENTS = [['starting', t.mStarting], ['notgiveup', t.mNotgiveup], ['rebuilding', t.mRebuilding], ['health', t.mHealth], ['courage', t.mCourage], ['hardphase', t.mHardphase], ['building', t.mBuilding]];
  const demoIntro = locale === 'pt'
    ? 'Exemplos criados para mostrar como uma jornada pode aparecer no app.'
    : 'Examples created to show how a journey can look inside the app.';
  const demoOutro = locale === 'pt'
    ? 'Quando a comunidade crescer, esse espaço divide atenção com pessoas reais.'
    : 'As the community grows, this space shares attention with real people.';

  const sb = getSupabase();
  let query = sb.from('journeys').select('*').eq('visibility', 'public').order('created_at', { ascending: false }).limit(40);
  if (cat) query = query.eq('category', cat);
  if (moment) query = query.eq('moment', moment);
  if (q) query = query.ilike('title', `%${q}%`);
  const { data: journeys } = await query;
  const js = journeys || [];
  const statsById = {};
  const photoBy = {};
  if (js.length) {
    const { data: stats } = await sb.from('journey_stats').select('*').in('journey_id', js.map(j => j.id));
    (stats || []).forEach(s => { statsById[s.journey_id] = s; });
    const { data: ph } = await sb.from('updates').select('journey_id, photo_url, day_number').in('journey_id', js.map(j => j.id)).not('photo_url', 'is', null).order('day_number', { ascending: false });
    (ph || []).forEach(u => { if (!photoBy[u.journey_id]) photoBy[u.journey_id] = u.photo_url; });
  }

  const demos = buildDemoStories(locale).filter((story) => {
    if (cat && story.category !== cat) return false;
    if (moment && story.moment !== moment) return false;
    if (!q) return true;
    const haystack = `${story.title} ${story.goal} ${story.owner.name} ${story.owner.handle}`.toLowerCase();
    return haystack.includes(q.toLowerCase());
  });

  return (
    <>
      <header className="top">
        <Logo href="/home" />
        <div className="top-right">
          <a className="ghost-btn" href="/home">One Up Day</a>
        </div>
      </header>
      <main className="wrap explore-screen">
        <div className="create-head">
          <p className="eyebrow">{t.explore}</p>
          <h1>{t.exploreTitle}</h1>
          <p className="sub">{t.exploreSub}</p>
        </div>

        <form className="search-box" action="/explore" method="get">
          <input name="q" defaultValue={q} placeholder={t.searchPh} />
        </form>

        <section className="communities">
          <h2>{t.groups}</h2>
          <div className="comm-grid">
            {MOMENTS.map(([v, l]) => (
              <a key={v} className="comm-card" href={`/grupo/${v}`}>{l}</a>
            ))}
          </div>
        </section>

        <div className="cat-chips">
          <a className={`chip${!cat ? ' on' : ''}`} href="/explore">{t.allCats}</a>
          {CATS.map(c => (
            <a key={c} className={`chip${cat === c ? ' on' : ''}`} href={`/explore?cat=${c}`}>{catLabel[c]}</a>
          ))}
        </div>
        <div className="cat-chips moments">
          <a className={`chip${!moment ? ' on' : ''}`} href="/explore">{t.momentAll}</a>
          {MOMENTS.map(([v, l]) => (
            <a key={v} className={`chip moment${moment === v ? ' on' : ''}`} href={`/grupo/${v}`}>{l}</a>
          ))}
        </div>

        {demos.length > 0 && (
          <section className="demo-showcase">
            <div className="demo-showcase-head">
              <div>
                <p className="eyebrow">{t.demoLabelDemo}</p>
                <h2>{t.examplesTitle}</h2>
                <p>{demoIntro}</p>
              </div>
              <span>{demoOutro}</span>
            </div>
            <div className="demo-story-grid">
              {demos.map((story) => (
                <a className="demo-story-card" key={story.slug} href={`/${story.slug}`}>
                  <div className="demo-story-top">
                    <span className="demo-story-avatar" style={{ background: story.owner.avatarColor }}>
                      <img src={story.owner.avatarUrl} alt="" />
                    </span>
                    <div className="demo-story-meta">
                      <b>{story.owner.name}</b>
                      <small>{story.owner.handle}</small>
                    </div>
                    <span className="demo-story-badge">{t.demoExample}</span>
                  </div>
                  <div className="demo-story-copy">
                    <h3>{story.title}</h3>
                    <p>{story.preview}</p>
                  </div>
                  <div className="demo-story-foot">
                    <span>{catLabel[story.category] || ''}</span>
                    <span>{fill(t.dayOf, { d: story.stats.current_day || 0, t: story.total_days, s: story.stats.streak || 0 })}</span>
                  </div>
                  <div className="bar"><span style={{ width: `${Math.max(story.stats.progress_pct || 0, 6)}%` }} /></div>
                </a>
              ))}
            </div>
          </section>
        )}

        {js.length === 0 && <div className="empty"><b>{t.noPublicJourneys}</b></div>}
        <div className="pj-grid">
          {js.map(j => {
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
                  <small>{catLabel[j.category] || ''} · {fill(t.dayOf, { d: st.current_day || 0, t: j.total_days, s: st.streak || 0 })}</small>
                </div>
              </a>
            );
          })}
        </div>
      </main>
      <BottomNav active="explore" t={t} />
    </>
  );
}
