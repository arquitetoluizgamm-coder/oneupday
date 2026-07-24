import { getSupabase } from '../../lib/supabase';
import { getLocale } from '../../lib/locale';
import { getDict, fill } from '../../lib/i18n';
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
    const { data: stats } = await sb.from('journey_stats').select('*').in('journey_id', js.map((journey) => journey.id));
    (stats || []).forEach((stat) => { statsById[stat.journey_id] = stat; });

    const { data: photos } = await sb.from('updates')
      .select('journey_id, photo_url, day_number')
      .in('journey_id', js.map((journey) => journey.id))
      .not('photo_url', 'is', null)
      .order('day_number', { ascending: false });
    (photos || []).forEach((item) => {
      if (!photoBy[item.journey_id]) photoBy[item.journey_id] = item.photo_url;
    });
  }

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
            {MOMENTS.map(([value, label]) => (
              <a key={value} className="comm-card" href={`/grupo/${value}`}>{label}</a>
            ))}
          </div>
        </section>

        <div className="cat-chips">
          <a className={`chip${!cat ? ' on' : ''}`} href="/explore">{t.allCats}</a>
          {CATS.map((value) => (
            <a key={value} className={`chip${cat === value ? ' on' : ''}`} href={`/explore?cat=${value}`}>{catLabel[value]}</a>
          ))}
        </div>
        <div className="cat-chips moments">
          <a className={`chip${!moment ? ' on' : ''}`} href="/explore">{t.momentAll}</a>
          {MOMENTS.map(([value, label]) => (
            <a key={value} className={`chip moment${moment === value ? ' on' : ''}`} href={`/grupo/${value}`}>{label}</a>
          ))}
        </div>

        {js.length === 0 && <div className="empty"><b>{t.noPublicJourneys}</b></div>}
        <div className="pj-grid">
          {js.map((journey) => {
            const stats = statsById[journey.id] || {};
            const pct = Math.min(100, stats.progress_pct || 0);
            return (
              <a className="pj-card" key={journey.id} href={`/${journey.slug}`}>
                <div className="pj-thumb" style={photoBy[journey.id]
                  ? { backgroundImage: `linear-gradient(180deg, rgba(9,12,42,.1), rgba(9,12,42,.5)), url(${photoBy[journey.id]})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: `linear-gradient(135deg, var(--night), ${journey.cover_color})` }}>
                  <span>{fill(t.dayShort, { d: stats.current_day || 0 })}</span>
                </div>
                <div className="pj-body">
                  <b>{journey.title}</b>
                  <div className="bar"><span style={{ width: (pct > 0 ? Math.max(pct, 6) : 0) + '%' }} /></div>
                  <small>{catLabel[journey.category] || ''} · {fill(t.dayOf, { d: stats.current_day || 0, t: journey.total_days, s: stats.streak || 0 })}</small>
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
