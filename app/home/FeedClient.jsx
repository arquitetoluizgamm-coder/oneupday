'use client';
import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState, Fragment } from 'react';
import EncourageBar from '../[slug]/EncourageBar';
import FeedShare from './FeedShare';
import Comments from '../../components/Comments';
import SuggestionCard from '../../components/SuggestionCard';
import NeedsSupport from '../../components/NeedsSupport';
import EditUpdate from '../../components/EditUpdate';
import Transformacao from '../../components/Transformacao';
import Amanha from '../../components/Amanha';
import SeloDoDia from '../../components/SeloDoDia';
import VerJornada from '../../components/VerJornada';
import TextoComMencoes from '../../components/TextoComMencoes';
import { textoDaPessoa } from '../../lib/registro';
import { textoAlternativo } from '../../lib/alt';
import Retornos from '../../components/Retornos';
import { StepOpen, StepResult } from '../../components/StepChapter';
import Percepcao from '../../components/Percepcao';
import Andamento from '../../components/Andamento';
import Espelho from '../../components/Espelho';
import LoopMarca from '../../components/LoopMarca';
import { MOODS, MOODS_TEXTO, moodGlow } from '../../lib/moods';
import { comCapa } from '../../lib/media';
import FollowUserButton from '../[slug]/FollowUserButton';
import UpiRecommendation from '../../components/UpiRecommendation';
import './feed-quote.css';

function OneLevel({ level, labels }) {
  if (!level || !labels?.oneLevels?.[level.rank]) return null;
  return <span className="one-level" style={{ color: level.color }} aria-label={`ONE ${labels.oneLevels[level.rank]}`}>ONE {labels.oneLevels[level.rank]}</span>;
}

function fillLabel(text, data = {}) {
  return String(text || '').replace(/\{(\w+)\}/g, (_, key) => data[key] ?? '');
}

function JourneyTitlePill({ title, slug, day }) {
  if (!title || !slug) return null;
  return (
    <a className="feed-journey-pill" href={`/${slug}`}>
      {day && <small>{day}</small>}
      <b>{title}</b>
    </a>
  );
}

function journeyStatusLabel(labels, day) {
  const short = fillLabel(labels.dayShort, { d: day });
  return fillLabel(labels.journeyStatusFmt || 'Jornada em andamento · {day}', { day: short });
}

function MoodLine({ mood, labels }) {
  const text = mood && ((labels.moodFeed || {})[mood] || (labels.moods || {})[mood]);
  if (!text) return null;
  const phrase = fillLabel(labels.moodLineFmt || 'Sentindo {mood} hoje', { mood: text });
  return (
    <small className="entry-mood-line" style={{ '--mood': MOODS[mood], color: MOODS_TEXTO[mood] || MOODS[mood] }}>
      {phrase}
    </small>
  );
}

function avatarMoodStyle(owner) {
  return {
    background: owner.avatar_color || 'var(--orange)',
    ...(owner.mood && MOODS[owner.mood] ? { '--mood-shadow': moodGlow(MOODS[owner.mood]) } : {}),
  };
}

function avatarMoodClass(owner) {
  return `entry-ava${owner?.mood && MOODS[owner.mood] ? ' has-mood' : ''}`;
}

const MediaPlaybackContext = createContext(null);
const TRACK_PLAY_EVENT = 'one:track-play';

function TrackTag({ track, float, hasBar }) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const audio = useRef(null);
  const shell = useRef(null);
  const inView = useRef(false);
  const instanceId = useId();
  const mediaRef = useContext(MediaPlaybackContext);
  const start = Math.max(0, Number(track.start_seconds) || 0);
  const duration = Math.max(0, Number(track.duration_seconds) || 0);
  const end = duration > 0 ? start + duration : Infinity;

  const pause = useCallback(() => {
    if (audio.current) audio.current.pause();
    setPlaying(false);
  }, []);

  const playTrack = useCallback(async ({ reset = false, allowMutedFallback = true } = {}) => {
    const player = audio.current;
    if (!player) return false;
    const video = mediaRef?.current;
    const offset = video && (!duration || video.currentTime < duration) ? (video.currentTime || 0) : 0;
    const target = start + offset;
    if (reset || player.currentTime < start || player.currentTime >= end - 0.04) {
      try { player.currentTime = target; } catch {}
    }
    player.volume = 0.85;
    player.muted = false;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(TRACK_PLAY_EVENT, { detail: instanceId }));
    }
    try {
      await player.play();
      setMuted(false);
      setPlaying(true);
      return true;
    } catch {
      if (!allowMutedFallback) {
        setPlaying(false);
        return false;
      }
      player.muted = true;
      try {
        await player.play();
        setMuted(true);
        setPlaying(true);
        return true;
      } catch {
        setMuted(true);
        setPlaying(false);
        return false;
      }
    }
  }, [duration, end, instanceId, mediaRef, start]);

  function syncToVideo() {
    const player = audio.current;
    const video = mediaRef?.current;
    if (!player || !video) return;
    if (duration > 0 && video.currentTime >= duration - 0.04) {
      player.pause();
      setPlaying(false);
      return;
    }
    const target = start + Math.max(0, video.currentTime || 0);
    if (Math.abs(player.currentTime - target) > 0.3) {
      try { player.currentTime = target; } catch {}
    }
  }

  function toggle(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const player = audio.current;
    if (!player) return;
    if (!player.paused && player.muted) {
      window.dispatchEvent(new CustomEvent(TRACK_PLAY_EVENT, { detail: instanceId }));
      player.muted = false;
      player.volume = 0.85;
      player.play().then(() => {
        setMuted(false);
        setPlaying(true);
      }).catch(pause);
      return;
    }
    if (!player.paused) {
      pause();
      return;
    }
    playTrack({ reset: false, allowMutedFallback: false });
  }

  useEffect(() => {
    const stopOtherTrack = (event) => {
      if (event.detail !== instanceId) pause();
    };
    window.addEventListener(TRACK_PLAY_EVENT, stopOtherTrack);
    return () => window.removeEventListener(TRACK_PLAY_EVENT, stopOtherTrack);
  }, [instanceId, pause]);

  useEffect(() => {
    const node = shell.current?.closest('.entry-media, .entry-textcard')
      || shell.current?.closest('article.entry')
      || shell.current;
    if (!node) return undefined;

    if (!('IntersectionObserver' in window)) {
      inView.current = true;
      playTrack({ reset: true });
      return () => pause();
    }

    const observer = new IntersectionObserver(([entry]) => {
      const active = entry.isIntersecting && entry.intersectionRatio >= 0.58;
      if (active === inView.current) return;
      inView.current = active;
      if (active) playTrack({ reset: true });
      else pause();
    }, { threshold: [0, 0.35, 0.58, 0.85] });
    observer.observe(node);
    return () => {
      observer.disconnect();
      inView.current = false;
      pause();
    };
  }, [pause, playTrack]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) pause();
      else if (inView.current) playTrack({ reset: false });
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [pause, playTrack]);

  useEffect(() => {
    const video = mediaRef?.current;
    const player = audio.current;
    if (!playing || !video || !player) return undefined;
    const onPlay = () => { syncToVideo(); player.play().catch(() => {}); };
    const onPause = () => player.pause();
    const onEnded = () => { player.pause(); setPlaying(false); };
    const onSeek = () => syncToVideo();
    const onTime = () => { if (!video.paused) syncToVideo(); };
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    video.addEventListener('seeked', onSeek);
    video.addEventListener('timeupdate', onTime);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('seeked', onSeek);
      video.removeEventListener('timeupdate', onTime);
    };
  }, [playing, mediaRef, start, duration]);

  function keepInsideClip(event) {
    if (event.currentTarget.currentTime >= end - 0.04) {
      event.currentTarget.pause();
      setPlaying(false);
    }
  }

  const audible = playing && !muted;
  const actionLabel = audible ? 'Pausar trilha' : (playing ? 'Ativar som' : 'Tocar trilha');

  const btn = (
    <button type="button" className={`feed-track-spk${audible ? ' on' : ''}`} onClick={toggle} aria-label={actionLabel} aria-pressed={audible} title={track.title + (track.artist ? ` · ${track.artist}` : '')}>
      {audible ? (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/></svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none"/><path d="m16 9 5 6M21 9l-5 6"/></svg>
      )}
    </button>
  );

  if (float) {
    return (
      <span ref={shell} className={`feed-track-float${hasBar ? ' above-bar' : ''}`}>
        {audible && <span className="feed-track-eq" aria-hidden="true"><i/><i/><i/></span>}
        {btn}
        <audio ref={audio} src={track.audio_url} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onVolumeChange={(event) => setMuted(event.currentTarget.muted)} onTimeUpdate={keepInsideClip} onEnded={() => setPlaying(false)} />
      </span>
    );
  }

  return (
    <div ref={shell} className="feed-track">
      {btn}
      <span className="feed-track-name">{track.title}{track.artist ? ` · ${track.artist}` : ''}</span>
      {audible && <span className="feed-track-eq" aria-hidden="true"><i/><i/><i/></span>}
      <audio ref={audio} src={track.audio_url} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onVolumeChange={(event) => setMuted(event.currentTarget.muted)} onTimeUpdate={keepInsideClip} onEnded={() => setPlaying(false)} />
    </div>
  );
}

// ============================================================
// MÍDIA — a foto e o vídeo mantêm o enquadramento de quem postou
//
// Sem carrossel, não há motivo para cortar tudo em 4:3. Mas os limites
// são DIFERENTES para foto e vídeo, e de propósito:
//
//   FOTO  vai até 4:5. Foto vertical extrema é rara e quase sempre é
//         print de tela — não vale entregar meia tela a um print.
//   VÍDEO vai até 9:16. Vídeo de celular é 9:16 na esmagadora maioria;
//         forçar 4:5 corta 30% da altura, ou seja, corta a pessoa.
//
// O teto de altura (78svh, no CSS) é o que impede o vídeo vertical de
// engolir a tela inteira. Isto aqui não é o TikTok: embaixo do vídeo
// existem os ícones de apoio, e eles são o ponto da rede. Se ninguém
// enxerga o "Estou com você" sem rolar, a rede deixa de acontecer.
// ============================================================
const RATIO_ALTO_FOTO = 4 / 5;    // limite retrato da foto
const RATIO_ALTO_VIDEO = 9 / 16;  // limite retrato do vídeo
const RATIO_LARGO = 16 / 9;       // limite paisagem dos dois
const LIMITE_VERTICAL = 0.85;     // abaixo disso é "vertical" para a legenda

const ehVertical = (r) => r !== null && r !== undefined && r < LIMITE_VERTICAL;

function Media({ photo, video, href, labels, caption, onRatio, children, alt = '' }) {
  // começa em 4:3 (o padrão do CSS) e ajusta assim que sabe o tamanho real
  const [nat, setNat] = useState(null);   // proporção real do arquivo
  const [inteiro, setInteiro] = useState(false); // ver o quadro todo (contain)
  const videoRef = useRef(null);
  const L = labels || {};

  const minimo = video ? (4 / 5) : RATIO_ALTO_FOTO;
  const r = nat ? (video ? (4 / 5) : Math.min(RATIO_LARGO, Math.max(minimo, nat))) : null;
  const style = r ? { aspectRatio: String(r) } : undefined;
  const vertical = ehVertical(r);
  const cortado = !!(nat && r && Math.abs(nat - r) > 0.02);

  useEffect(() => { if (onRatio && r) onRatio(r); }, [r]);

  const conteudo = video ? (
    <video
      ref={videoRef}
      src={comCapa(video)} controls playsInline preload="metadata"
      onLoadedMetadata={(e) => {
        const el = e.target;
        const w = el.videoWidth, h = el.videoHeight;
        if (w && h) setNat(w / h);
        // rede de segurança: se o #t=0.1 não pegou (servidor sem range),
        // um seek manual força o navegador a pintar o primeiro quadro
        try { if (el.currentTime === 0 && el.duration > 0.2) el.currentTime = 0.1; } catch {}
      }}
    />
  ) : (
    <img
      src={photo} alt={alt}
      loading="lazy"
      decoding="async"
      // Imagem que já está em cache termina de carregar ANTES do React
      // pendurar o onLoad — o evento nunca dispara e a foto fica presa na
      // proporção padrão. O ref confere isso no momento em que a tag nasce.
      ref={(el) => {
        if (el && el.complete && el.naturalWidth) setNat(el.naturalWidth / el.naturalHeight);
      }}
      onLoad={(e) => {
        const w = e.target.naturalWidth, h = e.target.naturalHeight;
        if (w && h) setNat(w / h);
      }}
    />
  );

  // botão só no vídeo, e só quando há corte de verdade (ou teto de altura)
  const alternar = video && (cortado || vertical) ? (
    <button
      type="button"
      className="media-fit"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setInteiro((v) => !v); }}
      aria-label={inteiro ? (L.videoFill || 'Preencher') : (L.videoFit || 'Ajustar')}
      title={inteiro ? (L.videoFill || 'Preencher') : (L.videoFit || 'Ajustar')}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {inteiro ? (
          // setas para fora = preencher o quadro
          <><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></>
        ) : (
          // setas para dentro = ver o quadro inteiro
          <><path d="M9 3v6H3" /><path d="M15 21v-6h6" /><path d="M21 3l-6 6" /><path d="M3 21l6-6" /></>
        )}
      </svg>
    </button>
  ) : null;

  // legenda POR CIMA só no vertical: embaixo de um vídeo de 650px ela
  // cairia fora da tela e ninguém leria
  const legenda = video && vertical && caption ? (
    <LegendaSobreposta text={caption} labels={L} />
  ) : null;

  const cls = `entry-media livre${vertical ? ' vertical' : ''}${inteiro ? ' inteiro' : ''}`;

  // vídeo não vira link: o toque é para dar play, não para navegar
  if (href && !video) {
    return <a href={href} className={cls} style={style}>{conteudo}{legenda}{children}</a>;
  }
  const media = <div className={cls} style={style}>{conteudo}{alternar}{legenda}{children}</div>;
  return video ? <MediaPlaybackContext.Provider value={videoRef}>{media}</MediaPlaybackContext.Provider> : media;
}

// ---- Legenda sobre o vídeo vertical, com "ler mais" ----
// Fica ACIMA da barra de controle do vídeo, não em cima dela.
function LegendaSobreposta({ text, labels }) {
  const [aberta, setAberta] = useState(false);
  const longo = text.length > 90;

  return (
    <div className={`media-cap${aberta ? ' aberta' : ''}`} onClick={(e) => e.stopPropagation()}>
      <p className={aberta ? 'expanded' : 'clamp2'}>{text}</p>
      {longo && (
        <button
          type="button"
          className="media-cap-more"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAberta((v) => !v); }}
        >
          {aberta ? (labels.lessText || 'menos') : (labels.moreText || 'ler mais')}
        </button>
      )}
    </div>
  );
}

// ---- Mídia + legenda do item solto do feed ----
// Componente próprio, e não um trecho inline, porque hooks não podem
// morar dentro de um .map(): a ordem mudaria a cada item da lista.
function MidiaComLegenda({ item, labels, cleanText, hasMedia, trackFloat }) {
  const [proporcao, setProporcao] = useState(null);
  const soVideo = !!(item.video_url && !item.photo_url);
  const legendaEmCima = soVideo && ehVertical(proporcao);

  return (
    <>
      <JourneyTitlePill title={item.journey?.title} slug={item.journey?.slug} day={journeyStatusLabel(labels, item.day_number)} />
      {item.photo_url && <Media photo={item.photo_url} alt={textoAlternativo(item.alt, { dia: item.day_number, titulo: item.journey.title }, labels)} href={`/${item.journey.slug}`}>{trackFloat}<VerJornada slug={item.journey.slug} label={labels.seeFullJourney} /></Media>}
      {item.video_url && !item.photo_url && (
        <Media video={item.video_url} labels={labels} caption={cleanText} onRatio={setProporcao}>{trackFloat}</Media>
      )}
      {!hasMedia && !cleanText && item.track && <TrackTag track={item.track} />}
      {cleanText && !legendaEmCima && (
        <div className="dp-text under"><EntryText text={cleanText} labels={labels} limit={100} mencoes={item.mencoes} /></div>
      )}
    </>
  );
}

// ---- Mídia da galeria (post de foto/vídeo solto) ----
function MidiaGaleria({ item, labels }) {
  const [proporcao, setProporcao] = useState(null);
  const legendaEmCima = item.kind === 'video' && ehVertical(proporcao);
  const textualCard = item.kind === 'quote' || item.kind === 'bible';
  const mostrarLegenda = item.caption && item.kind !== 'quote' && !legendaEmCima;
  const trackEl = item.track ? <TrackTag track={item.track} float hasBar={false} /> : null;

  return (
    <>
      {item.kind === 'video'
        ? <Media video={item.url} labels={labels} caption={item.caption} onRatio={setProporcao}>{trackEl}</Media>
        : <Media photo={item.url} alt={textualCard ? (item.caption || '') : ''}>{trackEl}</Media>}
      {mostrarLegenda && (
        <div className="dp-text under"><EntryText text={item.caption} labels={labels} limit={item.kind === 'bible' ? 280 : 100} /></div>
      )}
    </>
  );
}

// ---- Um card por jornada: mostra o dia mais recente. Sem slides. ----
function DayPager({ item, labels, dayLabel }) {
  const [days, setDays] = useState(item.days || []);
  const [proporcao, setProporcao] = useState(null);
  if (!days.length) return null;
  const d = days[days.length - 1];
  const cleanText = textoDaPessoa(d.text);
  const hasMedia = !!(d.photo_url || d.video_url);
  const trackEl = d.track ? <TrackTag key={'t' + d.id} track={d.track} float hasBar={false} /> : null;
  // vídeo vertical leva a legenda por cima; nesse caso ela não se repete embaixo
  const soVideo = !!(d.video_url && !d.photo_url);
  const legendaEmCima = soVideo && ehVertical(proporcao);

  return (
    <>
      {d.closes && d.closes.step && (
        <StepResult decided={d.closes.step} name={(item.owner.name || '').split(' ')[0]} labels={labels.step} />
      )}

      <JourneyTitlePill title={item.journey?.title} slug={item.journey?.slug} day={journeyStatusLabel(labels, d.day_number)} />
      <div className={`dp-stage${hasMedia ? '' : ' is-text'}`}>
        <div className="dp-slide" key={d.id}>
          {hasMedia ? (
            <>
              {d.photo_url && <Media photo={d.photo_url} alt={textoAlternativo(d.alt, { dia: d.day_number, titulo: item.journey.title }, labels)} href={`/${item.journey.slug}`}>{trackEl}<VerJornada slug={item.journey.slug} label={labels.seeFullJourney} /></Media>}
              {d.video_url && !d.photo_url && <Media video={d.video_url} labels={labels} caption={cleanText} onRatio={setProporcao}>{trackEl}</Media>}
            </>
          ) : (
            <a href={`/${item.journey.slug}`} className={`entry-textcard dp-card${cleanText ? '' : ' so-selo'}`}>
              {cleanText
                ? <CardText text={cleanText} labels={labels} mencoes={d.mencoes} />
                : <SeloDoDia kind={d.kind} dia={d.day_number} labels={labels.selo} />}
              {trackEl}
            <VerJornada slug={item.journey.slug} label={labels.seeFullJourney} claro /></a>
          )}
        </div>
      </div>

      {hasMedia && cleanText && !legendaEmCima && (
        <div className="dp-text under">
          <EntryText key={'x' + d.id} text={cleanText} labels={labels} limit={100} mencoes={d.mencoes} />
        </div>
      )}

      {d.nextStep && (
        <StepOpen updateId={d.id} step={d.nextStep} when={d.nextWhen}
          name={(item.owner.name || '').split(' ')[0]} following={d.stepFollowing} own={item.own} labels={labels.step} />
      )}

      <ActionsRow people={item.supporters} title={(labels.supporting || '').replace('{name}', (item.owner.name || '').split(' ')[0])}>
        <EncourageBar key={'e' + d.id} updateId={d.id} initialActive={d.encouraged} labelIdle={labels.supportIdle} labelActive={labels.supportActive} supportersLabel={labels.supporters} supportersLoading={labels.supportersLoading} supportersEmpty={labels.supportersEmpty} closeLabel={labels.popoverClose} />
        <Comments key={'c' + d.id} updateId={d.id} own={item.own} labels={labels.comments} />
        <Percepcao updateId={d.id} toId={item.owner.id} own={item.own} labels={labels.pc} />
        <FeedShare slug={item.journey.slug} title={item.journey.title} label={labels.share} copiedLabel={labels.linkCopied} />
        {item.own && <EditUpdate key={'ed' + d.id} update={{ id: d.id, text: d.text, alt: d.alt, photo_url: d.photo_url, day: d.day_number }} labels={labels.editUpdate}
          onChanged={(patch) => setDays((prev) => patch === null ? prev.filter((x) => x.id !== d.id) : prev.map((x) => x.id === d.id ? { ...x, ...patch } : x))} />}
      </ActionsRow>
    </>
  );
}

// Dia marcado por botão: sem mídia e sem relato humano.
const soSelo = (x) => !x.photo_url && !x.video_url && !textoDaPessoa(x.text);

// ============================================================
// "LER MAIS" — duas linhas exatas, e o "mais" colado nos pontinhos
//
// As duas exigências brigam entre si, e vale registrar por quê:
//
//   · para o "…mais" ficar COLADO no fim do texto, ele tem que
//     estar no fluxo do parágrafo;
//   · para garantir DUAS LINHAS em qualquer largura, o corte
//     natural seria `-webkit-line-clamp`, que conta linha.
//
// Mas o clamp desenha as reticências DELE no fim da linha, e elas
// caem onde o texto acabou — que raramente é a borda. Testado: numa
// coluna de 326px sobrava um vão entre os pontinhos do navegador e
// o botão, e apareciam duas reticências seguidas.
//
// Então o corte é por caractere, mas o limite não é fixo: sai da
// largura medida do elemento. Medi na fonte real do app quantos
// caracteres cabem em duas linhas:
//
//     326px -> 76      358px -> 81      568px -> 140
//
// O que dá cerca de 8,6px por caractere a 16px. A conta abaixo usa
// esse número com ~8% de folga, para uma palavra comprida não
// empurrar a terceira linha.
//
// Um número fixo não serviria: 76 cortaria pela metade no
// computador, e 140 estouraria para três linhas no celular.
// ============================================================
const PX_POR_LETRA = 8.6;   // medido na Fraunces a 16px
const FOLGA = 0.92;

function limitePelaLargura(largura, base) {
  if (!largura) return base;
  const porLinha = largura / PX_POR_LETRA;
  return Math.max(40, Math.floor(porLinha * 2 * FOLGA));
}

function cortar(texto, limite) {
  const s = String(texto || '');
  if (s.length <= limite) return s;
  const bruto = s.slice(0, limite);
  const espaco = bruto.lastIndexOf(' ');
  // só volta até o espaço se isso não comer metade do trecho
  const corte = espaco > limite * 0.6 ? espaco : limite;
  return s.slice(0, corte).replace(/[\s,;:.\-]+$/, '');
}

// O React avisa se `useLayoutEffect` roda no servidor. No servidor
// não existe layout para medir, então lá ele vira o efeito comum.
const useMedirAntesDePintar = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function EntryText({ text, labels, limit = 180, mencoes }) {
  const [expanded, setExpanded] = useState(false);
  const [teto, setTeto] = useState(null);
  const caixa = useRef(null);
  const paragrafo = useRef(null);

  // ------------------------------------------------------------
  // O PALPITE, PELA LARGURA
  //
  // `clientWidth` inclui o PADDING. O `.etx` tem 16px de cada lado
  // no celular, então eu vinha calculando o corte com 32px a mais
  // de largura do que o texto realmente tem — e sobrava caractere
  // suficiente para uma terceira linha. Era este o defeito.
  // ------------------------------------------------------------
  const medir = () => {
    const el = caixa.current;
    if (!el) return;
    const cs = window.getComputedStyle(el);
    const util = el.clientWidth
      - (parseFloat(cs.paddingLeft) || 0)
      - (parseFloat(cs.paddingRight) || 0);
    setTeto(limitePelaLargura(util, limit));
  };

  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    medir();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', medir);
      return () => window.removeEventListener('resize', medir);
    }
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ------------------------------------------------------------
  // A CONFERÊNCIA, PELA ALTURA REAL
  //
  // Estimar por número de caracteres nunca vai ser exato: uma frase
  // de "iiii" e outra de "mmmm" ocupam larguras diferentes com o
  // mesmo tamanho. Por isso, depois de pintar, o próprio parágrafo
  // é medido: se passou de duas linhas, o teto encolhe 8% e ele
  // tenta de novo.
  //
  // Converge em uma ou duas voltas e vale para qualquer fonte,
  // qualquer idioma e qualquer largura — sem eu precisar acertar
  // uma constante de largura de letra.
  //
  // `useLayoutEffect` roda ANTES da pintura, então o ajuste não
  // pisca na tela.
  // ------------------------------------------------------------
  useMedirAntesDePintar(() => {
    if (expanded || teto == null) return;
    const p = paragrafo.current;
    if (!p) return;
    const lh = parseFloat(window.getComputedStyle(p).lineHeight) || 25;
    const limiteDeAltura = lh * 2 + 2;          // duas linhas, com 2px de perdão
    if (p.scrollHeight > limiteDeAltura && teto > 24) {
      setTeto((t) => Math.max(24, Math.floor(t * 0.92)));
    }
  });

  const alvo = teto == null ? limit : teto;
  const compact = text.length > alvo;

  if (compact && !expanded) {
    return (
      <div className="etx" ref={caixa}>
        <p className="entry-text" ref={paragrafo}>
          <TextoComMencoes texto={cortar(text, alvo)} porHandle={mencoes} />
          <button type="button" className="etx-more" onClick={() => setExpanded(true)}>
            <span aria-hidden="true">…</span>{labels.moreText}
          </button>
        </p>
      </div>
    );
  }
  return (
    <div className="etx" ref={caixa}>
      <p className="entry-text expanded"><TextoComMencoes texto={text} porHandle={mencoes} /></p>
      {compact && (
        <button type="button" className="entry-expand" onClick={() => setExpanded(false)}>
          {labels.lessText}
        </button>
      )}
    </div>
  );
}

// ---- Fileira de ações + "Apoiando Fulano" no fim da mesma linha ----
function ActionsRow({ children, people, title }) {
  const [open, setOpen] = useState(false);
  const has = !!(people && people.length);
  return (
    <>
      <div className="entry-actions feed-acts">
        {children}
        {has && (
          <button type="button" className={`sl-title${open ? ' on' : ''}`} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            <span className="sl-text">{title}</span>
            <svg className="sl-chev" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="butt" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </button>
        )}
      </div>
      {has && open && (
        <div className="sl-people">
          {people.map((p, idx) => {
            const first = (p.name || '?').split(' ')[0];
            const inner = (
              <>
                <span className="sl-ava" style={{ background: p.avatar_color || 'var(--muted)' }}>
                  {p.avatar_url ? <img src={p.avatar_url} alt="" draggable="false" /> : first[0]}
                </span>
                <span className="sl-name" title={p.name}>{first}</span>
              </>
            );
            return p.handle
              ? <a key={idx} href={`/${p.handle}`} className="sl-person" title={p.name}>{inner}</a>
              : <span key={idx} className="sl-person" title={p.name}>{inner}</span>;
          })}
        </div>
      )}
    </>
  );
}

// ---- Texto do card sem foto: recorta e deixa abrir por inteiro ----
function CardText({ text, labels, mencoes }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 260;
  const cls = text.length > 140 ? ' long' : (text.length < 70 ? ' short' : '');
  return (
    <>
      <p className={`dpc-text${cls}${open ? ' open' : ''}`}>
        <TextoComMencoes texto={text} porHandle={mencoes} />
      </p>
      {long && (
        <button type="button" className="dpc-more"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}>
          {open ? labels.lessText : labels.moreText}
        </button>
      )}
    </>
  );
}

function DemoActions({ item, labels }) {
  const [liked, setLiked] = useState(false);
  const [showC, setShowC] = useState(false);
  const samples = labels.comments.samples || [];
  const commenters = (item.supporters || []).slice(0, 3);
  return (
    <>
    <div className="entry-actions feed-acts">
      <button type="button" className={`support-pill${liked ? ' on' : ''}`} onClick={() => setLiked((v) => !v)} aria-label={labels.supportIdle}>
        <svg className="sp-heart" viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1 7.8 7.8 7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        <span className="action-label">{labels.supportIdle}</span>
      </button>
      <button type="button" className="comment-toggle" aria-label={labels.comments.comment} onClick={() => setShowC((v) => !v)}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12 7.6L3 21l1.9-5.7A8.4 8.4 0 1 1 21 11.5z"/></svg>
        <span className="action-label">{labels.comments.comment}</span>
      </button>
      <FeedShare slug={item.journey.slug} title={item.journey.title} label={labels.share} copiedLabel={labels.linkCopied} />
    </div>
    {showC && (
      <div className="comment-panel">
        {commenters.length ? commenters.map((p, i) => (
          <div className="cmt" key={i}>
            <span className="cmt-ava" style={{ background: p.avatar_color || 'var(--muted)' }}>{p.avatar_url ? <img src={p.avatar_url} alt="" /> : (p.name || '?')[0]}</span>
            <div className="cmt-body"><b>{(p.name || '').split(' ')[0]}</b> {samples[i % (samples.length || 1)]}</div>
          </div>
        )) : <p className="comment-empty">{labels.comments.empty}</p>}
      </div>
    )}
    </>
  );
}

export default function FeedClient({ labels }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const [scope, setScope] = useState('all');
  const [kind, setKind] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const sentinel = useRef(null);
  const offsetRef = useRef(0);
  const doneRef = useRef(false);
  const scopeRef = useRef('all');
  const busy = useRef(false);
  const [suggestions, setSuggestions] = useState([]);
  const [momentos, setMomentos] = useState({ transformacoes: [], amanha: [], retornos: [], recomendacoes: [] });
  const [andamento, setAndamento] = useState([]);
  const [needs, setNeeds] = useState([]);
  useEffect(() => {
    function onProfileUpdated(e) {
      const { userId, avatar_url } = e.detail || {};
      if (!userId || !avatar_url) return;
      setItems((prev) => prev.map((item) => item.owner?.id === userId
        ? { ...item, owner: { ...item.owner, avatar_url } }
        : item));
    }
    function onUpdateUpdated(e) {
      const patch = e.detail || {};
      if (!patch.id) return;
      setItems((prev) => prev.map((item) => {
        if (item.id === patch.id) return { ...item, ...patch };
        if (!item.days) return item;
        return { ...item, days: item.days.map((day) => day.id === patch.id ? { ...day, ...patch } : day) };
      }));
    }
    window.addEventListener('oud:profile-updated', onProfileUpdated);
    window.addEventListener('oud:update-updated', onUpdateUpdated);
    return () => {
      window.removeEventListener('oud:profile-updated', onProfileUpdated);
      window.removeEventListener('oud:update-updated', onUpdateUpdated);
    };
  }, []);
  useEffect(() => { fetch('/api/needs').then((r) => r.json()).then((j) => setNeeds(j.people || [])).catch(() => {}); }, []);
  useEffect(() => { fetch('/api/suggestions').then((r) => r.json()).then((j) => setSuggestions(j.people || [])).catch(() => {}); }, []);
  useEffect(() => { fetch('/api/eco', { method: 'POST' }).catch(() => {}); }, []);
  useEffect(() => { fetch('/api/andamento').then((r) => r.json()).then((j) => setAndamento(j.andamento || [])).catch(() => {}); }, []);
  useEffect(() => { fetch('/api/momentos').then((r) => r.json()).then((j) => setMomentos({ transformacoes: j.transformacoes || [], amanha: j.amanha || [], retornos: j.retornos || [], recomendacoes: j.recomendacoes || [] })).catch(() => {}); }, []);

  async function load() {
    if (busy.current || doneRef.current) return;
    busy.current = true;
    setLoading(true);
    try {
      const response = await fetch(`/api/feed?offset=${offsetRef.current}&scope=${scopeRef.current}&kind=${encodeURIComponent(kind)}`);
      const data = await response.json();
      const batch = data.items || [];
      setItems((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        return [...prev, ...batch.filter((item) => !seen.has(item.id))];
      });
      offsetRef.current += batch.length;
      if (batch.length < 8) {
        doneRef.current = true;
        setDone(true);
      }
    } catch {}
    setLoading(false);
    setStarted(true);
    busy.current = false;
  }

  function resetFeed(nextScope, nextKind = kind) {
    scopeRef.current = nextScope;
    offsetRef.current = 0;
    doneRef.current = false;
    busy.current = false;
    setItems([]);
    setDone(false);
    setStarted(false);
    if (nextKind !== kind) setKind(nextKind);
  }

  function switchScope(nextScope) {
    if (nextScope === scopeRef.current) return;
    setScope(nextScope);
    resetFeed(nextScope);
  }

  function switchKind(nextKind) {
    if (nextKind === kind) return;
    setFilterOpen(false);
    resetFeed(scopeRef.current, nextKind);
    setKind(nextKind);
  }

  useEffect(() => {
    load();
  }, [kind]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) load();
    }, { rootMargin: '120px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [done, scope]);

  const dayLabel = (day) => labels.dayShort.replace('{d}', day);
  const emptyTitle = scope === 'following' ? labels.followingEmptyTitle : labels.inviteTitle;
  const emptySub = scope === 'following' ? labels.followingEmptySub : labels.inviteSub;

  return (
    <>
      <Andamento itens={andamento} labels={labels.an} />

      <div className="feed-tabs">
        <button className={scope === 'all' ? 'on' : ''} onClick={() => switchScope('all')}>{labels.tabAll}</button>
        <button className={scope === 'following' ? 'on' : ''} onClick={() => switchScope('following')}>{labels.tabFollowing}</button>
        <button type="button" className={`focus-toggle${focusMode ? ' on' : ''}`} onClick={() => setFocusMode((v) => !v)} aria-pressed={focusMode}>
          {focusMode ? (labels.focusFree || 'Free feed') : (labels.focusPresence || 'Presence mode')}
        </button>
      </div>

      <section id="feed" className={`feed-stream${focusMode ? ' focus-mode' : ''}`}>
        {started && items.length === 0 && (
          <div className="feed-invite">
            <LoopMarca size={132} />
            <b>{emptyTitle}</b>
            <p>{emptySub}</p>
            <a className="cta grow" href="/explore">{labels.inviteCta}</a>
          </div>
        )}

        {items.map((item, idx) => (
          <Fragment key={item.id}>
          {item.media ? (
          <article className={`entry entry-photo${item.kind === 'quote' ? ' entry-quote' : ''}${item.kind === 'bible' ? ' entry-quote entry-bible' : ''}`}>
            <a className="entry-head" href={`/${item.owner.handle || ''}`}>
              <span className={avatarMoodClass(item.owner)} style={avatarMoodStyle(item.owner)}>
                {item.owner.avatar_url ? <img src={item.owner.avatar_url} alt="" /> : (item.owner.name || '?')[0]}
              </span>
              <span className="entry-id"><b>{item.owner.name}<OneLevel level={item.owner.one_level} labels={labels} /></b>{item.kind === 'quote' && labels.quoteLabel && <small className="entry-media-kind">{labels.quoteLabel.replace('{name}', item.owner.name || '')}</small>}{item.kind === 'bible' && labels.bibleLabel && <small className="entry-media-kind">{labels.bibleLabel.replace('{name}', item.owner.name || '')}</small>}<MoodLine mood={item.owner.mood} labels={labels} /></span>
            </a>
            <MidiaGaleria item={item} labels={labels} />
            <div className="entry-actions feed-acts">
              <EncourageBar mediaId={item.mediaId} initialActive={item.encouraged} labelIdle={labels.supportIdle} labelActive={labels.supportActive} supportersLabel={labels.supporters} supportersLoading={labels.supportersLoading} supportersEmpty={labels.supportersEmpty} closeLabel={labels.popoverClose} />
              <Comments mediaId={item.mediaId} labels={labels.comments} />
              <FeedShare slug={item.owner.handle || ''} title={item.owner.name} label={labels.share} copiedLabel={labels.linkCopied} />
            </div>
          </article>
          ) : (
          <article className={`entry ${item.kind || 'step'}${item.demo ? ' is-demo' : ''}`}>
            <div className="entry-head">
              <a className="entry-person" href={`/${item.owner.handle || item.journey.slug}`}>
                <span className={avatarMoodClass(item.owner)} style={avatarMoodStyle(item.owner)}>
                  {item.owner.avatar_url ? <img src={item.owner.avatar_url} alt="" /> : (item.owner.name || '?')[0]}
                </span>
                <span className="entry-id">
                  <b>{item.owner.name}<OneLevel level={item.owner.one_level} labels={labels} />{item.historia && <span className="hist-selo">{labels.histSelo}</span>}</b>
                  <MoodLine mood={item.owner.mood} labels={labels} />
                </span>
              </a>
              {item.owner.id && !item.own && <FollowUserButton profileId={item.owner.id} labelFollow={labels.follow} labelFollowing={labels.following} labelBack={labels.followBack} />}
              {item.own && !item.demo && !item.days && <EditUpdate update={{ id: item.id, text: item.text, alt: item.alt, photo_url: item.photo_url, day: item.day_number }} labels={labels.editUpdate}
                onChanged={(patch) => setItems((prev) => patch === null ? prev.filter((x) => x.id !== item.id) : prev.map((x) => x.id === item.id ? { ...x, ...patch } : x))} />}
            </div>
            {item.days && !item.demo ? (
              <DayPager item={item} labels={labels} dayLabel={dayLabel} />
            ) : (
            <>
            {item.closes && item.closes.step && (
              <StepResult decided={item.closes.step} name={(item.owner.name || '').split(' ')[0]} labels={labels.step} />
            )}
            {item.comeback && <div className="entry-comeback">{(labels.comebackFmt || '').replace('{d}', item.comeback)}</div>}
            {/* Quando o dia só tem selo, o selo já diz o que a linha diria.
                Duas etiquetas para o mesmo fato, empilhadas, viram ruído. */}
            {item.kind === 'setback' && !soSelo(item) && <div className="entry-kindline setback">{labels.tagSetback}</div>}
            {item.kind === 'win' && !soSelo(item) && <div className="entry-kindline win">{labels.tagWin}</div>}
            {[7, 30, 60, 100].includes(item.day_number) && <div className="entry-milestone">{(labels.milestoneFmt || '').replace('{d}', item.day_number)}</div>}

            {(() => {
              const hasMedia = !!(item.photo_url || item.video_url);
              const cleanText = textoDaPessoa(item.text);
              // ============================================================
              // A BARRA DE PROGRESSO ENTROU NO CARD
              //
              // Ela vivia FORA, entre o card e os ícones, ocupando 36px de
              // altura. Num celular de 840px o post inteiro dava 780 e a
              // pílula do rodapé come 58: cabia por 2px. Qualquer linha a
              // mais — um marco, um retorno, o próximo passo — derrubava.
              //
              // Sobre a foto ela não custa altura nenhuma. E some uma
              // repetição: o cabeçalho do post já diz a jornada e o dia,
              // então a linha "Dia 7 · faltam 23" dizia de novo o que já
              // estava dito dois dedos acima. Fica a barra e a
              // porcentagem, que são a informação que ainda não existia.
              //
              // Sem foto não há onde sobrepor — e nem precisa: esses
              // cartões são curtos. Lá a barra continua embaixo, com a
              // linha inteira.
              // ============================================================
              const trackFloat = item.track ? <TrackTag track={item.track} float hasBar={false} /> : null;
              if (!hasMedia) {
                // Sem mídia e sem relato: o dia foi marcado por botão.
                // O cartão continua existindo — apagar o registro seria
                // apagar o dia — mas mostra selo, não frase.
                return (
                  <>
                    <JourneyTitlePill title={item.journey?.title} slug={item.journey?.slug} day={journeyStatusLabel(labels, item.day_number)} />
                    <a href={`/${item.journey.slug}`} className={`entry-textcard dp-card${cleanText ? '' : ' so-selo'}`}>
                      {cleanText
                        ? <CardText text={cleanText} labels={labels} mencoes={item.mencoes} />
                        : <SeloDoDia kind={item.kind} dia={item.day_number} labels={labels.selo} />}
                      {trackFloat}
                      <VerJornada slug={item.journey.slug} label={labels.seeFullJourney} claro />
                    </a>
                  </>
                );
              }
              return (
              <MidiaComLegenda item={item} labels={labels} cleanText={cleanText}
                  hasMedia={hasMedia} trackFloat={trackFloat} />
              );
            })()}

            {item.nextStep && (
              <StepOpen updateId={item.id} step={item.nextStep} when={item.nextWhen}
                name={(item.owner.name || '').split(' ')[0]} following={item.stepFollowing} own={item.own} labels={labels.step} />
            )}
            {/* A revelacao vem depois do dia 7, que e o que o feed mostra:
                a pessoa le a historia inteira e so entao descobre o convite. */}
            {item.historia && (
              <a className="hist-reveal" href="/new">
                <b>{labels.histTitle}</b>
                <span>{labels.histSub}</span>
                <em>{labels.histCta}</em>
              </a>
            )}

            {item.demo ? (
              <DemoActions item={item} labels={labels} />
            ) : (
              <ActionsRow people={item.supporters} title={(labels.supporting || '').replace('{name}', (item.owner.name || '').split(' ')[0])}>
                <EncourageBar updateId={item.id} initialActive={item.encouraged} labelIdle={labels.supportIdle} labelActive={labels.supportActive} supportersLabel={labels.supporters} supportersLoading={labels.supportersLoading} supportersEmpty={labels.supportersEmpty} closeLabel={labels.popoverClose} />
                <Comments updateId={item.id} own={item.own} labels={labels.comments} />
                <Percepcao updateId={item.id} toId={item.owner.id} own={item.own} labels={labels.pc} />
                <FeedShare slug={item.journey.slug} title={item.journey.title} label={labels.share} copiedLabel={labels.linkCopied} />
              </ActionsRow>
            )}
            </>
            )}
          </article>
          )}
          {idx === 0 && momentos.amanha.length > 0 && (
            <Amanha people={momentos.amanha} labels={labels.amanha} />
          )}
          {idx === 1 && needs.length > 0 && (
            <NeedsSupport people={needs} labels={labels.needs} />
          )}
          {idx === (needs.length > 0 ? 2 : 1) && momentos.recomendacoes[0] && (
            <UpiRecommendation item={momentos.recomendacoes[0]} labels={labels.upiRecommendation} />
          )}
          {idx === 2 && momentos.transformacoes[0] && (
            <Transformacao item={momentos.transformacoes[0]} labels={labels.transf} />
          )}
          {idx === 3 && (
            <Espelho inFeed labels={labels.esp} />
          )}
          {idx === 3 && momentos.retornos.length > 0 && (
            <Retornos people={momentos.retornos} labels={labels.retornos} />
          )}
          {idx === 4 && suggestions.length > 0 && (
            <SuggestionCard people={suggestions} labels={labels.suggest} />
          )}
          {idx === 6 && momentos.transformacoes[1] && (
            <Transformacao item={momentos.transformacoes[1]} labels={labels.transf} />
          )}
          </Fragment>
        ))}

        {items.length > 0 && items.length < 2 && needs.length > 0 && (
          <NeedsSupport people={needs} labels={labels.needs} />
        )}
        {items.length > 0 && items.length < 5 && suggestions.length > 0 && (
          <SuggestionCard people={suggestions} labels={labels.suggest} />
        )}
        {items.length > 0 && (items.length < 2 || (needs.length > 0 && items.length < 3)) && momentos.recomendacoes[0] && (
          <UpiRecommendation item={momentos.recomendacoes[0]} labels={labels.upiRecommendation} />
        )}
        {items.length < 3 && momentos.amanha.length > 0 && (
          <Amanha people={momentos.amanha} labels={labels.amanha} />
        )}
        {items.length < 3 && momentos.transformacoes[0] && (
          <Transformacao item={momentos.transformacoes[0]} labels={labels.transf} />
        )}
        {items.length < 4 && momentos.retornos.length > 0 && (
          <Retornos people={momentos.retornos} labels={labels.retornos} />
        )}

        {!done && <div ref={sentinel} className="feed-sentinel">{loading ? labels.loading : ''}</div>}
      </section>
    </>
  );
}
