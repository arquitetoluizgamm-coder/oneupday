import { getSupabase } from '../lib/supabase';
import { getLocale } from '../lib/locale';
import { getDict } from '../lib/i18n';
import Logo from '../components/Logo';

export const revalidate = 60;

export default async function Home() {
  const locale = getLocale();
  const t = getDict(locale);

  let journeys = [];
  try {
    const sb = getSupabase();
    const { data } = await sb.from('journeys').select('slug, title').eq('is_public', true).limit(6);
    journeys = data || [];
  } catch (e) {}

  return (
    <>
      <header className="top">
        <Logo href={false} />
        <div className="top-right">
          <a className="cta" href="/login">{t.start}</a>
        </div>
      </header>

      <main className="hero">
        <h1>{t.hero1}<br />{t.hero2}</h1>
        <p>{t.heroSub}</p>
        <a className="cta grow" href="/login">{t.heroCta}</a>

        {journeys.length > 0 && (
          <div className="demo">
            <b>{t.seeReal}</b>
            <div className="demo-links">
              {journeys.map(j => (<a key={j.slug} href={`/${j.slug}`}>{j.title}</a>))}
            </div>
          </div>
        )}
      </main>

      <footer className="foot">One <b>Up</b> Day · {t.tagline}</footer>
    </>
  );
}
