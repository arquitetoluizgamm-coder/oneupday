import { redirect, notFound } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/server';
import { getLocale } from '../../../../lib/locale';
import { getDict, fill } from '../../../../lib/i18n';
import AppTop from '../../../../components/AppTop';
import BottomNav from '../../../../components/BottomNav';
import ProgressBar from '../../../../components/ProgressBar';
import JourneyDays from '../../../../components/JourneyDays';
import EditarJornada from '../../../../components/EditarJornada';
import DeleteJourney from '../../../../components/DeleteJourney';
import Composer from '../../../home/Composer';
import NextStep from '../../../home/NextStep';

export const dynamic = 'force-dynamic';

// ============================================================
// A JORNADA TEM PÁGINA PRÓPRIA
//
// Antes tudo vivia dentro do perfil: registrar o dia, ver os dias,
// editar, excluir — empilhado em cada card, atrás de um "abrir".
// O perfil virou uma lista, e cada jornada abre aqui.
// ============================================================
export default async function JornadaDoDono({ params }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let slug; try { slug = decodeURIComponent(params.slug); } catch { slug = params.slug; }
  const t = getDict(getLocale());

  const { data: j } = await supabase.from('journeys').select('*').eq('slug', slug).maybeSingle();
  if (!j) notFound();
  // só o dono edita: sem isso a URL viraria uma porta aberta
  if (j.owner_id !== user.id) redirect(`/${slug}`);

  let stats = {};
  try {
    const { data: st } = await supabase.from('journey_stats').select('*').eq('journey_id', j.id).maybeSingle();
    stats = st || {};
  } catch {}
  const day = stats.current_day || 0;

  let aiPrefOff = false;
  try {
    const { data: pref } = await supabase.from('profiles').select('ai_opt_out').eq('id', user.id).maybeSingle();
    aiPrefOff = !!pref?.ai_opt_out;
  } catch {}
  const aiOn = !!process.env.OPENAI_API_KEY && !aiPrefOff;

  const kindLabels = { step: t.kindStep, win: t.kindWin, setback: t.kindSetback, learned: t.kindLearned };

  return (
    <>
      <AppTop backLabel={t.back} />
      <main className="wrap jornada-dono">

        <div className="create-head">
          <p className="eyebrow">{fill(t.dayOf, { d: day, t: j.total_days, s: stats.streak || 0 })}</p>
          <h1>{j.title}</h1>
        </div>

        <ProgressBar day={day} total={j.total_days} dayTpl={t.dayXofY} goalWord={t.goalWord} />

        <div className="jd-links">
          <a className="view-link" href={`/${j.slug}`}>{t.viewPublic}</a>
          <a className="view-link" href={`/retro/${j.slug}`}>{t.retroLink}</a>
        </div>

        {/* registrar o dia continua sendo a ação mais frequente:
            fica no topo, antes de qualquer coisa de configuração */}
        <section className="jd-bloco">
          <p className="jd-titulo">{t.navToday}</p>
          <Composer journeyId={j.id} startDate={j.created_at} aiOn={aiOn} labels={kindLabels} t={{
            placeholder: t.composerPh, post: t.post, posting: t.posting, error: t.postError, setbackNote: t.setbackNote,
            addPhoto: t.addPhoto, uploading: t.uploading, photoAdded: t.photoAdded,
            addVideo: t.addVideo, videoAdded: t.videoAdded, videoTooBig: t.videoTooBig,
            crisisTitle: t.crisisTitle, crisisText: t.crisisText,
            ritualQ: t.ritualQ, rDid: t.rDid, rTried: t.rTried, rPaused: t.rPaused,
            aiWrite: t.aiWrite,
            musicAdd: t.musicAdd, musicTitle: t.musicTitle, musicUse: t.musicUse, musicRemove: t.musicRemove,
            musicEmpty: t.musicEmpty, musicSearchPh: t.musicSearchPh, musicKeyNeeded: t.musicKeyNeeded,
            aiErr: t.aiErr, aiRateErr: t.aiRateErr,
            moodQ: t.moodQ,
            dayRegisterTitle: t.dayRegisterTitle, dayRegisterSub: t.dayRegisterSub,
            dayPicked: t.dayPicked, dayChooseFirst: t.dayChooseFirst,
            dayPost: t.dayPost, draftSaved: t.draftSaved,
            upiPolishTitle: t.upiPolishTitle, upiPolishSub: t.upiPolishSub, upiPolishBtn: t.upiPolishBtn,
            extraShow: t.extraShow, extraHide: t.extraHide,
            // A pergunta do dia. `prompts` saiu: os quatro chips fixos
            // viraram uma pergunta só, escolhida pela situação da jornada.
            pergPasso: t.pergPasso, pergDia1: t.pergDia1,
            pergDepoisDeDificil: t.pergDepoisDeDificil, pergMarco: t.pergMarco,
            pergGerais: t.pergGerais, pergOutra: t.pergOutra,
            moods: { down: t.moodDown, anxious: t.moodAnxious, angry: t.moodAngry, tired: t.moodTired, motivated: t.moodMotivated, happy: t.moodHappy, grateful: t.moodGrateful },
            crop: { original: t.cropOriginal, square: t.cropSquare, portrait: t.cropPortrait, landscape: t.cropLandscape, use: t.cropUse, edit: t.cropEdit, cancel: t.cropCancel, hint: t.cropHint, hintOriginal: t.cropHintOriginal, zoom: t.cropZoom },
            env: { q: t.envQ, ph: t.envPh, save: t.envSave, skip: t.envSkip },
            step: { q: t.stepQ, ph: t.stepPh, whenQ: t.stepWhenQ, whens: t.stepWhens, save: t.stepSave, note: t.stepNote },
            meaning: { step: t.meaningStep, setback: t.meaningSetback, first: t.meaningFirst },
          }} />
          {aiOn && <NextStep journeyId={j.id} label={t.aiNextStep} thinking={t.aiThinking} errLabel={t.aiErr} rateLabel={t.aiRateErr} />}
        </section>

        <section className="jd-bloco">
          <p className="jd-titulo">{t.jdShow}</p>
          <JourneyDays journeyId={j.id}
            labels={{ show: t.jdShow, hide: t.jdHide, empty: t.jdEmpty, loading: t.jdLoading, dayFmt: t.dayShort }}
            editLabels={{ altLabel: t.altLabel, altPh: t.altPh, altOk: t.altOk, altVazio: t.altVazio, btn: t.euBtn, title: t.euTitle, text: t.euText, photo: t.euPhoto, photoAdd: t.ejCoverAdd, photoChange: t.ejCoverChange, photoRemove: t.ejCoverRemove, save: t.epSave, saving: t.epSaving, cancel: t.epCancel, errSave: t.epErrSave, errEmpty: t.euErrEmpty, deletePost: t.euDeletePost, deleteConfirm: t.postDeleteConfirm, cropOriginal: t.cropOriginal, cropSquare: t.cropSquare, cropPortrait: t.cropPortrait, cropLandscape: t.cropLandscape, cropUse: t.cropUse, cropCancel: t.cropCancel, cropHint: t.cropHint, cropHintOriginal: t.cropHintOriginal, cropZoom: t.cropZoom }} />
        </section>

        <details className="jd-bloco jd-config">
          <summary>
            <span>{t.ejTitle}</span>
            <small>{t.jdConfigHint}</small>
          </summary>
          <div className="jd-config-body">
            <EditarJornada journey={j} currentDay={day} t={t} />

            {/* excluir fica dentro de configuração: perigoso, mas fora do fluxo principal */}
            <section className="jd-perigo">
              <DeleteJourney journeyId={j.id} title={j.title}
                labels={{ btn: t.jDeleteBtn, confirm: t.jDeleteConfirm, error: t.jDeleteErr }} />
            </section>
          </div>
        </details>

      </main>
      <BottomNav active="profile" t={t} />
    </>
  );
}
