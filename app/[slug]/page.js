import { getSupabase } from '../../lib/supabase';
import { getLocale } from '../../lib/locale';
import { getDict, fill } from '../../lib/i18n';
import Logo from '../../components/Logo';
import ShareButton from './ShareButton';
import EncourageBar from './EncourageBar';
import FollowButton from './FollowButton';
import ProgressBar from '../../components/ProgressBar';
import ReportButton from './ReportButton';
import { notFound } from 'next/navigation';

export const revalidate = 60;

async function loadJourney(slug) {
  const sb = getSupabase();
  const { data: journey } = await sb.from('journeys').select('*').eq('slug', slug).eq('is_public', true).maybeSingle();
  if (!journey) return null;
  const [{ data: owner }, { data: updates }, { data: stats }] = await Promise.all([
    sb.from('profiles').select('name, handle, avatar_color, avatar_url, banner_url').eq('id', journey.owner_id).maybeSingle(),
    sb.from('updates').select('*').eq('journey_id', journey.id).order('day_number', { ascending: true }),
    sb.from('journey_stats').select('*').eq('journey_id', journey.id).maybeSingle(),
  ]);
  const ups = updates || [];
  const encById = {};
  if (ups.length) {
    const { data: encs } = await sb.from('encouragements').select('update_id').in('update_id', ups.map(u => u.id));
    (encs || []).forEach(e => { encById[e.update_id] = (encById[e.update_id] || 0) + 1; });
  }
  return { journey, owner, updates: ups, stats: stats || {}, encById };
}

async function loadProfile(handle) {
  const sb = getSupabase();
  const { data: profile } = await sb.from('profiles')
    .select('id, name, handle, avatar_url, avatar_color, banner_url').eq('handle', handle).maybeSingle();
  if (!profile) return null;
  const { data: journeys } = await sb.from('journeys')
    .select('*').eq('owner_id', profile.id).eq('is_public', true).order('created_at', { ascending: false });
  const js = journeys || [];
  const statsById = {};
  if (js.length) {
    const { data: stats } = await sb.from('journey_stats').select('*').in('journey_id', js.map(j => j.id));
    (stats || []).forEach(s => { statsById[s.journey_id] = s; });
  }
  return { profile, journeys: js, statsById };
}

async function ProfilePage({ handle }) {
  const data = await loadProfile(handle);
  if (!data) notFound();
  const { profile, journeys, statsById } = data;
  const t = getDict(getLocale());
  const initial = (profile.name || '?')[0];
  return (
    <>
      <header className="top">
        <Logo />
        <div className="top-right">
          <a className="cta" href="/login">{t.startYourJourney}</a>
        </div>
      </header>
      <main className="wrap">
        <section className="profile-card">
          <div className="pc-banner" style={profile.banner_url ? { backgroundImage: `url(${profile.banner_url})` } : undefined}></div>
          <div className="pc-info">
            <div className="pc-avatar" style={{ background: profile.avatar_color || 'var(--orange)' }}>
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : initial}
            </div>
            <div className="pc-meta">
              <h1>{profile.name}</h1>
              <span>{profile.handle}</span>
            </div>
          </div>
        </section>

        <section className="home-head"><div><p className="eyebrow">{t.profileJourneys}</p></div></section>
        {journeys.length === 0 && <div className="empty"><b>{t.noPublicJourneys}</b></div>}
        <div className="pj-grid">
          {journeys.map(j => {
            const st = statsById[j.id] || {};
            const pct = Math.min(100, st.progress_pct || 0);
            return (
              <a className="pj-card" key={j.id} href={`/${j.slug}`}>
                <div className="pj-thumb" style={{ background: `linear-gradient(135deg, var(--night), ${j.cover_color})` }}>
                  <span>{fill(t.dayShort, { d: st.current_day || 0 })}</span>
                </div>
                <div className="pj-body">
                  <b>{j.title}</b>
                  <ProgressBar day={stats.current_day || 0} total={journey.total_days} dayTpl={t.dayXofY} goalWord={t.goalWord} />
                  <small>{fill(t.dayOf, { d: st.current_day || 0, t: j.total_days, s: st.streak || 0 })}</small>
                </div>
              </a>
            );
          })}
        </div>
      </main>
      <footer className="foot">One <b>Up</b> Day · {t.tagline} · oneupday.app/{profile.handle}</footer>
    </>
  );
}

export async function generateMetadata({ params }) {
  const slug = decodeURIComponent(params.slug);
  if (slug.startsWith('@')) {
    const p = await loadProfile(slug);
    return { title: p ? `${p.profile.name} · One Up Day` : 'One Up Day' };
  }
  const data = await loadJourney(slug);
  if (!data) return { title: 'One Up Day' };
  const { journey, stats } = data;
  return {
    title: `${journey.title} — Day ${stats.current_day || 0} of ${journey.total_days} · One Up Day`,
    description: journey.goal || '',
    twitter: { card: 'summary_large_image' },
  };
}

export default async function JourneyPage({ params }) {
  const slug = decodeURIComponent(params.slug);
  if (slug.startsWith('@')) return <ProfilePage handle={slug} />;
  const data = await loadJourney(slug);
  if (!data) notFound();
  const { journey, owner, updates, stats, encById } = data;
  const locale = getLocale();
  const t = getDict(locale);
  const pct = Math.min(100, stats.progress_pct || 0);
  const initial = (owner?.name || '?')[0];
  const latest = updates.length ? updates[updates.length - 1] : null;
  const withPhoto = updates.filter(u => u.photo_url);
  const beforePhoto = withPhoto[0] || null;
  const nowPhoto = withPhoto.length > 1 ? withPhoto[withPhoto.length - 1] : null;
  const showBeforeNow = beforePhoto && nowPhoto && beforePhoto.id !== nowPhoto.id;
  const tagFor = k => k === 'setback' ? t.tagSetback : k === 'win' ? t.tagWin : null;

  return (
    <>
      <header className="top">
        <Logo />
        <div className="top-right">
          <a className="cta" href="/login">{t.startYourJourney}</a>
        </div>
      </header>

      <main className="wrap">
        <section className={`cover${owner?.banner_url ? ' has-banner' : ''}`} style={owner?.banner_url
          ? { backgroundImage: `linear-gradient(180deg, rgba(9,12,42,.25), rgba(9,12,42,.82)), url(${owner.banner_url})` }
          : { background: `linear-gradient(135deg, var(--night), ${journey.cover_color})` }}>
          <p className="eyebrow">{t.publicJourney}</p>
          <h1>{journey.title}</h1>
          <p>{journey.goal}</p>
        </section>

        <div className="who">
          <a className="ava" href={`/${owner?.handle || ''}`} style={{ background: owner?.avatar_color || 'var(--orange)' }}>{owner?.avatar_url ? <img src={owner.avatar_url} alt="" /> : initial}</a>
          <a className="who-name" href={`/${owner?.handle || ''}`}>
            <b>{owner?.name}</b>
            <span>{owner?.handle} · {fill(t.dayXofY, { d: stats.current_day || 0, t: journey.total_days })}</span>
          </a>
          <FollowButton journeyId={journey.id} labelFollow={t.follow} labelFollowing={t.following} />
        </div>

        <div className="stats">
          <article><b>{stats.days_posted || 0}</b><span>{t.daysPosted}</span></article>
          <article><b>{stats.streak || 0}</b><span>{t.dayStreakLabel}</span></article>
          <article><b>{pct}%</b><span>{t.progress}</span></article>
        </div>
        <ProgressBar day={stats.current_day || 0} total={journey.total_days} dayTpl={t.dayXofY} goalWord={t.goalWord} />

        {showBeforeNow && (
          <section className="before-now">
            <figure>
              <img src={beforePhoto.photo_url} alt="" />
              <figcaption><span>{t.before}</span><small>{fill(t.dayShort, { d: beforePhoto.day_number })}</small></figcaption>
            </figure>
            <figure>
              <img src={nowPhoto.photo_url} alt="" />
              <figcaption><span>{t.now}</span><small>{fill(t.dayShort, { d: nowPhoto.day_number })}</small></figcaption>
            </figure>
          </section>
        )}

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
                {u.photo_url && <div className="update-photo"><img src={u.photo_url} alt="" /></div>}
                {u.video_url && <div className="update-photo"><video src={u.video_url} controls playsInline preload="metadata" /></div>}
                {u.text && u.text !== '📷' && u.text !== '🎥' && <p>{u.text}</p>}
                <div className="update-foot">
                  <EncourageBar updateId={u.id} labelIdle={t.withYouIdle} labelActive={t.withYouActive} />
                  <ReportButton updateId={u.id} label={t.report} doneLabel={t.reported} />
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="share-card-section">
          <div className="share-copy">
            <p className="eyebrow">{t.publicJourney}</p>
            <h3>{t.shareTitle}</h3>
            <p>{t.shareSub}</p>
          </div>
          <ShareButton journey={journey} owner={owner} stats={stats} latest={latest}
            label={t.shareCard} downloading={t.shareDownloading}
            card={{ day: t.cardDay, of: t.cardOf, streak: t.cardStreak, setback: t.cardSetback }} />
        </section>

        <section className="encourage">
          <h3>{t.joinTitle}</h3>
          <p>{t.joinSub}</p>
          <a className="cta grow" href="/login">{t.encourageJoin}</a>
        </section>
      </main>

      <footer className="foot">One <b>Up</b> Day · {t.tagline} · oneupday.app/{journey.slug}</footer>
    </>
  );
}
