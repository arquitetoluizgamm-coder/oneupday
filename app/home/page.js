import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict, fill } from '../../lib/i18n';
import Logo from '../../components/Logo';
import Composer from './Composer';
import NewJourneyForm from '../new/NewJourneyForm';
import EditBanner from '../../components/EditBanner';
import BottomNav from '../../components/BottomNav';
import PrivacyToggle from './PrivacyToggle';
import MuteTopic from './MuteTopic';
import EditAvatar from '../../components/EditAvatar';
import CompanionCard from './CompanionCard';
import ProgressBar from '../../components/ProgressBar';

export const dynamic = 'force-dynamic';

const COLORS = ['#ff7a45', '#6c5ce7', '#2563eb', '#16a34a', '#0ea5e9', '#f02f87'];

async function ensureProfile(supabase, user) {
  const meta = user.user_metadata || {};
  const googleAvatar = meta.avatar_url || meta.picture || null;
  const { data: existing } = await supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color, banner_url, muted_cats, notif_paused').eq('id', user.id).maybeSingle();
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

  const { count: unread } = await supabase.from('notifications')
    .select('*', { count: 'exact', head: true }).eq('recipient_id', user.id).eq('read', false);
  const { data: journeys } = await supabase.from('journeys').select('*').eq('owner_id', user.id).order('created_at', { ascending: false });
  const list = journeys || [];
  const statsById = {};
  if (list.length) {
    const { data: stats } = await supabase.from('journey_stats').select('*').in('journey_id', list.map(j => j.id));
    (stats || []).forEach(s => { statsById[s.journey_id] = s; });
  }

  // ---- Feed "Em alta agora" (jornadas públicas recentes) ----
  // ---- Pontos (privados, não-competitivos): continuar + apoiar ----
  let updatesCount = 0, setbackCount = 0, maxStreak = 0;
  if (list.length) {
    const jIdsOwn = list.map(j => j.id);
    const [{ count: uc }, { count: sc }] = await Promise.all([
      supabase.from('updates').select('*', { count: 'exact', head: true }).in('journey_id', jIdsOwn),
      supabase.from('updates').select('*', { count: 'exact', head: true }).in('journey_id', jIdsOwn).eq('kind', 'setback'),
    ]);
    updatesCount = uc || 0; setbackCount = sc || 0;
    Object.values(statsById).forEach(s => { if ((s.streak || 0) > maxStreak) maxStreak = s.streak; });
  }
  const { count: encGiven } = await supabase.from('encouragements')
    .select('*', { count: 'exact', head: true }).eq('user_id', user.id);
  const points = updatesCount * 10 + setbackCount * 15 + (encGiven || 0) * 5 + maxStreak * 2;

  const { data: blk } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id);
  const blocked = new Set((blk || []).map(b => b.blocked_id));
  const mutedCats = new Set((profile.muted_cats || '').split(',').filter(Boolean));
  const { data: pub } = await supabase.from('journeys')
    .select('id, owner_id, category').eq('visibility', 'public').neq('owner_id', user.id)
    .order('created_at', { ascending: false }).limit(20);
  const targetIds = (pub || []).filter(j => !blocked.has(j.owner_id) && !mutedCats.has(j.category)).map(j => j.id).slice(0, 20);

  let feed = [];
  if (targetIds.length) {
    const { data: feedUpdates } = await supabase.from('updates')
      .select('id, day_number, kind, text, photo_url, video_url, created_at, journey_id')
      .in('journey_id', targetIds)
      .order('created_at', { ascending: false }).limit(20);
    const ups = feedUpdates || [];
    const jIds = [...new Set(ups.map(u => u.journey_id))];
    const { data: js } = await supabase.from('journeys').select('id, slug, title, cover_color, total_days, owner_id, category').in('id', jIds);
    const jMap = {}; (js || []).forEach(j => { jMap[j.id] = j; });
    const oIds = [...new Set((js || []).map(j => j.owner_id))];
    const { data: profs } = await supabase.from('profiles').select('id, name, avatar_color, avatar_url, handle').in('id', oIds);
    const pMap = {}; (profs || []).forEach(pr => { pMap[pr.id] = pr; });
    feed = ups.map(u => {
      const j = jMap[u.journey_id]; if (!j) return null;
      return { ...u, journey: j, owner: pMap[j.owner_id] || {} };
    }).filter(Boolean);
  }
  const kindTag = { setback: t.tagSetback, win: t.tagWin };

  const kindLabels = { step: t.kindStep, win: t.kindWin, setback: t.kindSetback, learned: t.kindLearned };
  const aiOn = !!process.env.OPENAI_API_KEY && list.length > 0;

  return (
    <>
      <header className="top">
        <Logo href="/home" />
        <div className="top-right">
          <a className="bell" href="/notifications" aria-label={t.notifications}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>
            {unread > 0 && !profile.notif_paused && <b>{unread > 9 ? '9+' : unread}</b>}
          </a>
          <a className="ghost-btn" href="/explore">{t.explore}</a>
          <form action="/auth/signout" method="post"><button className="ghost-btn" type="submit">{t.signOut}</button></form>
        </div>
      </header>

      <main className="wrap">
        {feed.length > 0 && (
          <section className="feed feed-lead">
            {feed.map(f => (
              <article className="feed-card" key={f.id}>
                <a className="feed-ava" href={`/${f.owner.handle || f.journey.slug}`} style={{ background: f.owner.avatar_color || 'var(--orange)' }}>
                  {f.owner.avatar_url ? <img src={f.owner.avatar_url} alt="" /> : (f.owner.name || '?')[0]}
                </a>
                <div className="feed-body">
                  <div className="feed-top">
                    <a href={`/${f.owner.handle || f.journey.slug}`}><b>{f.owner.name}</b></a>
                    <span>{fill(t.dayShort, { d: f.day_number })} · {f.journey.title}</span>
                  </div>
                  {kindTag[f.kind] && <span className={`post-tag ${f.kind}`}>{kindTag[f.kind]}</span>}
                  {f.text && f.text !== '\u{1F4F7}' && f.text !== '\u{1F3A5}' && <p>{f.text}</p>}
                  {f.photo_url && <a href={`/${f.journey.slug}`} className="feed-photo"><img src={f.photo_url} alt="" /></a>}
                  {f.video_url && <div className="feed-photo"><video src={f.video_url} controls playsInline preload="metadata" /></div>}
                  <div className="feed-actions">
                    <a className="feed-open" href={`/${f.journey.slug}`}>{t.viewPublic}</a>
                    <MuteTopic category={f.journey.category} current={profile.muted_cats} label={t.muteTopic} />
                  </div>
                </div>
              </article>
            ))}
            <a className="feed-more" href="/explore">{t.explore} →</a>
          </section>
        )}
        <section className="profile-card">
          <div className="pc-banner" style={profile.banner_url ? { backgroundImage: `url(${profile.banner_url})` } : undefined}>
            <EditBanner userId={user.id} label={t.editBanner} uploadingLabel={t.uploading} />
          </div>
          <div className="pc-info">
            <div className="pc-avatar" style={{ background: profile.avatar_color || 'var(--orange)' }}>
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : profile.name[0]}
              <EditAvatar userId={user.id} label={t.editPhoto} />
            </div>
            <div className="pc-meta">
              <h1>{profile.name}</h1>
              <div className="pc-sub">
                <span>{profile.handle}</span>
                <div className="points-chip" title={t.pointsExplain}><b>{points}</b> {t.pointsWord}</div>
              </div>
            </div>
          </div>
        </section>
        {aiOn && <CompanionCard title={t.companionTitle} btn={t.companionBtn} loading={t.companionLoading} />}
        <section className="home-head">
          <div>
            <p className="eyebrow">{t.yourJourneys}</p>
            <h1>{t.homeTitle}</h1>
            {maxStreak > 0 && <p className="consistency">{t.consistencyLine.replace('{n}', maxStreak)}</p>}
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
            <NewJourneyForm userId={user.id} t={t} />
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
                <div className="jcard-tools">
                  <PrivacyToggle journeyId={j.id} initial={j.visibility || (j.is_public ? 'public' : 'private')} labels={{ public: t.pubPublic, followers: t.pubFollowers, private: t.pubPrivate }} />
                  <a className="view-link" href={`/${j.slug}`}>{t.viewPublic}</a>
                </div>
              </div>
              <ProgressBar day={day} total={j.total_days} dayTpl={t.dayXofY} goalWord={t.goalWord} />
              <Composer journeyId={j.id} startDate={j.created_at} labels={kindLabels} t={{
                placeholder: t.composerPh, post: t.post, posting: t.posting, error: t.postError, setbackNote: t.setbackNote,
                addPhoto: t.addPhoto, uploading: t.uploading, photoAdded: t.photoAdded,
                addVideo: t.addVideo, videoAdded: t.videoAdded, videoTooBig: t.videoTooBig, error: t.postError,
                crisisTitle: t.crisisTitle, crisisText: t.crisisText,
                ritualQ: t.ritualQ, rDid: t.rDid, rTried: t.rTried, rPaused: t.rPaused,
                rDidText: t.rDidText, rTriedText: t.rTriedText, rPausedText: t.rPausedText
              }} />
            </section>
          );
        })}

      </main>
      <BottomNav active="home" t={t} />
    </>
  );
}
