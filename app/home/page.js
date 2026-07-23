import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import Logo from '../../components/Logo';
import BottomNav from '../../components/BottomNav';
import FeedClient from './FeedClient';
import Composer from './Composer';
import NextStep from './NextStep';
import ProgressBar from '../../components/ProgressBar';
import Track from '../../components/Track';

export const dynamic = 'force-dynamic';
const COLORS = ['#ff7a45', '#6c5ce7', '#2563eb', '#16a34a', '#0ea5e9', '#f02f87'];

async function ensureProfile(supabase, user) {
  const meta = user.user_metadata || {};
  const googleAvatar = meta.avatar_url || meta.picture || null;
  const { data: existing } = await supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color, muted_cats, notif_paused').eq('id', user.id).maybeSingle();
  if (existing) {
    if (!existing.avatar_url && googleAvatar) { await supabase.from('profiles').update({ avatar_url: googleAvatar }).eq('id', user.id); existing.avatar_url = googleAvatar; }
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

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const profile = await ensureProfile(supabase, user);
  const t = getDict(getLocale());
  const { count: unread } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('recipient_id', user.id).eq('read', false);

  const { data: journeys } = await supabase.from('journeys').select('*').eq('owner_id', user.id).order('created_at', { ascending: false });
  const list = journeys || [];
  const primary = list[0] || null;
  let pstats = {};
  if (primary) { const { data: st } = await supabase.from('journey_stats').select('*').eq('journey_id', primary.id).maybeSingle(); pstats = st || {}; }

  let aiPrefOff = false;
  try { const { data: pref } = await supabase.from('profiles').select('ai_opt_out').eq('id', user.id).maybeSingle(); aiPrefOff = !!pref?.ai_opt_out; } catch { }
  const aiOn = !!process.env.OPENAI_API_KEY && !aiPrefOff && !!primary;

  const kindLabels = { step: t.kindStep, win: t.kindWin, setback: t.kindSetback, learned: t.kindLearned };
  const composerT = {
    placeholder: t.composerPh, post: t.post, posting: t.posting, error: t.postError, setbackNote: t.setbackNote,
    addPhoto: t.addPhoto, uploading: t.uploading, photoAdded: t.photoAdded, addVideo: t.addVideo, videoAdded: t.videoAdded, videoTooBig: t.videoTooBig,
    crisisTitle: t.crisisTitle, crisisText: t.crisisText, ritualQ: t.ritualQ, rDid: t.rDid, rTried: t.rTried, rPaused: t.rPaused,
    rDidText: t.rDidText, rTriedText: t.rTriedText, rPausedText: t.rPausedText, aiWrite: t.aiWrite,
    musicAdd: t.musicAdd, musicTitle: t.musicTitle, musicUse: t.musicUse, musicRemove: t.musicRemove, musicEmpty: t.musicEmpty, musicSearchPh: t.musicSearchPh, musicKeyNeeded: t.musicKeyNeeded,
    aiErr: t.aiErr, aiRateErr: t.aiRateErr,
  };

  const feedLabels = {
    dayShort: t.dayShort, tagSetback: t.tagSetback, tagWin: t.tagWin,
    viewPublic: t.viewPublic, muteTopic: t.muteTopic,
    inviteTitle: t.feedInviteTitle, inviteSub: t.feedInviteSub, inviteCta: t.feedInviteCta, loading: '',
    tabAll: t.tabAll, tabFollowing: t.tabFollowing, followingEmptyTitle: t.followingEmptyTitle, followingEmptySub: t.followingEmptySub,
    supportIdle: t.withYouIdle, supportActive: t.withYouActive, supporters: t.supporters, supportersLoading: t.supportersLoading, supportersEmpty: t.supportersEmpty,
    share: t.shareShort, linkCopied: t.linkCopied,
    comments: { comment: t.comment, close: t.commentClose, empty: t.commentEmpty, placeholder: t.commentPlaceholder, send: t.commentSend, sending: t.commentSending, unsafe: t.commentUnsafe, error: t.commentError, someone: t.commentSomeone, reply: t.commentReply, more: t.commentMore, less: t.commentLess, replying: t.commentReplying, cancel: t.commentCancel },
  };

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
          <a className="header-ava" href="/perfil" aria-label={profile.name} style={{ background: profile.avatar_color || 'var(--orange)' }}>
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : profile.name[0]}
          </a>
        </div>
      </header>

      <Track type="visit" meta={{ page: "home" }} />
      <main className="wrap feed-page">
        {!primary && (
          <section className="first-journey">
            <span className="fj-eyebrow">{t.fjEyebrow}</span>
            <h1>{t.fjTitle.replace('{name}', (profile.name || '').split(' ')[0])}</h1>
            <p>{t.fjSub}</p>
            <a className="cta grow" href="/new">{t.fjCta}</a>
            <p className="fj-hint">{t.fjHint}</p>
          </section>
        )}

        {primary && (
          <section className="today">
            <div className="today-head">
              <span className="eyebrow">{t.homeTitle}</span>
              <a className="tiny-link" href="/perfil">{t.manageJourneys}{list.length > 1 ? ` · ${list.length}` : ''}</a>
            </div>
            <div className="today-journey">
              <div className="tj-top"><b>{primary.title}</b><a href={`/${primary.slug}`} className="tiny-link">{t.viewPublic}</a></div>
              <ProgressBar day={pstats.current_day || 0} total={primary.total_days} dayTpl={t.dayXofY} goalWord={t.goalWord} />
            </div>
            <Composer journeyId={primary.id} startDate={primary.created_at} aiOn={aiOn} labels={kindLabels} t={composerT} />
            {aiOn && <NextStep journeyId={primary.id} label={t.aiNextStep} thinking={t.aiThinking} errLabel={t.aiErr} rateLabel={t.aiRateErr} />}
          </section>
        )}

        <section className="feed-lead"><span className="eyebrow">{t.feedQuestion}</span></section>
        <FeedClient mutedCats={profile.muted_cats || ''} labels={feedLabels} />
      </main>
      <BottomNav active="home" t={t} />
    </>
  );
}
