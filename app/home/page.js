import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict, fill } from '../../lib/i18n';
import Logo from '../../components/Logo';
import Composer from './Composer';

export const dynamic = 'force-dynamic';

const COLORS = ['#ff7a45', '#6c5ce7', '#2563eb', '#16a34a', '#0ea5e9', '#f02f87'];

async function ensureProfile(supabase, user) {
  const { data: existing } = await supabase.from('profiles').select('id, name, handle').eq('id', user.id).maybeSingle();
  if (existing) return existing;
  const meta = user.user_metadata || {};
  const base = (user.email || 'user').split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g, '');
  let handle = '@' + base;
  const { data: taken } = await supabase.from('profiles').select('id').eq('handle', handle).maybeSingle();
  if (taken) handle = '@' + base + Math.floor(1000 + Math.random() * 9000);
  const profile = { id: user.id, name: meta.full_name || meta.name || base, handle, avatar_color: COLORS[Math.floor(Math.random() * COLORS.length)] };
  await supabase.from('profiles').insert(profile);
  return profile;
}

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const profile = await ensureProfile(supabase, user);
  const locale = getLocale();
  const t = getDict(locale);

  const { data: journeys } = await supabase.from('journeys').select('*').eq('owner_id', user.id).order('created_at', { ascending: false });
  const list = journeys || [];
  const statsById = {};
  if (list.length) {
    const { data: stats } = await supabase.from('journey_stats').select('*').in('journey_id', list.map(j => j.id));
    (stats || []).forEach(s => { statsById[s.journey_id] = s; });
  }

  const kindLabels = { step: t.kindStep, win: t.kindWin, setback: t.kindSetback, learned: t.kindLearned };

  return (
    <>
      <header className="top">
        <Logo />
        <div className="top-right">
          <span className="hi">{profile.name}</span>
          <form action="/auth/signout" method="post"><button className="ghost-btn" type="submit">{t.signOut}</button></form>
        </div>
      </header>

      <main className="wrap">
        <section className="home-head">
          <div>
            <p className="eyebrow">{t.yourJourneys}</p>
            <h1>{t.homeTitle}</h1>
          </div>
          <a className="cta" href="/new">{t.newJourney}</a>
        </section>

        {list.length === 0 && (
          <div className="empty">
            <b>{t.noJourneyTitle}</b>
            <p>{t.noJourneySub}</p>
            <a className="cta" href="/new">{t.createFirst}</a>
          </div>
        )}

        {list.map(j => {
          const s = statsById[j.id] || {};
          const day = s.current_day || 0;
          const pct = Math.min(100, s.progress_pct || 0);
          return (
            <section className="jcard" key={j.id}>
              <div className="jcard-head">
                <div>
                  <h2>{j.title}</h2>
                  <span>{fill(t.dayOf, { d: day, t: j.total_days, s: s.streak || 0 })}</span>
                </div>
                <a className="view-link" href={`/${j.slug}`} target="_blank" rel="noreferrer">{t.viewPublic}</a>
              </div>
              <div className="bar"><span style={{ width: pct + '%' }} /></div>
              <Composer journeyId={j.id} nextDay={day + 1} labels={kindLabels} t={{
                placeholder: t.composerPh, post: t.post, posting: t.posting, error: t.postError, setbackNote: t.setbackNote,
                addPhoto: t.addPhoto, uploading: t.uploading, photoAdded: t.photoAdded
              }} />
            </section>
          );
        })}
      </main>
    </>
  );
}
