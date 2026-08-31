import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import AppTop from '../../components/AppTop';
import BottomNav from '../../components/BottomNav';
import FeedClient from './FeedClient';
import NextStep from './NextStep';
import ProgressBar from '../../components/ProgressBar';
import Track from '../../components/Track';
import Origem from '../../components/Origem';
import ScrollChrome from '../../components/ScrollChrome';
import DailyMood from '../../components/DailyMood';
import NextChapter from '../../components/NextChapter';
import { computeNextChapter, ncLabels } from '../../lib/nextChapter';
import UpiDailyMemory from './UpiDailyMemory';

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

  const { data: journeys } = await supabase.from('journeys').select('*').eq('owner_id', user.id).order('created_at', { ascending: false });
  const list = journeys || [];
  let primary = list[0] || null;
  if (list.length) {
    const { data: stats } = await supabase.from('journey_stats').select('journey_id, current_day').in('journey_id', list.map((j) => j.id));
    const byId = Object.fromEntries((stats || []).map((s) => [s.journey_id, s.current_day || 0]));
    primary = list.find((j) => (byId[j.id] || 0) < (j.total_days || 0)) || primary;
  }

  let moodToday = false;
  try { const { data: mp } = await supabase.from('profiles').select('mood, mood_at').eq('id', user.id).maybeSingle(); if (mp?.mood_at && (Date.now() - new Date(mp.mood_at).getTime() < 30 * 3600 * 1000)) moodToday = !!mp.mood; } catch {}

  // ---- Próximo Capítulo: antecipação pelo amanhã, nunca ansiedade ----
  const nc = await computeNextChapter(supabase, user.id, primary, t);

  const feedLabels = {
    dayShort: t.dayShort, journeyStatusFmt: t.journeyStatusFmt, tagSetback: t.tagSetback, tagWin: t.tagWin,
    selo: { fiz: t.seloFiz, tentei: t.seloTentei, parei: t.seloParei, comecei: t.seloComecei },
    altReserva: t.altReserva,
    viewPublic: t.viewPublic, muteTopic: t.muteTopic,
    inviteTitle: t.feedInviteTitle, inviteSub: t.feedInviteSub, inviteCta: t.feedInviteCta, loading: '',
    tabAll: t.tabAll, tabFollowing: t.tabFollowing, followingEmptyTitle: t.followingEmptyTitle, followingEmptySub: t.followingEmptySub,
    supportIdle: t.withYouIdle, supportActive: t.withYouActive, supporters: t.supporters, supportersLoading: t.supportersLoading, supportersEmpty: t.supportersEmpty, supportStrip: t.supportStrip, supporting: t.supportingFmt, progressFmt: t.progressFmt, suggest: { title: t.suggestTitle, sub: t.suggestSub, follow: t.follow, following: t.following, followBack: t.followBack, newcomer: t.suggestNewcomer, dayFmt: t.dayShort }, moodLineFmt: t.moodLineFmt, moodFeed: t.moodFeed, moods: { down: t.moodDown, anxious: t.moodAnxious, angry: t.moodAngry, tired: t.moodTired, motivated: t.moodMotivated, happy: t.moodHappy, grateful: t.moodGrateful },
    share: t.shareShort, linkCopied: t.linkCopied, quoteLabel: t.quoteLabel, oneLevels: t.oneLevels,
    feedStoryBack: t.feedStoryBack, feedStoryMilestone: t.feedStoryMilestone, feedStoryStart: t.feedStoryStart,
    feedStoryHard: t.feedStoryHard, feedStoryNext: t.feedStoryNext, feedStoryPhoto: t.feedStoryPhoto,
    feedStoryDefault: t.feedStoryDefault,
    upiRecommendation: { title: t.upiRecTitle, started: t.upiRecStarted, hard: t.upiRecHard, moving: t.upiRecMoving, day: t.upiRecDay },
    videoFill: t.videoFill, videoFit: t.videoFit,
    histSelo: t.histSelo, histTitle: t.histTitle, histSub: t.histSub, histCta: t.histCta,
    meuNome: profile.name || '',
    hj: { oi: t.hjOi, pergunta: t.hjPergunta, disse: t.hjDisse, feito: t.hjFeito, cta: t.hjCta },
    an: { title: t.anTitle, sub: t.anSub, voltou: t.anVoltou, quase: t.anQuase, esperando: t.anEsperando, ver: t.anVer, acompanhar: t.anAcompanhar },
    esp: { teaser: t.espTeaser, eyebrow: t.espEyebrow, dayFmt: t.dayShort, palavra: t.espPalavra, tempo: t.espTempo, tom: t.espTom, ritmo: t.espRitmo, close: t.espClose },
    pc: { title: t.pcTitle, sub: t.pcSub, done: t.pcDone, cancel: t.epCancel, tipos: t.pcTipos },
    step: { back: t.stepBack, follow: t.stepFollow, following: t.stepFollowing, decided: t.stepDecided, result: t.stepResult, open: t.stepOpen },
    transf: { tag: t.trTag, dayFmt: t.trDayFmt, gap: t.trGap, gapOne: t.trGapOne, see: t.trSee },
    amanha: { title: t.amTitle, sub: t.amSub, comecou: t.amComecou, termina: t.amTermina, chegou: t.amChegou, marco: t.amMarco, doneDay: t.amDoneDay, reachedDay: t.amReachedDay },
    retornos: { title: t.rtTitle, came: t.rtCame, cta: t.rtCta, sent: t.rtSent },
    hug: { hug: t.hugLabel, toast: t.hugToast }, metoo: { meToo: t.meToo, meTooQ: t.meTooQ, meTooBack: t.meTooBack, meTooTrying: t.meTooTrying, meTooHard: t.meTooHard, meTooJust: t.meTooJust, meTooDone: t.meTooDone }, milestoneFmt: t.milestoneFmt, needs: { title: t.needsTitle, sub: t.needsSub, context: t.needsContext, cta: t.needsCta, sent: t.needsSent }, comebackFmt: t.comebackFmt,
    popoverClose: t.commentClose,
    comments: { comment: t.comment, close: t.commentClose, empty: t.commentEmpty, placeholder: t.commentPlaceholder, send: t.commentSend, sending: t.commentSending, unsafe: t.commentUnsafe, pendente: t.commentPendente, error: t.commentError, someone: t.commentSomeone, reply: t.commentReply, more: t.commentMore, less: t.commentLess, replying: t.commentReplying, cancel: t.commentCancel, samples: [t.demoC1, t.demoC2, t.demoC3], ecoTag: t.ecoTag, ecoWhy: t.ecoWhy, ecoDel: t.ecoDel, ecoWhyText: t.ecoWhyText, ecoDelConfirm: t.ecoDelConfirm },
    editUpdate: { altLabel: t.altLabel, altPh: t.altPh, altOk: t.altOk, altVazio: t.altVazio, btn: t.euBtn, title: t.euTitle, text: t.euText, photo: t.euPhoto, photoAdd: t.ejCoverAdd, photoChange: t.ejCoverChange, photoRemove: t.ejCoverRemove, save: t.epSave, saving: t.epSaving, cancel: t.epCancel, errSave: t.epErrSave, errEmpty: t.euErrEmpty, deletePost: t.euDeletePost, deleteConfirm: t.postDeleteConfirm, cropOriginal: t.cropOriginal, cropSquare: t.cropSquare, cropPortrait: t.cropPortrait, cropLandscape: t.cropLandscape, cropUse: t.cropUse, cropCancel: t.cropCancel, cropHint: t.cropHint, cropHintOriginal: t.cropHintOriginal, cropZoom: t.cropZoom },
    dp: { prev: t.dpPrev, next: t.dpNext }, dayOfShort: t.dayOfShort,
    ch: { btn: t.chBtn, modalTitle: t.chModalTitle, what: t.chWhat, ph: t.chPh, daysFmt: t.chDays, together: t.chTogether, send: t.chSend, sending: t.chSending, sent: t.chSent, cancel: t.epCancel, errExists: t.chErrExists, errConn: t.chErrConn, err: t.chErr, stripTag: t.chStripTag, stripSee: t.chStripSee },
    filterLabel: t.filterLabel, filterAll: t.filterAll, moreText: t.moreText, lessText: t.lessText, focusFree: t.focusFree, focusPresence: t.focusPresence, follow: t.follow, following: t.following, followBack: t.followBack, kinds: { step: t.kindStep, win: t.kindWin, setback: t.kindSetback, learned: t.kindLearned },
  };

  return (
    <>
      {/* Mesmo topo global usado no restante do app. */}
      <AppTop sino />

      <Track type="visit" meta={{ page: "home" }} />
      <Origem />
      <ScrollChrome />
      <DailyMood userId={user.id} answeredToday={moodToday} labels={{ title: t.dailyMoodTitle, sub: t.dailyMoodSub, skip: t.dailyMoodSkip, moods: { down: t.moodDown, anxious: t.moodAnxious, angry: t.moodAngry, tired: t.moodTired, motivated: t.moodMotivated, happy: t.moodHappy, grateful: t.moodGrateful } }} />
      <main className="wrap feed-page">
        <FeedClient mutedCats={profile.muted_cats || ''} labels={feedLabels} />
        <a className="diary-shortcut" href="/diario">
          <span className="diary-shortcut-icon" aria-hidden="true">✎</span>
          <span><b>{t.navDiary}</b><small>{t.diarySub}</small></span>
          <span className="diary-shortcut-arrow" aria-hidden="true">›</span>
        </a>
        <UpiDailyMemory labels={{
          title: t.upiMemoryTitle, sub: t.upiMemorySub, placeholder: t.upiMemoryPh,
          save: t.upiMemorySave, update: t.upiMemoryUpdate, saving: t.upiMemorySaving,
          saved: t.upiMemorySaved, diary: t.navDiary,
        }} />
        {nc.mode && (
          <NextChapter mode={nc.mode} line={nc.line} env={nc.env} labels={ncLabels(t, nc)} dismissible />
        )}
      </main>
      <BottomNav active="home" t={t} />
    </>
  );
}
