import { getSupabase } from '../../lib/supabase';
import { notFound } from 'next/navigation';

export const revalidate = 60; // revalida a cada 60s

const KIND_TAG = { setback: 'Setback · still counts', win: 'Small win' };

async function loadJourney(slug) {
  const sb = getSupabase();

  const { data: journey } = await sb
    .from('journeys')
    .select('*')
    .eq('slug', slug)
    .eq('is_public', true)
    .maybeSingle();

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
  if (!data) return { title: 'Journey not found — One Up Day' };
  const { journey, stats } = data;
  return {
    title: `${journey.title} — Day ${stats.current_day || 0} of ${journey.total_days} · One Up Day`,
    description: journey.goal || 'A journey on One Up Day.',
    openGraph: {
      title: `${journey.title} — Day ${stats.current_day || 0}/${journey.total_days}`,
      description: journey.goal || '',
    },
  };
}

export default async function JourneyPage({ params }) {
  const data = await loadJourney(params.slug);
  if (!data) notFound();

  const { journey, owner, updates, stats } = data;
  const pct = Math.min(100, stats.progress_pct || 0);
  const initial = (owner?.name || '?')[0];

  return (
    <>
      <header className="top">
        <a className="wordmark" href="/">One <b>Up</b> Day</a>
        <a className="cta" href="/">Start your journey</a>
      </header>

      <main className="wrap">
        <section className="cover" style={{ background: `linear-gradient(135deg, var(--night), ${journey.cover_color})` }}>
          <p className="eyebrow">Public journey</p>
          <h1>{journey.title}</h1>
          <p>{journey.goal}</p>
        </section>

        <div className="who">
          <div className="ava" style={{ background: owner?.avatar_color || 'var(--orange)' }}>{initial}</div>
          <div>
            <b>{owner?.name}</b>
            <span>{owner?.handle} · Day {stats.current_day || 0} of {journey.total_days}</span>
          </div>
        </div>

        <div className="stats">
          <article><b>{stats.days_posted || 0}</b><span>days posted</span></article>
          <article><b>{stats.streak || 0}</b><span>day streak</span></article>
          <article><b>{pct}%</b><span>progress</span></article>
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
                <span className="day">Day {u.day_number}</span>
                {KIND_TAG[u.kind] && <span className={`tag ${u.kind}`}>{KIND_TAG[u.kind]}</span>}
                <p>{u.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="encourage">
          <h3>Following {owner?.name}'s progress?</h3>
          <p>Encourage this journey and start your own.</p>
          <a className="cta" href="/">Encourage &amp; join</a>
        </section>
      </main>

      <footer className="foot">One <b>Up</b> Day · One day. One step up. · oneupday.app/{journey.slug}</footer>
    </>
  );
}
