import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict, fill } from '../../lib/i18n';
import Composer from '../home/Composer';
import NewJourneyForm from '../new/NewJourneyForm';
import EditBanner from '../../components/EditBanner';
import BottomNav from '../../components/BottomNav';
import PrivacyToggle from '../home/PrivacyToggle';
import EditAvatar from '../../components/EditAvatar';
import CompanionCard from '../home/CompanionCard';
import NextStep from '../home/NextStep';
import ProgressBar from '../../components/ProgressBar';
import MediaGallery from '../../components/MediaGallery';
import Track from '../../components/Track';
import AppTop from '../../components/AppTop';
import NextChapter from '../../components/NextChapter';
import { computeNextChapter, ncLabels } from '../../lib/nextChapter';
import ProfileTabs from '../../components/ProfileTabs';
import EditProfileInfo from '../../components/EditProfileInfo';
import DeleteJourney from '../../components/DeleteJourney';
import EditJourney from '../../components/EditJourney';
import JourneyDays from '../../components/JourneyDays';
import JourneyFold from '../../components/JourneyFold';
import { pickUpi } from '../../lib/upi';

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
  try { await supabase.from('events').insert({ user_id: user.id, name: 'signup' }); } catch { }
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
  let aiPrefOff = false;
  try { const { data: pref } = await supabase.from('profiles').select('ai_opt_out').eq('id', user.id).maybeSingle(); aiPrefOff = !!pref?.ai_opt_out; } catch { }
  const aiConfigured = !!process.env.OPENAI_API_KEY && list.length > 0;
  const aiOn = aiConfigured && !aiPrefOff;
  let myMedia = [];
  try { const { data: md } = await supabase.from('media').select('id, url, kind, visibility').eq('user_id', user.id).order('created_at', { ascending: false }); myMedia = md || []; } catch {}

  // ---- Próximo Capítulo (casa fixa: sempre disponível aqui) ----
  const primary = list[0] || null;
  const nc = await computeNextChapter(supabase, user.id, primary, t);

  // ---- Upi: o pingo que acompanha ----
  let upi = null;
  try {
    let last = null;
    if (jIds.length) {
      const { data: lu } = await supabase.from('updates').select('kind, created_at').in('journey_id', jIds).order('created_at', { ascending: false }).limit(1).maybeSingle();
      last = lu;
    }
    const daysSince = last ? Math.floor((Date.now() - new Date(last.created_at).getTime()) / 86400000) : 0;
    const pDay = (statsById[primary?.id] || {}).current_day || 0;
    upi = pickUpi({ locale: getLocale(), userId: user.id, hasJourney: list.length > 0, day: pDay, streak: maxStreak, lastKind: last?.kind || '', daysSince, updatesCount });
  } catch {}

  // ---- Quem te apoia: abraços recebidos + apoios nos seus posts ----
  let supporters = [];
  try {
    let uids = [];
    if (jIds.length) { const { data: ups } = await supabase.from('updates').select('id').in('journey_id', jIds); uids = (ups || []).map(u => u.id); }
    const mids = myMedia.map(m => m.id);
    const agg = {};
    const bump = (id, ts) => { if (!id || id === user.id) return; const cur = agg[id] || { count: 0, last: 0 }; cur.count++; const tt = ts ? new Date(ts).getTime() : 0; if (tt > cur.last) cur.last = tt; agg[id] = cur; };
    const guard = (pr) => Promise.resolve(pr).then((r) => r).catch(() => ({ data: [] }));
    const queries = [];
    if (uids.length) queries.push(guard(supabase.from('encouragements').select('user_id, created_at').in('update_id', uids).neq('user_id', user.id)));
    if (mids.length) queries.push(guard(supabase.from('encouragements').select('user_id, created_at').in('media_id', mids).neq('user_id', user.id)));
    queries.push(guard(supabase.from('hugs').select('from_id, created_at').eq('to_id', user.id).neq('from_id', user.id)));
    const res = await Promise.all(queries);
    res.forEach((r) => (r.data || []).forEach((row) => bump(row.user_id || row.from_id, row.created_at)));
    const ids = Object.keys(agg);
    if (ids.length) {
      const { data: profs } = await supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color').in('id', ids);
      supporters = (profs || []).map((p) => ({ ...p, count: agg[p.id].count, last: agg[p.id].last })).sort((a, b) => b.last - a.last).slice(0, 40);
    }
  } catch {}

  return (
    <>
      <AppTop backLabel={t.back} />

      <Track type="visit" meta={{ page: "perfil" }} />
      <main className="wrap">
        <section className="profile-card">
          <div className="pc-banner" style={profile.banner_url ? { backgroundImage: `url(${profile.banner_url})` } : undefined}>
            <EditBanner userId={user.id} label={t.editBanner} uploadingLabel={t.uploading} cropLabels={{ cover: t.cropCover, use: t.cropUse, cancel: t.cropCancel, hint: t.cropHint, zoom: t.cropZoom }} />
            <div className="pc-tools">
              <EditProfileInfo userId={user.id} initialName={profile.name} initialHandle={profile.handle} labels={{ btn: t.epBtn, title: t.epTitle, name: t.epName, handle: t.epHandle, hint: t.epHint, save: t.epSave, saving: t.epSaving, cancel: t.epCancel, errName: t.epErrName, errHandle: t.epErrHandle, errTaken: t.epErrTaken, errSave: t.epErrSave }} />
              <a className="ghost-btn" href={`/${profile.handle}`}>{t.viewPublic}</a>
              <form action="/auth/signout" method="post"><button className="ghost-btn" type="submit">{t.signOut}</button></form>
            </div>
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
              {maxStreak > 0 && <p className="consistency pc-consistency">{t.consistencyLine.replace('{n}', maxStreak)}</p>}
            </div>
          </div>
        </section>

        {upi?.line && (
          <div className="upi" role="status">
            <span className={`upi-dot${upi.cat === 'comeback' ? ' gold' : ''}`} aria-hidden="true" />
            <div className="upi-bubble">
              <b className="upi-name">Upi</b>
              <p>{upi.line}</p>
            </div>
          </div>
        )}

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

        {list.length > 0 && (
          <ProfileTabs
            labels={{ journeys: t.profTabJourneys, album: t.profTabAlbum, people: t.profTabPeople }}
            actions={(<>
              <a className="ghost-btn" href="/midia"><span className="al-full">{t.mediaAdd}</span><span className="al-short">{t.mediaAddShort}</span></a>
              <a className="cta" href="/new"><span className="al-full">{t.newJourney}</span><span className="al-short">{t.newJourneyShort}</span></a>
            </>)}
            journeys={(
              <>
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
                          <EditJourney journey={j} labels={{ btn: t.ejBtn, title: t.ejTitle, name: t.ejName, goal: t.ejGoal, cover: t.ejCover, coverAdd: t.ejCoverAdd, coverChange: t.ejCoverChange, coverRemove: t.ejCoverRemove, save: t.epSave, saving: t.epSaving, cancel: t.epCancel, errTitle: t.ejErrTitle, errSave: t.epErrSave, cropUse: t.cropUse, cropCancel: t.cropCancel, cropHint: t.cropHint, cropZoom: t.cropZoom }} />
                          <DeleteJourney journeyId={j.id} title={j.title} labels={{ btn: t.jDeleteBtn, confirm: t.jDeleteConfirm, error: t.jDeleteErr }} />
                        </div>
                      </div>
                      <ProgressBar day={day} total={j.total_days} dayTpl={t.dayXofY} goalWord={t.goalWord} />
                      <JourneyFold openLabel={t.jfOpen} closeLabel={t.jfClose}>
                      <JourneyDays journeyId={j.id}
                        labels={{ show: t.jdShow, hide: t.jdHide, empty: t.jdEmpty, loading: t.jdLoading, dayFmt: t.dayShort }}
                        editLabels={{ btn: t.euBtn, title: t.euTitle, text: t.euText, photo: t.euPhoto, photoAdd: t.ejCoverAdd, photoChange: t.ejCoverChange, photoRemove: t.ejCoverRemove, save: t.epSave, saving: t.epSaving, cancel: t.epCancel, errSave: t.epErrSave, errEmpty: t.euErrEmpty, deletePost: t.euDeletePost, deleteConfirm: t.postDeleteConfirm, cropOriginal: t.cropOriginal, cropSquare: t.cropSquare, cropPortrait: t.cropPortrait, cropLandscape: t.cropLandscape, cropUse: t.cropUse, cropCancel: t.cropCancel, cropHint: t.cropHint, cropHintOriginal: t.cropHintOriginal, cropZoom: t.cropZoom }} />
                      <Composer journeyId={j.id} startDate={j.created_at} aiOn={aiOn} labels={kindLabels} t={{
                        placeholder: t.composerPh, post: t.post, posting: t.posting, error: t.postError, setbackNote: t.setbackNote,
                        addPhoto: t.addPhoto, uploading: t.uploading, photoAdded: t.photoAdded,
                        addVideo: t.addVideo, videoAdded: t.videoAdded, videoTooBig: t.videoTooBig,
                        crisisTitle: t.crisisTitle, crisisText: t.crisisText,
                        ritualQ: t.ritualQ, rDid: t.rDid, rTried: t.rTried, rPaused: t.rPaused,
                        rDidText: t.rDidText, rTriedText: t.rTriedText, rPausedText: t.rPausedText, aiWrite: t.aiWrite,
                        musicAdd: t.musicAdd, musicTitle: t.musicTitle, musicUse: t.musicUse, musicRemove: t.musicRemove, musicEmpty: t.musicEmpty, musicSearchPh: t.musicSearchPh, musicKeyNeeded: t.musicKeyNeeded,
                        aiErr: t.aiErr, aiRateErr: t.aiRateErr,
                        moodQ: t.moodQ, prompts: t.prompts, moods: { down: t.moodDown, anxious: t.moodAnxious, angry: t.moodAngry, tired: t.moodTired, motivated: t.moodMotivated, happy: t.moodHappy, grateful: t.moodGrateful },
                        env: { q: t.envQ, ph: t.envPh, save: t.envSave, skip: t.envSkip },
                meaning: { step: t.meaningStep, setback: t.meaningSetback, first: t.meaningFirst },
                      }} />
                      {aiOn && <NextStep journeyId={j.id} label={t.aiNextStep} thinking={t.aiThinking} errLabel={t.aiErr} rateLabel={t.aiRateErr} />}
                      </JourneyFold>
                    </section>
                  );
                })}
                {aiConfigured && <CompanionCard userId={user.id} title={t.companionTitle} btn={t.companionBtn} loading={t.companionLoading} initialOff={aiPrefOff} labels={{ consent: t.aiConsent, off: t.aiOff, offState: t.aiOffState, reactivate: t.aiReactivate, err: t.aiErr, rateErr: t.aiRateErr }} />}
              </>
            )}
            album={myMedia.length > 0 ? (
              <MediaGallery items={myMedia} showVis visLabels={{ public: t.pubPublic, followers: t.pubFollowers, private: t.pubPrivate }} own deleteLabel={t.mediaDelete} deleteConfirm={t.mediaDeleteConfirm} />
            ) : (
              <div className="tab-empty">
                <p>{t.albumEmpty}</p>
                <a className="cta" href="/midia">{t.albumEmptyCta}</a>
              </div>
            )}
            people={(
              <>
                {supporters.length > 0 && (
                  <section className="followers-block supporters-block">
                    <div className="fb-head">
                      <p className="eyebrow">{t.supportersMineTitle}</p>
                      <b className="fb-count">{supporters.length}</b>
                    </div>
                    <p className="fb-who">{t.supportersMineWho}</p>
                    <div className="followers-list">
                      {supporters.map((s) => (
                        <a className="follower-chip" key={s.id} href={`/${s.handle}`}>
                          <span className="fc-ava" style={{ background: s.avatar_color || 'var(--orange)' }}>
                            {s.avatar_url ? <img src={s.avatar_url} alt="" /> : (s.name || '?')[0]}
                          </span>
                          <span className="fc-name">{s.name}</span>
                          {s.count > 1 && <span className="fc-count">{s.count}×</span>}
                        </a>
                      ))}
                    </div>
                  </section>
                )}
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
              </>
            )}
          />
        )}

        {nc.mode && (
          <div className="nc-neutral">
            <NextChapter mode={nc.mode} line={nc.line} env={nc.env} labels={ncLabels(t, nc)} />
          </div>
        )}
      </main>
      <BottomNav active="profile" t={t} />
    </>
  );
}
