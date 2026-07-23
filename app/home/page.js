import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict, fill } from '../../lib/i18n';
import Logo from '../../components/Logo';
import Composer from './Composer';
import NewJourneyForm from '../new/NewJourneyForm';

export const dynamic = 'force-dynamic';

const COLORS = ['#ff7a45', '#6c5ce7', '#2563eb', '#16a34a', '#0ea5e9', '#f02f87'];

async function ensureProfile(supabase, user) {
  const meta = user.user_metadata || {};
  const googleAvatar = meta.avatar_url || meta.picture || null;
  const { data: existing } = await supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color').eq('id', user.id).maybeSingle();
  if (existing) {
    if (!existing.avatar_url && googleAvatar) {
      await supabase.from('profiles').update({ avatar_url: googleAvatar }).eq('id', user.id);
      existing.avatar_url = googleAvatar;
    }
    return existing;
  }
  const base = (user.email || 'user').split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g, '');
  let handle = '@' + base;
  const { data: taken } = await supabase.from('profiles').select('id').eq('handle', handle).maybeSingle();
  if (taken) handle = '@' + base + Math.floor(1000 + Math.random() * 9000);
  const profile = { id: user.id, name: meta.full_name || meta.name || base, handle, avatar_color: COLORS[Math.floor(Math.random() * COLORS.length)], avatar_url: googleAvatar };
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

  // ---- Feed (seguidas; se não segue ninguém, descoberta) ----
  const { data: follows } = await supabase.from('follows').select('journey_id').eq('user_id', user.id);
  const followedIds = (follows || []).map(f => f.journey_id);
  let targetIds = followedIds;
  const discovery = followedIds.length === 0;
  if (discovery) {
    const { data: pub } = await supabase.from('journeys')
      .select('id').eq('is_public', true).neq('owner_id', user.id)
      .order('created_at', { ascending: false }).limit(20);
    targetIds = (pub || []).map(j => j.id);
  }

  let feed = [];
  if (targetIds.length) {
    const { data: feedUpdates } = await supabase.from('updates')
      .select('id, day_number, kind, text, photo_url, video_url, created_at, journey_id')
      .in('journey_id', targetIds)
      .order('created_at', { ascending: false }).limit(20);
    const ups = feedUpdates || [];
    const jIds = [...new Set(ups.map(u => u.journey_id))];
    const [{ data: js }, { data: encs }] = await Promise.all([
      supabase.from('journeys').select('id, slug, title, cover_color, total_days, owner_id').in('id', jIds),
      supabase.from('encouragements').select('update_id').in('update_id', ups.map(u => u.id)),
    ]);
    const jMap = {}; (js || []).forEach(j => { jMap[j.id] = j; });
    const oIds = [...new Set((js || []).map(j => j.owner_id))];
    const { data: profs } = await supabase.from('profiles').select('id, name, avatar_color, avatar_url').in('id', oIds);
    const pMap = {}; (profs || []).forEach(pr => { pMap[pr.id] = pr; });
    const encCount = {}; (encs || []).forEach(e => { encCount[e.update_id] = (encCount[e.update_id] || 0) + 1; });
    feed = ups.map(u => {
      const j = jMap[u.journey_id]; if (!j) return null;
      return { ...u, journey: j, owner: pMap[j.owner_id] || {}, enc: encCount[u.id] || 0 };
    }).filter(Boolean);
  }
  const kindTag = { setback: t.tagSetback, win: t.tagWin };

  const kindLabels = { step: t.kindStep, win: t.kindWin, setback: t.kindSetback, learned: t.kindLearned };

  return (
    <>
      <header className="top">
        <Logo />
        <div className="top-right">
          <span className="me-ava" style={{ background: profile.avatar_color || 'var(--orange)' }}>{profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : profile.name[0]}</span>
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
          <section className="onboarding-block">
            <div className="ob-head">
              <h2>{t.obTitle.replace('{name}', profile.name.split(' ')[0])}</h2>
              <p>{t.obSub}</p>
            </div>
            <ol className="ob-steps">
              <li><span>1</span>{t.obStep1}</li>
              <li><span>2</span>{t.obStep2}</li>
              <li><span>3</span>{t.obStep3}</li>
            </ol>
            <NewJourneyForm userId={user.id} t={{
              fName: t.fName, fNamePh: t.fNamePh, fCategory: t.fCategory, fDuration: t.fDuration,
              fWhy: t.fWhy, fWhyPh: t.fWhyPh, fFirst: t.fFirst, fFirstPh: t.fFirstPh,
              createBtn: t.createBtn, creating: t.creating, error: t.createError,
              catArt: t.catArt, catLife: t.catLife, catBody: t.catBody, catHome: t.catHome, catWork: t.catWork,
              dur7: t.dur7, dur30: t.dur30, dur60: t.dur60, dur100: t.dur100,
            }} />
          </section>
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
                addPhoto: t.addPhoto, uploading: t.uploading, photoAdded: t.photoAdded,
                addVideo: t.addVideo, videoAdded: t.videoAdded, videoTooBig: t.videoTooBig, error: t.postError
              }} />
            </section>
          );
        })}

        {feed.length > 0 && (
          <section className="feed">
            <div className="feed-head">
              <h2>{t.feedTitle}</h2>
              {discovery && <span className="feed-badge">{t.discover}</span>}
            </div>
            {feed.map(f => (
              <article className="feed-card" key={f.id}>
                <a className="feed-ava" href={`/${f.journey.slug}`} style={{ background: f.owner.avatar_color || 'var(--orange)' }}>
                  {f.owner.avatar_url ? <img src={f.owner.avatar_url} alt="" /> : (f.owner.name || '?')[0]}
                </a>
                <div className="feed-body">
                  <div className="feed-top">
                    <a href={`/${f.journey.slug}`}><b>{f.owner.name}</b></a>
                    <span>{fill(t.dayShort, { d: f.day_number })} · {f.journey.title}</span>
                  </div>
                  {kindTag[f.kind] && <span className={`post-tag ${f.kind}`}>{kindTag[f.kind]}</span>}
                  {f.text && f.text !== '\u{1F4F7}' && f.text !== '\u{1F3A5}' && <p>{f.text}</p>}
                  {f.photo_url && <a href={`/${f.journey.slug}`} className="feed-photo"><img src={f.photo_url} alt="" /></a>}
                  {f.video_url && <div className="feed-photo"><video src={f.video_url} controls playsInline preload="metadata" /></div>}
                  <div className="feed-actions">
                    <span className="feed-enc">♡ {f.enc}</span>
                    <a className="feed-open" href={`/${f.journey.slug}`}>{t.viewPublic}</a>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
}
