import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import AppTop from '../../components/AppTop';
import BottomNav from '../../components/BottomNav';
import FeedClient from './FeedClient';
import Composer from './Composer';
import NextStep from './NextStep';
import ProgressBar from '../../components/ProgressBar';
import Track from '../../components/Track';
import Origem from '../../components/Origem';
import ScrollChrome from '../../components/ScrollChrome';
import DailyMood from '../../components/DailyMood';
import NextChapter from '../../components/NextChapter';
import { computeNextChapter, ncLabels } from '../../lib/nextChapter';
import { MOODS, moodGlow } from '../../lib/moods';

export const dynamic = 'force-dynamic';
const COLORS = ['#C16F54', '#84917A', '#5B7189', '#96523C', '#B3874A', '#A8637A'];

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

  let heartLikes = 0; const heartFollowers = new Set();
  if (list.length) {
    const jIds = list.map((j) => j.id);
    const { data: myUps } = await supabase.from('updates').select('id').in('journey_id', jIds);
    const uIds = (myUps || []).map((u) => u.id);
    if (uIds.length) {
      const { count: lc } = await supabase.from('encouragements').select('*', { count: 'exact', head: true }).in('update_id', uIds).neq('user_id', user.id);
      heartLikes = lc || 0;
    }
    const { data: jf } = await supabase.from('follows').select('user_id').in('journey_id', jIds);
    (jf || []).forEach((f) => heartFollowers.add(f.user_id));
  }
  try { const { data: pf } = await supabase.from('profile_follows').select('follower_id').eq('following_id', user.id); (pf || []).forEach((f) => heartFollowers.add(f.follower_id)); } catch {}
  heartFollowers.delete(user.id);
  const heartFollows = heartFollowers.size;

  let myMood = ''; let moodToday = false;
  try { const { data: mp } = await supabase.from('profiles').select('mood, mood_at').eq('id', user.id).maybeSingle(); if (mp?.mood_at && (Date.now() - new Date(mp.mood_at).getTime() < 30 * 3600 * 1000)) { myMood = mp.mood || ''; moodToday = !!myMood; } } catch {}

  let aiPrefOff = false;
  try { const { data: pref } = await supabase.from('profiles').select('ai_opt_out').eq('id', user.id).maybeSingle(); aiPrefOff = !!pref?.ai_opt_out; } catch { }
  const aiOn = !!process.env.OPENAI_API_KEY && !aiPrefOff && !!primary;

  // ---- Próximo Capítulo: antecipação pelo amanhã, nunca ansiedade ----
  const nc = await computeNextChapter(supabase, user.id, primary, t);

  const kindLabels = { step: t.kindStep, win: t.kindWin, setback: t.kindSetback, learned: t.kindLearned };
  const composerT = {
    placeholder: t.composerPh, post: t.post, posting: t.posting, error: t.postError, setbackNote: t.setbackNote,
    addPhoto: t.addPhoto, uploading: t.uploading, photoAdded: t.photoAdded, addVideo: t.addVideo, videoAdded: t.videoAdded, videoTooBig: t.videoTooBig,
    crisisTitle: t.crisisTitle, crisisText: t.crisisText, ritualQ: t.ritualQ, rDid: t.rDid, rTried: t.rTried, rPaused: t.rPaused,
    rDidText: t.rDidText, rTriedText: t.rTriedText, rPausedText: t.rPausedText, aiWrite: t.aiWrite,
    musicAdd: t.musicAdd, musicTitle: t.musicTitle, musicUse: t.musicUse, musicRemove: t.musicRemove, musicEmpty: t.musicEmpty, musicSearchPh: t.musicSearchPh, musicKeyNeeded: t.musicKeyNeeded,
    aiErr: t.aiErr, aiRateErr: t.aiRateErr,
    moodQ: t.moodQ, prompts: t.prompts, moods: { down: t.moodDown, anxious: t.moodAnxious, angry: t.moodAngry, tired: t.moodTired, motivated: t.moodMotivated, happy: t.moodHappy, grateful: t.moodGrateful },
    crop: { original: t.cropOriginal, square: t.cropSquare, portrait: t.cropPortrait, landscape: t.cropLandscape, use: t.cropUse, edit: t.cropEdit, cancel: t.cropCancel, hint: t.cropHint, hintOriginal: t.cropHintOriginal, zoom: t.cropZoom },
    env: { q: t.envQ, ph: t.envPh, save: t.envSave, skip: t.envSkip },
    step: { q: t.stepQ, ph: t.stepPh, whenQ: t.stepWhenQ, whens: t.stepWhens, save: t.stepSave, note: t.stepNote },
    meaning: { step: t.meaningStep, setback: t.meaningSetback, first: t.meaningFirst },
  };

  const feedLabels = {
    dayShort: t.dayShort, tagSetback: t.tagSetback, tagWin: t.tagWin,
    viewPublic: t.viewPublic, muteTopic: t.muteTopic,
    inviteTitle: t.feedInviteTitle, inviteSub: t.feedInviteSub, inviteCta: t.feedInviteCta, loading: '',
    tabAll: t.tabAll, tabFollowing: t.tabFollowing, followingEmptyTitle: t.followingEmptyTitle, followingEmptySub: t.followingEmptySub,
    supportIdle: t.withYouIdle, supportActive: t.withYouActive, supporters: t.supporters, supportersLoading: t.supportersLoading, supportersEmpty: t.supportersEmpty, supportStrip: t.supportStrip, supporting: t.supportingFmt, progressFmt: t.progressFmt, suggest: { title: t.suggestTitle, sub: t.suggestSub, follow: t.follow, following: t.following, followBack: t.followBack, newcomer: t.suggestNewcomer, dayFmt: t.dayShort }, moods: { down: t.moodDown, anxious: t.moodAnxious, angry: t.moodAngry, tired: t.moodTired, motivated: t.moodMotivated, happy: t.moodHappy, grateful: t.moodGrateful },
    share: t.shareShort, linkCopied: t.linkCopied,
    videoFill: t.videoFill, videoFit: t.videoFit,
    histSelo: t.histSelo, histTitle: t.histTitle, histSub: t.histSub, histCta: t.histCta,
    meuNome: profile.name || '',
    hj: { oi: t.hjOi, pergunta: t.hjPergunta, disse: t.hjDisse, feito: t.hjFeito, cta: t.hjCta },
    an: { title: t.anTitle, voltou: t.anVoltou, quase: t.anQuase, esperando: t.anEsperando, ver: t.anVer, acompanhar: t.anAcompanhar },
    esp: { teaser: t.espTeaser, eyebrow: t.espEyebrow, dayFmt: t.dayShort, palavra: t.espPalavra, tempo: t.espTempo, tom: t.espTom, ritmo: t.espRitmo, close: t.espClose },
    pc: { title: t.pcTitle, sub: t.pcSub, done: t.pcDone, cancel: t.epCancel, tipos: t.pcTipos },
    step: { back: t.stepBack, follow: t.stepFollow, following: t.stepFollowing, decided: t.stepDecided, result: t.stepResult, open: t.stepOpen },
    transf: { tag: t.trTag, dayFmt: t.trDayFmt, gap: t.trGap, see: t.trSee },
    amanha: { title: t.amTitle, comecou: t.amComecou, termina: t.amTermina, chegou: t.amChegou, marco: t.amMarco },
    retornos: { title: t.rtTitle, came: t.rtCame, cta: t.rtCta, sent: t.rtSent },
    hug: { hug: t.hugLabel, toast: t.hugToast }, metoo: { meToo: t.meToo, meTooQ: t.meTooQ, meTooBack: t.meTooBack, meTooTrying: t.meTooTrying, meTooHard: t.meTooHard, meTooJust: t.meTooJust, meTooDone: t.meTooDone }, milestoneFmt: t.milestoneFmt, needs: { title: t.needsTitle, cta: t.needsCta, sent: t.needsSent }, comebackFmt: t.comebackFmt,
    comments: { comment: t.comment, close: t.commentClose, empty: t.commentEmpty, placeholder: t.commentPlaceholder, send: t.commentSend, sending: t.commentSending, unsafe: t.commentUnsafe, pendente: t.commentPendente, error: t.commentError, someone: t.commentSomeone, reply: t.commentReply, more: t.commentMore, less: t.commentLess, replying: t.commentReplying, cancel: t.commentCancel, samples: [t.demoC1, t.demoC2, t.demoC3], ecoTag: t.ecoTag, ecoWhy: t.ecoWhy, ecoDel: t.ecoDel, ecoWhyText: t.ecoWhyText, ecoDelConfirm: t.ecoDelConfirm },
    editUpdate: { btn: t.euBtn, title: t.euTitle, text: t.euText, photo: t.euPhoto, photoAdd: t.ejCoverAdd, photoChange: t.ejCoverChange, photoRemove: t.ejCoverRemove, save: t.epSave, saving: t.epSaving, cancel: t.epCancel, errSave: t.epErrSave, errEmpty: t.euErrEmpty, deletePost: t.euDeletePost, deleteConfirm: t.postDeleteConfirm, cropOriginal: t.cropOriginal, cropSquare: t.cropSquare, cropPortrait: t.cropPortrait, cropLandscape: t.cropLandscape, cropUse: t.cropUse, cropCancel: t.cropCancel, cropHint: t.cropHint, cropHintOriginal: t.cropHintOriginal, cropZoom: t.cropZoom },
    dp: { prev: t.dpPrev, next: t.dpNext }, dayOfShort: t.dayOfShort,
    ch: { btn: t.chBtn, modalTitle: t.chModalTitle, what: t.chWhat, ph: t.chPh, daysFmt: t.chDays, together: t.chTogether, send: t.chSend, sending: t.chSending, sent: t.chSent, cancel: t.epCancel, errExists: t.chErrExists, errConn: t.chErrConn, err: t.chErr, stripTag: t.chStripTag, stripSee: t.chStripSee },
    filterLabel: t.filterLabel, filterAll: t.filterAll, moreText: t.moreText, lessText: t.lessText, follow: t.follow, following: t.following, followBack: t.followBack, kinds: { step: t.kindStep, win: t.kindWin, setback: t.kindSetback, learned: t.kindLearned },
  };

  return (
    <>
      {/* mesmo topo do resto do app. A home passa os numeros do sino
          porque ja os calculou aqui — evita repetir as consultas. */}
      <AppTop sino likes={heartLikes} follows={heartFollows} unread={unread || 0}
        avatarStyle={myMood && MOODS[myMood] ? { boxShadow: moodGlow(MOODS[myMood]) } : undefined} />

      <Track type="visit" meta={{ page: "home" }} />
      <Origem />
      <ScrollChrome />
      <DailyMood userId={user.id} answeredToday={moodToday} labels={{ title: t.dailyMoodTitle, sub: t.dailyMoodSub, skip: t.dailyMoodSkip, moods: { down: t.moodDown, anxious: t.moodAnxious, angry: t.moodAngry, tired: t.moodTired, motivated: t.moodMotivated, happy: t.moodHappy, grateful: t.moodGrateful } }} />
      <main className="wrap feed-page">
        {nc.mode && (
          <NextChapter mode={nc.mode} line={nc.line} env={nc.env} labels={ncLabels(t, nc)} dismissible />
        )}
        {!primary && (
          <section className="first-journey">
            <span className="fj-eyebrow">{t.fjEyebrow}</span>
            <h1>{t.fjTitle.replace('{name}', (profile.name || '').split(' ')[0])}</h1>
            <p>{t.fjSub}</p>
            <a className="cta grow" href="/new">{t.fjCta}</a>
            <p className="fj-hint">{t.fjHint}</p>
          </section>
        )}

        <FeedClient mutedCats={profile.muted_cats || ''} labels={feedLabels} />
      </main>
      <BottomNav active="home" t={t} />
    </>
  );
}
