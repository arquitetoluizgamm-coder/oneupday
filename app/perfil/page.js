import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict, fill } from '../../lib/i18n';
import Logo from '../../components/Logo';
import Composer from '../home/Composer';
import NewJourneyForm from '../new/NewJourneyForm';
import EditBanner from '../../components/EditBanner';
import BottomNav from '../../components/BottomNav';
import PrivacyToggle from '../home/PrivacyToggle';
import EditAvatar from '../../components/EditAvatar';
import CompanionCard from '../home/CompanionCard';
import NextStep from '../home/NextStep';
import ProgressBar from '../../components/ProgressBar';

export const dynamic = 'force-dynamic';
const COLORS = ['#ff7a45', '#6c5ce7', '#2563eb', '#16a34a', '#0ea5e9', '#f02f87'];

async function ensureProfile(supabase, user) {
  const meta = user.user_metadata || {};
  const googleAvatar = meta.avatar_url || meta.picture || null;
  const { data: existing } = await supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color, banner_url, notif_paused').eq('id', user.id).maybeSingle();
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

export default async function Perfil() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const profile = await ensureProfile(supabase, user);
  const t = getDict(getLocale());

  const { data: journeys } = await supabase.from('journeys').select('*').eq('owner_id', user.id).order('created_at', { ascending: false });
  const list = journeys || [];
  const statsById = {};
  let maxStreak = 0, updatesCount = 0, setbackCount = 0, followers = [];
  const jIds = list.map(j => j.id);
  if (jIds.length) {
    const { data: stats } = await supabase.from('journey_stats').select('*').in('journey_id', jIds);
    (stats || []).forEach(s => { statsById[s.journey_id] = s; if ((s.streak || 0) > maxStreak) maxStreak = s.streak; });
    const [{ count: uc }, { count: sc }] = await Promise.all([
      supabase.from('updates').select('*', { count: 'exact', head: true }).in('journey_id', jIds),
      supabase.from('updates').select('*', { count: 'exact', head: true }).in('journey_id', jIds).eq('kind', 'setback'),
    ]);
    updatesCount = uc || 0; setbackCount = sc || 0;
  }
  {
    let followerIds = [];
    if (jIds.length) {
      const { data: fl } = await supabase.from('follows').select('user_id').in('journey_id', jIds);
      followerIds = (fl || []).map(f => f.user_id);
    }
    const { data: pf } = await supabase.from('profile_follows').select('follower_id').eq('following_id', user.id);
    followerIds = followerIds.concat((pf || []).map(f => f.follower_id));
    const ids = [...new Set(followerIds.filter(id => id !== user.id))];
    if (ids.length) {
      const { data: profs } = await supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color').in('id', ids);
      followers = profs || [];
    }
  }
  const { count: encGiven } = await supabase.from('encouragements').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
  const points = updatesCount * 10 + setbackCount * 15 + (encGiven || 0) * 5 + maxStreak * 2;

  const kindLabels = { step: t.kindStep, win: t.kindWin, setback: t.kindSetback, learned: t.kindLearned };
  const aiOn = !!process.env.OPENAI_API_KEY && list.length > 0;

  return (
    <>
      <header className="top">
        <Logo href="/home" />
        <div className="top-right">
          <a className="ghost-btn" href={`/${profile.handle}`}>{t.viewPublic}</a>
          <form action="/auth/signout" method="post"><button className="ghost-btn" type="submit">{t.signOut}</button></form>
        </div>
      </header>

      <main className="wrap">
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

        <section className="followers-block">
          <div className="fb-head">
            <p className="eyebrow">{t.followersTitle}</p>
            <b className="fb-count">{followers.length}</b>
          </div>
          {followers.length === 0
            ? <p className="fb-empty">{t.followersNone}</p>
            : (<>
              <p className="fb-who">{t.followersWho}</p>
              <div className="followers-list">
                {followers.map(f => (
                  <a className="follower-chip" key={f.id} href={`/${f.handle}`}>
                    <span className="fc-ava" style={{ background: f.avatar_color || 'var(--orange)' }}>
                      {f.avatar_url ? <img src={f.avatar_url} alt="" /> : (f.name || '?')[0]}
                    </span>
                    <span className="fc-name">{f.name}</span>
                  </a>
                ))}
              </div>
            </>)}
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
            <ol className="ob-steps"><li><span>1</span>{t.obStep1}</li><li><span>2</span>{t.obStep2}</li><li><span>3</span>{t.obStep3}</li></ol>
            <NewJourneyForm userId={user.id} t={t} />
          </section>
        )}

        {list.map(j => {
          const s = statsById[j.id] || {};
          const day = s.current_day || 0;
          return (
            <section className="jcard" key={j.id}>
              <div className="jcard-head">
                <div><h2>{j.title}</h2><span>{fill(t.dayOf, { d: day, t: j.total_days, s: s.streak || 0 })}</span></div>
                <div className="jcard-tools">
                  <PrivacyToggle journeyId={j.id} initial={j.visibility || (j.is_public ? 'public' : 'private')} labels={{ public: t.pubPublic, followers: t.pubFollowers, private: t.pubPrivate }} />
                  <a className="view-link" href={`/retro/${j.slug}`}>{t.retroLink}</a>
                  <a className="view-link" href={`/${j.slug}`}>{t.viewPublic}</a>
                </div>
              </div>
              <ProgressBar day={day} total={j.total_days} dayTpl={t.dayXofY} goalWord={t.goalWord} />
              <Composer journeyId={j.id} startDate={j.created_at} aiOn={aiOn} labels={kindLabels} t={{
                placeholder: t.composerPh, post: t.post, posting: t.posting, error: t.postError, setbackNote: t.setbackNote,
                addPhoto: t.addPhoto, uploading: t.uploading, photoAdded: t.photoAdded,
                addVideo: t.addVideo, videoAdded: t.videoAdded, videoTooBig: t.videoTooBig,
                crisisTitle: t.crisisTitle, crisisText: t.crisisText,
                ritualQ: t.ritualQ, rDid: t.rDid, rTried: t.rTried, rPaused: t.rPaused,
                rDidText: t.rDidText, rTriedText: t.rTriedText, rPausedText: t.rPausedText, aiWrite: t.aiWrite,
              }} />
              {aiOn && <NextStep journeyId={j.id} label={t.aiNextStep} thinking={t.aiThinking} />}
            </section>
          );
        })}
      </main>
      <BottomNav active="profile" t={t} />
    </>
  );
}
