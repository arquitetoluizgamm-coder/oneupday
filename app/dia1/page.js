import { getSupabase } from '../../lib/supabase';
import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import { looksRisky } from '../../lib/risky';
import Logo from '../../components/Logo';

export const revalidate = 300;

const CAMPAIGNS = {
  pt: ['Comece antes do próximo mês', '7 dias aparecendo por você', 'Meu primeiro passo do ano', '30 dias sem desistir de mim', 'O recomeço começa hoje'],
  en: ['Start before next month', '7 days showing up for you', 'My first step of the year', '30 days of not giving up on me', 'The restart starts today'],
};

async function loadWall() {
  try {
    const sb = getSupabase();
    const { data: journeys } = await sb.from('journeys')
      .select('id, slug, title, cover_color, owner_id').eq('visibility', 'public')
      .order('created_at', { ascending: false }).limit(60);
    const js = journeys || [];
    if (!js.length) return [];
    const ids = js.map(j => j.id);
    const jMap = {}; js.forEach(j => { jMap[j.id] = j; });
    const { data: ups } = await sb.from('updates')
      .select('id, journey_id, text, photo_url, day_number').in('journey_id', ids).eq('day_number', 1);
    const upList = ups || [];
    let reported = new Set();
    if (upList.length) {
      const { data: reps } = await sb.from('reports').select('update_id').in('update_id', upList.map(u => u.id));
      reported = new Set((reps || []).map(r => r.update_id));
    }
    const owners = [...new Set(js.map(j => j.owner_id))];
    const { data: profs } = await sb.from('profiles').select('id, name, avatar_url, avatar_color').in('id', owners);
    const pMap = {}; (profs || []).forEach(p => { pMap[p.id] = p; });
    const cards = upList.map(u => {
      const j = jMap[u.journey_id]; if (!j) return null;
      if (reported.has(u.id)) return null;
      if (looksRisky(u.text)) return null;
      return { slug: j.slug, title: j.title, cover_color: j.cover_color, photo: u.photo_url, text: u.text, owner: pMap[j.owner_id] || {} };
    }).filter(Boolean);
    // fotos primeiro
    cards.sort((a, b) => (b.photo ? 1 : 0) - (a.photo ? 1 : 0));
    return cards.slice(0, 18);
  } catch { return []; }
}

export async function generateMetadata() {
  const t = getDict(getLocale());
  return { title: `${t.dia1PageTitle} · One Up Day`, description: t.dia1PageSub, openGraph: { title: t.dia1PageTitle, description: t.dia1PageSub } };
}

export default async function Dia1() {
  const loc = getLocale();
  const t = getDict(loc);
  const cards = await loadWall();
  const campaigns = CAMPAIGNS[loc] || CAMPAIGNS.pt;

  return (
    <>
      <header className="top"><Logo href="/" /><div className="top-right"><a className="cta" href="/login">{t.startYourJourney}</a></div></header>
      <main className="wrap">
        <section className="dia1-hero">
          <span className="dia1-badge">DIA 1</span>
          <h1>{t.dia1PageTitle}</h1>
          <p>{t.dia1PageSub}</p>
          <a className="cta grow" href="/login">{t.dia1PageCta}</a>
        </section>

        <section className="dia1-campaigns">
          <p className="eyebrow">{t.dia1CampaignsTitle}</p>
          <div className="campaign-pills">
            {campaigns.map((c, i) => <a key={i} href="/login" className="campaign-pill">{c}</a>)}
          </div>
        </section>

        {cards.length > 0 && (
          <section className="dia1-wall">
            <p className="eyebrow">{t.dia1Wall}</p>
            <div className="wall-grid">
              {cards.map((c, i) => (
                <a key={i} className="wall-card" href={`/${c.slug}`}>
                  <div className="wall-cover" style={c.photo
                    ? { backgroundImage: `linear-gradient(180deg, rgba(9,12,42,.1), rgba(9,12,42,.62)), url(${c.photo})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: `linear-gradient(135deg, var(--night), ${c.cover_color})` }}>
                    <span className="wall-day">Dia 1</span>
                    <b className="wall-title">{c.title}</b>
                  </div>
                  <div className="wall-who">
                    <span className="wall-ava" style={{ background: c.owner.avatar_color || 'var(--orange)' }}>
                      {c.owner.avatar_url ? <img src={c.owner.avatar_url} alt="" /> : (c.owner.name || '?')[0]}
                    </span>
                    <span>{c.owner.name}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="encourage"><h3>{t.dia1PageTitle}</h3><a className="cta grow" href="/login">{t.dia1PageCta}</a></section>
      </main>
      <footer className="foot">One <b>Up</b> Day · {t.tagline}</footer>
    </>
  );
}
