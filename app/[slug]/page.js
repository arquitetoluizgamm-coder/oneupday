import { getSupabase } from '../../lib/supabase';
import { getLocale } from '../../lib/locale';
import { getDict, fill } from '../../lib/i18n';
import LangSwitcher from '../../components/LangSwitcher';
import { notFound } from 'next/navigation';

export const revalidate = 60;

async function loadJourney(slug) {
  const sb = getSupabase();
  const { data: journey } = await sb.from('journeys').select('*').eq('slug', slug).eq('is_public', true).maybeSingle();
  if (!journey) return null;
  const [{ data: owner }, { data: updates }, { data: stats }] = await Promise.all([
    sb.from('profiles').select('name, handle, avatar_color').eq('id', journey.owner_id).maybeSingle(),
    sb.from('updates').select('*').eq('journey_id', journey.id).order('day_number', { ascending: true }),
    sb.from('journey_stats').select('*').eq('journey_id', journey.id).maybeSingle(),
  ]);
  return { journey, owner, updates: updates || [], stats: stats || {} };
}

export async function generateMetadata({ params }) {
  const data = await loadJourney(params.slug);
  if (!data) return { title: 'One Up Day' };
  const { journey, stats } = data;
  return {
    title: `${journey.title} — Day ${stats.current_day || 0} of ${journey.total_days} · One Up Day`,
    description: journey.goal || '',
  };
}

export default async function JourneyPage({ params }) {
  const data = await loadJourney(params.slug);
  if (!data) notFound();
  const { journey, owner, updates, stats } = data;
  const locale = getLocale();
  const t = getDict(locale);
  const pct = Math.min(100, stats.progress_pct || 0);
  const initial = (owner?.name || '?')[0];
  const tagFor = k => k === 'setback' ? t.tagSetback : k === 'win' ? t.tagWin : null;

  return (
    <>
      <header className="top">
        <a className="wordmark" href="/">One <b>Up</b> Day</a>
        <div className="top-right">
          <LangSwitcher locale={locale} />
          <a className="cta" href="/login">{t.startYourJourney}</a>
        </div>
      </header>

      <main className="wrap">
        <section className="cover" style={{ background: `linear-gradient(135deg, var(--night), ${journey.cover_color})` }}>
          <p className="eyebrow">{t.publicJourney}</p>
          <h1>{journey.title}</h1>
          <p>{journey.goal}</p>
        </section>

        <div className="who">
          <div className="ava" style={{ background: owner?.avatar_color || 'var(--orange)' }}>{initial}</div>
          <div>
            <b>{owner?.name}</b>
            <span>{owner?.handle} · {fill(t.dayXofY, { d: stats.current_day || 0, t: journey.total_days })}</span>
          </div>
        </div>

        <div className="stats">
          <article><b>{stats.days_posted || 0}</b><span>{t.daysPosted}</span></article>
          <article><b>{stats.streak || 0}</b><span>{t.dayStreakLabel}</span></article>
          <article><b>{pct}%</b><span>{t.progress}</span></article>
        </div>
        <div className="bar"><span style={{ width: pct + '%' }} /></div>

        <section className="timeline">
          {updates.slice().reverse().map((u, i, arr) => (
            <article key={u.id}>
              <div className="rail">
                <div className={`dot ${u.kind === 'setback' ? 'setback' : u.kind === 'win' ? 'win' : ''}`} />
                {i < arr.length - 1 && <div className="line" />}
              </div>
              <div className="body">
                <span className="day">{fill(t.dayShort, { d: u.day_number })}</span>
                {tagFor(u.kind) && <span className={`tag ${u.kind}`}>{tagFor(u.kind)}</span>}
                <p>{u.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="encourage">
          <h3>{fill(t.followingQ, { name: owner?.name || '' })}</h3>
          <p>{t.encourageSub}</p>
          <a className="cta" href="/login">{t.encourageJoin}</a>
        </section>
      </main>

      <footer className="foot">One <b>Up</b> Day · {t.tagline} · oneupday.app/{journey.slug}</footer>
    </>
  );
}
