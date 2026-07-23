import { getSupabase } from '../../lib/supabase';
import { getLocale } from '../../lib/locale';
import { getDict, fill } from '../../lib/i18n';
import Logo from '../../components/Logo';
import BottomNav from '../../components/BottomNav';

export const dynamic = 'force-dynamic';

const CATS = ['art', 'body', 'work', 'home', 'life'];

export default async function Explore({ searchParams }) {
  const t = getDict(getLocale());
  const q = (searchParams?.q || '').trim();
  const cat = searchParams?.cat || '';
  const catLabel = { art: t.catArt, body: t.catBody, work: t.catWork, home: t.catHome, life: t.catLife };

  const sb = getSupabase();
  let query = sb.from('journeys').select('*').eq('is_public', true).order('created_at', { ascending: false }).limit(40);
  if (cat) query = query.eq('category', cat);
  if (q) query = query.ilike('title', `%${q}%`);
  const { data: journeys } = await query;
  const js = journeys || [];
  const statsById = {};
  if (js.length) {
    const { data: stats } = await sb.from('journey_stats').select('*').in('journey_id', js.map(j => j.id));
    (stats || []).forEach(s => { statsById[s.journey_id] = s; });
  }

  return (
    <>
      <header className="top">
        <Logo />
        <div className="top-right">
          <a className="ghost-btn" href="/home">One Up Day</a>
        </div>
      </header>
      <main className="wrap">
        <div className="create-head">
          <p className="eyebrow">{t.explore}</p>
          <h1>{t.exploreTitle}</h1>
          <p className="sub">{t.exploreSub}</p>
        </div>

        <form className="search-box" action="/explore" method="get">
          <input name="q" defaultValue={q} placeholder={t.searchPh} />
        </form>

        <div className="cat-chips">
          <a className={`chip${!cat ? ' on' : ''}`} href="/explore">{t.allCats}</a>
          {CATS.map(c => (
            <a key={c} className={`chip${cat === c ? ' on' : ''}`} href={`/explore?cat=${c}`}>{catLabel[c]}</a>
          ))}
        </div>

        {js.length === 0 && <div className="empty"><b>{t.noPublicJourneys}</b></div>}
        <div className="pj-grid">
          {js.map(j => {
            const st = statsById[j.id] || {};
            const pct = Math.min(100, st.progress_pct || 0);
            return (
              <a className="pj-card" key={j.id} href={`/${j.slug}`}>
                <div className="pj-thumb" style={{ background: `linear-gradient(135deg, var(--night), ${j.cover_color})` }}>
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
