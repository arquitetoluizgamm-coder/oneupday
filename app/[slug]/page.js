import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict, fill } from '../../lib/i18n';
import { getDemoStory } from '../../lib/demoStories';
import { comCapa } from '../../lib/media';
import AppTop from '../../components/AppTop';
import ShareButton from './ShareButton';
import Dia1Card from './Dia1Card';
import ChallengeButton from './ChallengeButton';
import EncourageBar from './EncourageBar';
import FollowButton from './FollowButton';
import BlockButton from './BlockButton';
import ProgressBar from '../../components/ProgressBar';
import ReportButton from './ReportButton';
import AcompanharSemConta from '../../components/AcompanharSemConta';
import MediaGallery from '../../components/MediaGallery';
import ProfileTabs from '../../components/ProfileTabs';
import FollowUserButton from './FollowUserButton';
import DuoChallengeButton from '../../components/ChallengeButton';
import OwnerMedia from '../../components/OwnerMedia';
import EditUpdate from '../../components/EditUpdate';
import Comments from '../../components/Comments';
import { notFound } from 'next/navigation';
import Track from '../../components/Track';
import TiraDeDias from '../../components/TiraDeDias';
import FechaMenus from '../../components/FechaMenus';
import SeloDoDia from '../../components/SeloDoDia';
import { textoDaPessoa } from '../../lib/registro';
import { textoAlternativo } from '../../lib/alt';

// O topo agora mostra avatar e sino de quem esta olhando, ou seja a
// pagina depende da sessao. Ela ja era dinamica de fato (o codigo le
// cookies para saber quem apoiou o quê), mas com 'revalidate' no
// arquivo isso ficava implicito — e um cache errado aqui serviria o
// avatar de uma pessoa para outra. Agora esta declarado.
export const dynamic = 'force-dynamic';

// "1 dias postados" é o tipo de detalhe que faz o produto parecer
// descuidado justamente na tela em que a pessoa está mostrando o
// próprio esforço.
const plural = (n, um, muitos) => (Number(n) === 1 ? (um || muitos) : muitos);

// Dia marcado pelo botão Fiz/Tentei/Parei, sem foto e sem relato.
// Nesses o selo já diz o que a etiqueta diria — duas etiquetas
// para o mesmo fato, uma embaixo da outra, viram ruído.
const soSelo = (u) => !u.photo_url && !u.video_url && !textoDaPessoa(u.text);

async function loadJourney(slug) {
  try {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  const { data: journey } = await sb.from('journeys').select('*').eq('slug', slug).maybeSingle();
  if (!journey) return null;
  const [{ data: owner }, { data: updates }, { data: stats }] = await Promise.all([
    sb.from('profiles').select('name, handle, avatar_color, avatar_url, banner_url').eq('id', journey.owner_id).maybeSingle(),
    sb.from('updates').select('*').eq('journey_id', journey.id).order('day_number', { ascending: true }),
    sb.from('journey_stats').select('*').eq('journey_id', journey.id).maybeSingle(),
  ]);
  const ups = updates || [];
  const encById = {};
  const myEnc = [];
  if (ups.length) {
    const { data: encs } = await sb.from('encouragements').select('update_id').in('update_id', ups.map(u => u.id));
    (encs || []).forEach(e => { encById[e.update_id] = (encById[e.update_id] || 0) + 1; });
    if (user) {
      const { data: mine } = await sb.from('encouragements').select('update_id').eq('user_id', user.id).in('update_id', ups.map(u => u.id));
      (mine || []).forEach(e => myEnc.push(e.update_id));
    }
  }
  const meTooByUpdate = {};
  if (user && user.id === journey.owner_id && ups.length) {
    try {
      const { data: mts } = await sb.from('me_too').select('update_id, msg_key').in('update_id', ups.map(u => u.id));
      (mts || []).forEach((m) => { (meTooByUpdate[m.update_id] ||= []).push(m.msg_key); });
    } catch {}
  }
  return { journey, owner, updates: ups, stats: stats || {}, encById, viewerId: user?.id || null, myEnc, meTooByUpdate };
  } catch (e) { return null; }
}

async function loadProfile(handle) {
  try {
  const sb = createClient();
  const variants = [handle];
  if (handle.startsWith('@')) variants.push(handle.slice(1)); else variants.push('@' + handle);
  let profile = null;
  for (const h of variants) {
    const { data } = await sb.from('profiles')
      .select('id, name, handle, avatar_url, avatar_color, banner_url').eq('handle', h).maybeSingle();
    if (data) { profile = data; break; }
  }
  if (!profile) return null;
  const { data: journeys } = await sb.from('journeys')
    .select('*').eq('owner_id', profile.id).order('created_at', { ascending: false });
  const js = journeys || [];
  const statsById = {};
  const photoBy = {};
  if (js.length) {
    const { data: stats } = await sb.from('journey_stats').select('*').in('journey_id', js.map(j => j.id));
    (stats || []).forEach(s => { statsById[s.journey_id] = s; });
    const { data: ph } = await sb.from('updates').select('journey_id, photo_url, day_number').in('journey_id', js.map(j => j.id)).not('photo_url', 'is', null).order('day_number', { ascending: false });
    (ph || []).forEach(u => { if (!photoBy[u.journey_id]) photoBy[u.journey_id] = u.photo_url; });
  }
  let media = [];
  try { const { data: md } = await sb.from('media').select('id, url, kind').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(30); media = md || []; } catch {}
  return { profile, journeys: js, statsById, photoBy, media };
  } catch (e) { return null; }
}

async function ProfilePage({ handle }) {
  const data = await loadProfile(handle);
  if (!data) notFound();
  const { profile, journeys, statsById, photoBy, media } = data;
  const t = getDict(getLocale());
  const initial = (profile.name || '?')[0];

  // ---- Desafios: botão (entre quem se segue) + área pública ----
  const sb2 = createClient();
  const { data: { user: viewer } } = await sb2.auth.getUser();
  let canChallenge = false;
  let pubChallenges = [];
  const chProf = {};
  try {
    if (viewer && viewer.id !== profile.id) {
      const [a, b, open] = await Promise.all([
        sb2.from('profile_follows').select('follower_id').eq('follower_id', viewer.id).eq('following_id', profile.id).maybeSingle(),
        sb2.from('profile_follows').select('follower_id').eq('follower_id', profile.id).eq('following_id', viewer.id).maybeSingle(),
        sb2.from('challenges').select('id')
          .or(`and(from_id.eq.${viewer.id},to_id.eq.${profile.id}),and(from_id.eq.${profile.id},to_id.eq.${viewer.id})`)
          .in('status', ['pending', 'active']).limit(1),
      ]);
      canChallenge = (!!a.data || !!b.data) && !(open.data && open.data.length);
    }
    const { data: chs } = await sb2.from('challenges').select('id, title, days, from_id, to_id')
      .eq('status', 'active')
      .or(`from_id.eq.${profile.id},to_id.eq.${profile.id}`)
      .order('created_at', { ascending: false }).limit(6);
    pubChallenges = chs || [];
    const ids = [...new Set(pubChallenges.flatMap((c) => [c.from_id, c.to_id]))];
    if (ids.length) {
      const { data: cps } = await sb2.from('profiles').select('id, name, avatar_url, avatar_color').in('id', ids);
      (cps || []).forEach((p) => { chProf[p.id] = p; });
    }
  } catch {}
  return (
    <>
      <AppTop />
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
            <div className="pc-follow">
              <FollowUserButton profileId={profile.id} labelFollow={t.follow} labelFollowing={t.following} labelBack={t.followBack} />
              {canChallenge && (
                <DuoChallengeButton toId={profile.id} toName={profile.name}
                  labels={{ btn: t.chBtn, modalTitle: t.chModalTitle, what: t.chWhat, ph: t.chPh, daysFmt: t.chDays, together: t.chTogether, send: t.chSend, sending: t.chSending, sent: t.chSent, cancel: t.epCancel, errExists: t.chErrExists, errConn: t.chErrConn, err: t.chErr }} />
              )}
            </div>
          </div>
        </section>

        {pubChallenges.length > 0 && (
          <section className="ch-block">
            <p className="eyebrow">{t.chTitle}</p>
            {pubChallenges.map((c) => { const pa = chProf[c.from_id] || {}; const pb = chProf[c.to_id] || {}; return (
              <a className="ch-card link" key={c.id} href={`/desafio/${c.id}`}>
                <span className="ch-ava" style={{ background: pa.avatar_color || 'var(--orange)' }}>{pa.avatar_url ? <img src={pa.avatar_url} alt="" /> : (pa.name || '?')[0]}</span>
                <span className="ch-sline" aria-hidden="true"><i /></span>
                <span className="ch-ava" style={{ background: pb.avatar_color || 'var(--orange)' }}>{pb.avatar_url ? <img src={pb.avatar_url} alt="" /> : (pb.name || '?')[0]}</span>
                <div className="ch-info"><b>{c.title}</b><p>{t.chTogether} · {fill(t.chDays, { d: c.days })}</p></div>
              </a>
            ); })}
          </section>
        )}

        {/* Jornadas e album em abas, como no perfil de casa. Antes o album
            ficava depois de todas as jornadas: quem quisesse ver as fotos
            de alguem com cinco jornadas rolava a pagina inteira — e quem
            nao sabia que existia album nunca chegava la. */}
        <ProfileTabs
          labels={{ journeys: t.profTabJourneys, album: t.profTabAlbum }}
          journeys={(
            <>
              {journeys.length === 0 && <div className="empty"><b>{t.noPublicJourneys}</b></div>}
              <div className="pj-grid">
                {journeys.map(j => {
                  const st = statsById[j.id] || {};
                  const pct = Math.min(100, st.progress_pct || 0);
                  return (
                    <a className="pj-card" key={j.id} href={`/${j.slug}`}>
                      <div className="pj-thumb" style={(j.cover_url || photoBy[j.id]) ? { backgroundImage: `linear-gradient(180deg, rgba(9,12,42,.1), rgba(9,12,42,.5)), url(${j.cover_url || photoBy[j.id]})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: `linear-gradient(135deg, var(--night), ${j.cover_color})` }}>
                        <span>{fill(t.dayShort, { d: st.current_day || 0 })}</span>
                      </div>
                      <div className="pj-body">
                        <b>{j.title}</b>
                        <div className="bar"><span style={{ width: (pct > 0 ? Math.max(pct, 6) : 0) + '%' }} /></div>
                        <small>{fill(t.dayOf, { d: st.current_day || 0, t: j.total_days, s: st.streak || 0 })}</small>
                      </div>
                    </a>
                  );
                })}
              </div>
            </>
          )}
          /* sem foto nenhuma, a aba nao existe — nao ha nada atras dela */
          album={media && media.length > 0 ? <MediaGallery items={media} /> : null}
          people={null}
        />
      </main>
      <footer className="foot">One <b>Up</b> Day · {t.tagline} · oneupday.app/{profile.handle}</footer>
    </>
  );
}

function DemoJourneyPage({ story, t, locale }) {
  const pct = Math.min(100, story.stats.progress_pct || 0);
  const momentLabels = { starting: t.mStarting, notgiveup: t.mNotgiveup, rebuilding: t.mRebuilding, health: t.mHealth, courage: t.mCourage, hardphase: t.mHardphase, building: t.mBuilding };
  const momentLabel = momentLabels[story.moment];
  const tagFor = (kind) => kind === 'setback' ? t.tagSetback : kind === 'win' ? t.tagWin : null;
  const demoNote = locale === 'pt'
    ? 'Exemplo criado para mostrar como as jornadas podem aparecer no começo do app.'
    : 'Sample journey created to show how stories can feel alive at the start of the app.';

  return (
    <>
      <AppTop />

      <Track type="demo_journey_view" meta={{ slug: story.slug }} />
      <main className="wrap">
        {/* Mesmo padrão da jornada real. Esta é a página que o visitante
            sem conta vê primeiro — se ela usar um layout diferente, o
            produto parece dois produtos. */}
        <div className="jcover-media jcm-cor" style={{ background: `linear-gradient(135deg, var(--night), ${story.cover_color})` }} />
        <section className="jcover-text">
          <p className="eyebrow">{t.demoLabelDemo}</p>
          {momentLabel && <a className="moment-tag jt-moment" href={`/grupo/${story.moment}`}>{momentLabel}</a>}
          <h1>{story.title}</h1>
          <p>{story.goal}</p>
        </section>

        <div className="demo-note">{demoNote}</div>

        <div className="who">
          <span className="ava" style={{ background: story.owner.avatarColor || 'var(--orange)' }}>
            {story.owner.avatarUrl
              ? <img src={story.owner.avatarUrl} alt="" />
              : (story.owner.name || '?')[0]}
          </span>
          <div className="who-name">
            <b>{story.owner.name}</b>
            <span>{story.owner.handle} · {fill(t.dayXofY, { d: story.stats.current_day || 0, t: story.total_days })}</span>
          </div>
          <a className="follow-btn" href="/login">{t.follow}</a>
        </div>

        {/* Mesma limpeza da jornada real: o progresso sai daqui porque a
            barra logo abaixo já o mostra. Esta é a página que o visitante
            novo vê primeiro — se o exemplo for descuidado, ele decide o
            que esperar do resto. */}
        {/* Mesma hierarquia da jornada real. */}
        <ProgressBar day={story.stats.current_day || 0} total={story.total_days} dayTpl={t.dayXofY} goalWord={t.goalWord} />
        <p className="stats-linha">
          {story.stats.days_posted || 0} {plural(story.stats.days_posted || 0, t.daysPostedOne, t.daysPosted)}
          <i aria-hidden="true">·</i>
          {story.stats.streak || 0} {plural(story.stats.streak || 0, t.dayStreakLabelOne, t.dayStreakLabel)}
        </p>

        <section className="timeline">
          {story.updates.slice().reverse().map((u, i, arr) => (
            <article key={u.id}>
              <div className="rail">
                <div className={`dot ${u.kind === 'setback' ? 'setback' : u.kind === 'win' ? 'win' : ''}`} />
                {i < arr.length - 1 && <div className="line" />}
              </div>
              <div className="body">
                {/* Mesmo título semântico da jornada real: o visitante sem
                    conta não pode encontrar uma estrutura diferente aqui. */}
                <h2 className="day">{fill(t.dayShort, { d: u.day_number })}</h2>
                {tagFor(u.kind) && <span className={`tag ${u.kind}`}>{tagFor(u.kind)}</span>}
                <p>{u.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="encourage">
          <h3>{t.joinTitle}</h3>
          <p>{t.joinSub}</p>
          <a className="cta grow" href="/login">{t.encourageJoin}</a>
        </section>
      </main>

      <footer className="foot">One <b>Up</b> Day · {t.tagline} · oneupday.app/{story.slug}</footer>
    </>
  );
}

export async function generateMetadata({ params }) {
  let slug; try { slug = decodeURIComponent(params.slug); } catch { slug = params.slug; }
  if (slug.startsWith('@')) {
    const p = await loadProfile(slug);
    return { title: p ? `${p.profile.name} · One Up Day` : 'One Up Day' };
  }
  const demo = getDemoStory(slug, getLocale());
  if (demo) {
    return {
      title: `${demo.title} · One Up Day`,
      description: demo.goal,
      twitter: { card: 'summary_large_image' },
    };
  }
  const data = await loadJourney(slug);
  if (!data) {
    const prof = await loadProfile(slug);
    if (prof) return { title: `${prof.profile.name} · One Up Day` };
    return { title: 'One Up Day' };
  }
  const { journey, stats } = data;
  // Estava com "Day X of Y" cravado em inglês. Isso aparece na aba do
  // navegador e, pior, na prévia de todo link de jornada compartilhado —
  // que é justamente o que as pessoas mandam no WhatsApp.
  const td = getDict(getLocale());
  return {
    title: `${journey.title} — ${fill(td.dayXofY, { d: stats.current_day || 0, t: journey.total_days })} · One Up Day`,
    description: journey.goal || '',
    twitter: { card: 'summary_large_image' },
  };
}

export default async function JourneyPage({ params, searchParams }) {
  let slug; try { slug = decodeURIComponent(params.slug); } catch { slug = params.slug; }
  if (slug.startsWith('@')) return <ProfilePage handle={slug} />;
  const locale = getLocale();
  const t = getDict(locale);
  const demo = getDemoStory(slug, locale);
  if (demo) return <DemoJourneyPage story={demo} t={t} locale={locale} />;
  const data = await loadJourney(slug);
  if (!data) {
    const prof = await loadProfile(slug);
    if (prof) return <ProfilePage handle={prof.profile.handle} />;
    notFound();
  }
  const { journey, owner, updates, stats, encById, viewerId, myEnc, meTooByUpdate = {} } = data;
  const isOwner = viewerId && viewerId === journey.owner_id;
  const meTooMsg = { back: t.meTooBack, trying: t.meTooTrying, hard: t.meTooHard };
  const myEncSet = new Set(myEnc || []);
  const fromShare = searchParams?.r === 's';
  const pct = Math.min(100, stats.progress_pct || 0);
  const initial = (owner?.name || '?')[0];
  const latest = updates.length ? updates[updates.length - 1] : null;
  const withPhoto = updates.filter(u => u.photo_url);
  const beforePhoto = withPhoto[0] || null;
  const nowPhoto = withPhoto.length > 1 ? withPhoto[withPhoto.length - 1] : null;
  const showBeforeNow = beforePhoto && nowPhoto && beforePhoto.id !== nowPhoto.id;
  const momentLabels = { starting: t.mStarting, notgiveup: t.mNotgiveup, rebuilding: t.mRebuilding, health: t.mHealth, courage: t.mCourage, hardphase: t.mHardphase, building: t.mBuilding };
  const momentLabel = momentLabels[journey.moment];
  const tagFor = k => k === 'setback' ? t.tagSetback : k === 'win' ? t.tagWin : null;

  // ---- Agrupar por dia ----
  // O numero do dia vem da data de inicio da jornada, entao TODA
  // publicacao feita no mesmo dia recebe o mesmo numero — o que esta
  // certo. O que estava errado era listar cada registro como um bloco
  // proprio: tres posts no dia 18 viravam tres blocos "Dia 18", um
  // embaixo do outro. Quem chega de fora le isso como duplicata.
  //
  // Agora e' um bloco por dia, com os registros dentro. Nenhum dado
  // muda; muda so o desenho.
  const porDia = [];
  {
    const mapa = new Map();
    for (const u of updates) {
      const d = u.day_number;
      if (!mapa.has(d)) { mapa.set(d, { dia: d, itens: [] }); porDia.push(mapa.get(d)); }
      mapa.get(d).itens.push(u);
    }
    // dentro do dia, o mais antigo primeiro: le-se na ordem em que aconteceu
  porDia.forEach((g) => g.itens.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
  }

  const recordedDay = porDia.reduce((max, group) => Math.max(max, Number(group.dia) || 0), 0);
  const hoje = Math.min(Number(journey.total_days) || recordedDay, Math.max(Number(stats.current_day) || 0, recordedDay));
  const dias = porDia.map((group) => ({
    n: Number(group.dia),
    tipo: group.itens.some((item) => item.kind === 'setback') ? 'f' : 'p',
  }));
  const stripLabels = locale === 'pt'
    ? {
        title: 'Navegação da jornada', day: 'Dia', of: 'de', published: 'Publicado', difficult: 'Dia difícil',
        missed: 'Não deu', future: 'Ainda não veio', previous: 'Dia anterior', next: 'Próximo dia',
        hint: 'Arraste para percorrer', release: 'Solte para ficar aqui', keyHint: '← → 1 dia · PageUp / PageDown 7 dias',
      }
    : {
        title: 'Journey navigation', day: 'Day', of: 'of', published: 'Published', difficult: 'Hard day',
        missed: 'Didn’t happen', future: 'Not yet', previous: 'Previous day', next: 'Next day',
        hint: 'Drag to move through the journey', release: 'Release to stay here', keyHint: '← → 1 day · PageUp / PageDown 7 days',
      };

  return (
    <>
      <AppTop />

      <Track type="journey_view" meta={{ slug: journey.slug }} />
      <FechaMenus />
      {fromShare && <Track type="card_clicked" meta={{ slug: journey.slug }} />}
      <main className="wrap">
        {journey.cover_url ? (
          <>
            <div className="jcover-media" style={{ backgroundImage: `url(${journey.cover_url})` }} />
            <section className="jcover-text">
              <p className="eyebrow">{t.publicJourney}</p>
              {momentLabel && <a className="moment-tag jt-moment" href={`/grupo/${journey.moment}`}>{momentLabel}</a>}
              <h1>{journey.title}</h1>
              {journey.goal && <p>{journey.goal}</p>}
            </section>
          </>
        ) : (
        <>
          {/* ============================================================
              CAPA LIMPA, TEXTO EMBAIXO

              Antes, quando não havia capa própria da jornada, o título
              e o objetivo eram empilhados SOBRE a foto de banner. Para
              o texto sobreviver, era preciso um gradiente escuro de 82%
              por cima — ou seja, a imagem que a pessoa escolheu virava
              um fundo abafado a serviço da tipografia.

              Este layout já existia no app, no caminho de quem tem capa
              própria. Agora os dois caminhos usam o mesmo: a foto fica
              inteira e sem véu, e o texto vive embaixo, em tinta sobre
              creme, onde não precisa competir com nada.

              Sem foto nenhuma, a faixa vira um campo de cor da jornada —
              mais baixa, porque campo de cor não pede a mesma presença
              que uma fotografia.
              ============================================================ */}
          <div
            className={`jcover-media${owner?.banner_url ? '' : ' jcm-cor'}`}
            style={owner?.banner_url
              ? { backgroundImage: `url(${owner.banner_url})` }
              : { background: `linear-gradient(135deg, var(--night), ${journey.cover_color})` }}
          />
          <section className="jcover-text">
            <p className="eyebrow">{t.publicJourney}</p>
            {momentLabel && <a className="moment-tag jt-moment" href={`/grupo/${journey.moment}`}>{momentLabel}</a>}
            <h1>{journey.title}</h1>
            {journey.goal && <p>{journey.goal}</p>}
          </section>
        </>
        )}

        <div className="who">
          <a className="ava" href={`/${owner?.handle || ''}`} style={{ background: owner?.avatar_color || 'var(--orange)' }}>{owner?.avatar_url ? <img src={owner.avatar_url} alt="" /> : initial}</a>
          <a className="who-name" href={`/${owner?.handle || ''}`}>
            <b>{owner?.name}</b>
            <span>{owner?.handle} · {fill(t.dayXofY, { d: stats.current_day || 0, t: journey.total_days })}</span>
          </a>
          {viewerId && <FollowButton journeyId={journey.id} labelFollow={t.follow} labelFollowing={t.following} />}
        </div>

        {/* ============================================================
            UMA AÇÃO CLARA, PERTO DO TÍTULO

            Quem chega sem conta encontrava o convite só lá embaixo,
            depois de rolar a jornada inteira — ou seja, depois de já
            ter decidido ir embora.

            O convite de acompanhar sem conta continua no rodapé, para
            quem leu tudo e se convenceu no caminho. Este aqui é para
            quem se convenceu no primeiro parágrafo.
            ============================================================ */}
        {!viewerId && (
          <a className="cta cta-jornada" href="/login">{t.startCta || t.follow}</a>
        )}
        {/* ============================================================
            "Bloquear" saiu da área principal.

            Não é só ruído: um botão de bloquear ao lado do nome da
            pessoa sugere que ela é um risco. Numa rede sobre
            vulnerabilidade, isso é uma acusação feita pela moldura,
            antes de qualquer palavra dela ser lida.

            Continua a um toque de distância, no menu — que é onde
            moram as ações que a pessoa procura quando precisa, e não
            as que o app oferece sem ser perguntado.
            ============================================================ */}
        <details className="mais-menu who-mais">
          <summary aria-label={t.moreOptions || 'Mais opções'}>⋯</summary>
          <div className="mais-lista"><BlockButton ownerId={journey.owner_id} label={t.blockUser} /></div>
        </details>

        {/* O "progresso %" saiu daqui: a barra logo abaixo já mostra o
            mesmo número, e a repetição em 200px de tela fazia a pessoa
            conferir se eram coisas diferentes. Ficam os dois que só
            existem aqui. */}
        {/* A barra abaixo já é a leitura principal: "Dia 3 de 30 · 10%".
            Estes dois números descem para uma linha discreta — eles
            interessam a quem já entrou na história, não a quem está
            decidindo se entra. */}
        <ProgressBar day={stats.current_day || 0} total={journey.total_days} dayTpl={t.dayXofY} goalWord={t.goalWord} />
        <p className="stats-linha">
          {stats.days_posted || 0} {plural(stats.days_posted || 0, t.daysPostedOne, t.daysPosted)}
          <i aria-hidden="true">·</i>
          {stats.streak || 0} {plural(stats.streak || 0, t.dayStreakLabelOne, t.dayStreakLabel)}
        </p>

        {showBeforeNow && (
          <section className="before-now">
            <figure>
              <img src={beforePhoto.photo_url} alt={textoAlternativo(beforePhoto.alt, { dia: beforePhoto.day_number, titulo: journey.title }, t)} />
              <figcaption><span>{t.before}</span><small>{fill(t.dayShort, { d: beforePhoto.day_number })}</small></figcaption>
            </figure>
            <figure>
              <img src={nowPhoto.photo_url} alt={textoAlternativo(nowPhoto.alt, { dia: nowPhoto.day_number, titulo: journey.title }, t)} />
              <figcaption><span>{t.now}</span><small>{fill(t.dayShort, { d: nowPhoto.day_number })}</small></figcaption>
            </figure>
          </section>
        )}

        {/* ============================================================
            O PISO É O TAMANHO DA JORNADA, NÃO O DIA DE HOJE

            Eu tinha escrito `hoje >= 5`, e escondia a tira de todas as
            jornadas reais — que estão no dia 1 ou 3. O raciocínio era
            "abaixo de 5 dias não há o que navegar", e ele ignora a
            segunda função da tira, que é mostrar o CAMINHO À FRENTE.

            No dia 1 de 30, vinte e nove marcas cinzas adiante são
            exatamente o sinal de que aquilo é uma jornada e não um post
            avulso. É o momento em que a pessoa mais precisa ver isso —
            e era justamente quando eu escondia.

            O piso certo pergunta se a JORNADA é longa o bastante para
            ter forma, não se a pessoa já andou o bastante.
            ============================================================ */}
        {Number(journey.total_days) >= 5 && (
          <TiraDeDias dias={dias} hoje={hoje} total={journey.total_days} labels={stripLabels} />
        )}

        <section className="timeline">
          {porDia.slice().reverse().map((g, gi, garr) => {
            // o dia herda o tom do registro mais forte: recaida vence, depois vitoria
            const tom = g.itens.some((x) => x.kind === 'setback') ? 'setback'
                      : g.itens.some((x) => x.kind === 'win') ? 'win' : '';
            return (
            <article id={`journey-day-${g.dia}`} key={'d' + g.dia}>
              <div className="rail">
                <div className={`dot ${tom}`} />
                {gi < garr.length - 1 && <div className="line" />}
              </div>
              <div className="body">
                {/* ============================================================
                    O CAPÍTULO É UM TÍTULO, NÃO UM TEXTO EM NEGRITO

                    Quem lê com leitor de tela navega por títulos. Com
                    <span>, os dias não existiam como estrutura: a pessoa
                    ouvia trinta registros seguidos sem nenhuma marca de
                    onde um dia termina e o outro começa.

                    O contador também era mudo — "5" sozinho não diz nada.
                    Agora o número aparece para o olho e a frase inteira
                    para o ouvido.
                    ============================================================ */}
                <h2 className="day">
                  {fill(t.dayShort, { d: g.dia })}
                  {g.itens.length > 1 && (
                    <span className="day-n">
                      <span aria-hidden="true">{g.itens.length}</span>
                      <span className="sr-only">{fill(t.recordsFmt, { n: g.itens.length })}</span>
                    </span>
                  )}
                </h2>

                {g.itens.map((u, ii) => (
                <div className={`dia-item${ii > 0 ? ' extra' : ''}`} key={u.id}>
                {tagFor(u.kind) && !soSelo(u) && <span className={`tag ${u.kind}`}>{tagFor(u.kind)}</span>}
                {u.photo_url && (isOwner
                  ? <OwnerMedia updateId={u.id} url={u.photo_url} kind="photo" alt={textoAlternativo(u.alt, { dia: u.day_number, titulo: journey.title }, t)} labels={{ remove: t.mediaRemove, confirm: t.mediaRemoveConfirm, error: t.postError }} />
                  : <div className="update-photo"><img src={u.photo_url} alt={textoAlternativo(u.alt, { dia: u.day_number, titulo: journey.title }, t)} /></div>)}
                {u.video_url && (isOwner
                  ? <OwnerMedia updateId={u.id} url={u.video_url} kind="video" labels={{ remove: t.mediaRemove, confirm: t.mediaRemoveConfirm, error: t.postError }} />
                  : <div className="update-photo"><video src={comCapa(u.video_url)} controls playsInline preload="metadata" /></div>)}
                {textoDaPessoa(u.text)
                  ? <p>{textoDaPessoa(u.text)}</p>
                  : (!u.photo_url && !u.video_url &&
                      <SeloDoDia kind={u.kind} labels={{ fiz: t.seloFiz, tentei: t.seloTentei, parei: t.seloParei }} />)}
                {isOwner && (meTooByUpdate[u.id] || []).length > 0 && (
                  <div className="metoo-author">
                    <b>{t.meTooAuthor}</b>
                    <span>{fill(t.meTooCountFmt, { n: meTooByUpdate[u.id].length })}</span>
                    <ul>
                      {meTooByUpdate[u.id].filter(k => k !== 'metoo').slice(0, 6).map((k, i) => <li key={i}>“{meTooMsg[k]}”</li>)}
                    </ul>
                  </div>
                )}
                <div className="update-foot">
                  <EncourageBar updateId={u.id} initialActive={myEncSet.has(u.id)} labelIdle={t.withYouIdle} labelActive={t.withYouActive} supportersLabel={t.supporters} supportersLoading={t.supportersLoading} supportersEmpty={t.supportersEmpty} />
                  <Comments updateId={u.id} labels={{ comment: t.comment, close: t.commentClose, empty: t.commentEmpty, placeholder: t.commentPlaceholder, send: t.commentSend, sending: t.commentSending, unsafe: t.commentUnsafe, pendente: t.commentPendente, error: t.commentError, someone: t.commentSomeone, reply: t.commentReply, more: t.commentMore, less: t.commentLess, replying: t.commentReplying, cancel: t.commentCancel }} />
                  {isOwner
                    ? <EditUpdate update={{ id: u.id, text: u.text, alt: u.alt, photo_url: u.photo_url, day: u.day_number }} labels={{ altLabel: t.altLabel, altPh: t.altPh, altOk: t.altOk, altVazio: t.altVazio, btn: t.euBtn, title: t.euTitle, text: t.euText, photo: t.euPhoto, photoAdd: t.ejCoverAdd, photoChange: t.ejCoverChange, photoRemove: t.ejCoverRemove, save: t.epSave, saving: t.epSaving, cancel: t.epCancel, errSave: t.epErrSave, errEmpty: t.euErrEmpty, deletePost: t.euDeletePost, deleteConfirm: t.postDeleteConfirm, cropOriginal: t.cropOriginal, cropSquare: t.cropSquare, cropPortrait: t.cropPortrait, cropLandscape: t.cropLandscape, cropUse: t.cropUse, cropCancel: t.cropCancel, cropHint: t.cropHint, cropHintOriginal: t.cropHintOriginal, cropZoom: t.cropZoom }} />
                    : (
                      /* Dez posts com quatro controles cada davam quarenta
                         botões numa página de três dias. Ficam visíveis os
                         dois que a pessoa veio fazer; denunciar é o que ela
                         procura quando precisa. */
                      <details className="mais-menu post-mais">
                        <summary aria-label={t.moreOptions || 'Mais opções'}>⋯</summary>
                        <div className="mais-lista"><ReportButton updateId={u.id} label={t.report} doneLabel={t.reported} /></div>
                      </details>
                    )}
                </div>
                </div>
                ))}
              </div>
            </article>
            );
          })}
        </section>

        {/* Acompanhar sem criar conta — só para quem NAO esta logado e
            só em jornada publica. Quem tem conta ja segue de verdade. */}
        {!viewerId && journey.visibility === 'public' && (
          <AcompanharSemConta slug={journey.slug} t={t} />
        )}

        <section className="share-card-section">
          <div className="share-copy">
            <p className="eyebrow">{t.publicJourney}</p>
            <h3>{t.shareTitle}</h3>
            <p>{t.shareSub}</p>
          </div>
          <ShareButton journey={journey} owner={owner} stats={stats} latest={latest}
            label={t.shareCard} downloading={t.shareDownloading}
            card={{ day: t.cardDay, of: t.cardOf, streak: t.cardStreak, setback: t.cardSetback }} />
          <div className="movement-actions">
            <Dia1Card journey={journey} owner={owner} theme={journey.title}
              label={t.dia1CardBtn} downloading={t.shareDownloading}
              texts={{ eyebrow: t.dia1Eyebrow, big: t.dia1Big, invite: t.dia1Invite, by: t.dia1By }} />
            <ChallengeButton slug={journey.slug} theme={journey.title}
              label={t.challengeBtn} copiedLabel={t.linkCopied} message={t.challengeMsg} />
          </div>
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
