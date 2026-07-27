'use client';
import { useEffect, useRef, useState, Fragment } from 'react';
import EncourageBar from '../[slug]/EncourageBar';
import FeedShare from './FeedShare';
import Comments from '../../components/Comments';
import SuggestionCard from '../../components/SuggestionCard';
import NeedsSupport from '../../components/NeedsSupport';
import EditUpdate from '../../components/EditUpdate';
import ChallengeStrip from '../../components/ChallengeStrip';
import ChallengeButton from '../../components/ChallengeButton';
import Transformacao from '../../components/Transformacao';
import Amanha from '../../components/Amanha';
import SeloDoDia from '../../components/SeloDoDia';
import { textoDaPessoa } from '../../lib/registro';
import { textoAlternativo } from '../../lib/alt';
import Retornos from '../../components/Retornos';
import { StepOpen, StepResult } from '../../components/StepChapter';
import Percepcao from '../../components/Percepcao';
import Andamento, { Hoje } from '../../components/Andamento';
import Espelho from '../../components/Espelho';
import LoopMarca from '../../components/LoopMarca';
import { MOODS, moodGlow } from '../../lib/moods';
import { comCapa } from '../../lib/media';
import FollowUserButton from '../[slug]/FollowUserButton';


function TrackTag({ track, float, hasBar }) {
  const [playing, setPlaying] = useState(false);
  const audio = useRef(null);

  function toggle(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!audio.current) return;
    if (playing) {
      audio.current.pause();
      setPlaying(false);
    } else {
      audio.current.play().catch(() => {});
      setPlaying(true);
    }
  }

  const btn = (
    <button type="button" className={`feed-track-spk${playing ? ' on' : ''}`} onClick={toggle} aria-label={playing ? 'pausar' : 'tocar'} title={track.title + (track.artist ? ` · ${track.artist}` : '')}>
      {playing ? (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/></svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none"/><path d="m16 9 5 6M21 9l-5 6"/></svg>
      )}
    </button>
  );

  if (float) {
    return (
      <span className={`feed-track-float${hasBar ? ' above-bar' : ''}`}>
        {playing && <span className="feed-track-eq" aria-hidden="true"><i/><i/><i/></span>}
        {btn}
        <audio ref={audio} src={track.audio_url} onEnded={() => setPlaying(false)} />
      </span>
    );
  }

  return (
    <div className="feed-track">
      {btn}
      <span className="feed-track-name">{track.title}{track.artist ? ` · ${track.artist}` : ''}</span>
      {playing && <span className="feed-track-eq" aria-hidden="true"><i/><i/><i/></span>}
      <audio ref={audio} src={track.audio_url} onEnded={() => setPlaying(false)} />
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
  const L = labels || {};

  const minimo = video ? RATIO_ALTO_VIDEO : RATIO_ALTO_FOTO;
  const r = nat ? Math.min(RATIO_LARGO, Math.max(minimo, nat)) : null;
  const style = r ? { aspectRatio: String(r) } : undefined;
  const vertical = ehVertical(r);
  const cortado = !!(nat && r && Math.abs(nat - r) > 0.02);

  useEffect(() => { if (onRatio && r) onRatio(r); }, [r]);

  const conteudo = video ? (
    <video
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
  return <div className={cls} style={style}>{conteudo}{alternar}{legenda}{children}</div>;
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
      {item.photo_url && <Media photo={item.photo_url} alt={textoAlternativo(item.alt, { dia: item.day_number, titulo: item.journey.title }, labels)} href={`/${item.journey.slug}`}>{trackFloat}</Media>}
      {item.video_url && !item.photo_url && (
        <Media video={item.video_url} labels={labels} caption={cleanText} onRatio={setProporcao}>{trackFloat}</Media>
      )}
      {!hasMedia && !cleanText && item.track && <TrackTag track={item.track} />}
      {cleanText && !legendaEmCima && (
        <div className="dp-text under"><EntryText text={cleanText} labels={labels} limit={100} /></div>
      )}
    </>
  );
}

// ---- Mídia da galeria (post de foto/vídeo solto) ----
function MidiaGaleria({ item, labels }) {
  const [proporcao, setProporcao] = useState(null);
  const legendaEmCima = item.kind === 'video' && ehVertical(proporcao);

  return (
    <>
      {item.kind === 'video'
        ? <Media video={item.url} labels={labels} caption={item.caption} onRatio={setProporcao} />
        : <Media photo={item.url} alt={item.kind === 'quote' ? (item.caption || '') : ''} />}
      {item.caption && !legendaEmCima && (
        <div className="dp-text under"><EntryText text={item.caption} labels={labels} limit={100} /></div>
      )}
    </>
  );
}

// ---- Um card por jornada: mostra o dia mais recente. Sem slides. ----
function DayPager({ item, labels, dayLabel, dark }) {
  const [days, setDays] = useState(item.days || []);
  const [proporcao, setProporcao] = useState(null);
  if (!days.length) return null;
  const d = days[days.length - 1];
  const total = item.journey.total_days || 0;
  const pct = total ? Math.min(100, Math.max(3, Math.round(((d.day_number || 0) / total) * 100))) : 0;
  const left = Math.max(0, total - (d.day_number || 0));
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

      <div className={`dp-stage${hasMedia ? '' : ' is-text'}`}>
        <div className="dp-slide" key={d.id}>
          {hasMedia ? (
            <>
              {d.photo_url && <Media photo={d.photo_url} alt={textoAlternativo(d.alt, { dia: d.day_number, titulo: item.journey.title }, labels)} href={`/${item.journey.slug}`}>{trackEl}</Media>}
              {d.video_url && !d.photo_url && <Media video={d.video_url} labels={labels} caption={cleanText} onRatio={setProporcao}>{trackEl}</Media>}
            </>
          ) : (
            <a href={`/${item.journey.slug}`} className={`entry-textcard dp-card${dark ? ' dark' : ''}${cleanText ? '' : ' so-selo'}`}>
              {cleanText
                ? <CardText text={cleanText} labels={labels} />
                : <SeloDoDia kind={d.kind} dia={d.day_number} labels={labels.selo} />}
              {trackEl}
            </a>
          )}
        </div>
      </div>

      {hasMedia && cleanText && !legendaEmCima && (
        <div className="dp-text under">
          <EntryText key={'x' + d.id} text={cleanText} labels={labels} limit={100} />
        </div>
      )}

      {total > 0 && (
        <div className="progress-under" aria-hidden="true">
          <div className="mp-bar"><span style={{ width: pct + '%' }} /></div>
          <div className="mp-meta">
            <span>{(labels.progressFmt || '').replace('{d}', d.day_number).replace('{r}', left)}</span>
            <span className="mp-pct">{pct}%</span>
          </div>
        </div>
      )}

      {d.nextStep && (
        <StepOpen updateId={d.id} step={d.nextStep} when={d.nextWhen}
          name={(item.owner.name || '').split(' ')[0]} following={d.stepFollowing} own={item.own} labels={labels.step} />
      )}

      <ActionsRow people={item.supporters} title={(labels.supporting || '').replace('{name}', (item.owner.name || '').split(' ')[0])}>
        <EncourageBar key={'e' + d.id} updateId={d.id} initialActive={d.encouraged} labelIdle={labels.supportIdle} labelActive={labels.supportActive} supportersLabel={labels.supporters} supportersLoading={labels.supportersLoading} supportersEmpty={labels.supportersEmpty} />
        <Comments key={'c' + d.id} updateId={d.id} own={item.own} labels={labels.comments} />
        <Percepcao updateId={d.id} toId={item.owner.id} own={item.own} labels={labels.pc} />
        <FeedShare slug={item.journey.slug} title={item.journey.title} label={labels.share} copiedLabel={labels.linkCopied} />
        {item.challengeable && labels.ch && <ChallengeButton icon toId={item.owner.id} toName={item.owner.name} labels={labels.ch} />}
        {item.own && <EditUpdate key={'ed' + d.id} update={{ id: d.id, text: d.text, alt: d.alt, photo_url: d.photo_url, day: d.day_number }} labels={labels.editUpdate}
          onChanged={(patch) => setDays((prev) => patch === null ? prev.filter((x) => x.id !== d.id) : prev.map((x) => x.id === d.id ? { ...x, ...patch } : x))} />}
      </ActionsRow>
    </>
  );
}

// Dia marcado por botão: sem mídia e sem relato humano.
const soSelo = (x) => !x.photo_url && !x.video_url && !textoDaPessoa(x.text);

function EntryText({ text, labels, limit = 180 }) {
  const [expanded, setExpanded] = useState(false);
  const compact = text.length > limit;

  // O "ler mais" flutua no fim da 2ª linha. Precisa ficar FORA do
  // bloco recortado — senão o próprio recorte o esconde junto do texto.
  if (compact && !expanded) {
    return (
      <div className="etx">
        <p className="entry-text clamp2">{text}</p>
        <button type="button" className="etx-more" onClick={() => setExpanded(true)}>
          {labels.moreText}
        </button>
      </div>
    );
  }
  return (
    <div className="etx">
      <p className="entry-text expanded">{text}</p>
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
function CardText({ text, labels }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 260;
  const cls = text.length > 140 ? ' long' : (text.length < 70 ? ' short' : '');
  return (
    <>
      <p className={`dpc-text${cls}${open ? ' open' : ''}`}>{text}</p>
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
  const sentinel = useRef(null);
  const offsetRef = useRef(0);
  const doneRef = useRef(false);
  const scopeRef = useRef('all');
  const busy = useRef(false);
  const [suggestions, setSuggestions] = useState([]);
  const [momentos, setMomentos] = useState({ transformacoes: [], amanha: [], retornos: [] });
  const [andamento, setAndamento] = useState([]);
  const [hoje, setHoje] = useState(null);
  const [needs, setNeeds] = useState([]);
  useEffect(() => { fetch('/api/needs').then((r) => r.json()).then((j) => setNeeds(j.people || [])).catch(() => {}); }, []);
  useEffect(() => { fetch('/api/suggestions').then((r) => r.json()).then((j) => setSuggestions(j.people || [])).catch(() => {}); }, []);
  useEffect(() => { fetch('/api/eco', { method: 'POST' }).catch(() => {}); }, []);
  useEffect(() => { fetch('/api/andamento').then((r) => r.json()).then((j) => { setAndamento(j.andamento || []); setHoje(j.hoje || null); }).catch(() => {}); }, []);
  useEffect(() => { fetch('/api/momentos').then((r) => r.json()).then((j) => setMomentos({ transformacoes: j.transformacoes || [], amanha: j.amanha || [], retornos: j.retornos || [] })).catch(() => {}); }, []);

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
      <Hoje dado={hoje} nome={labels.meuNome} labels={labels.hj} />
      <Andamento itens={andamento} labels={labels.an} />

      <div className="feed-tabs">
        <button className={scope === 'all' ? 'on' : ''} onClick={() => switchScope('all')}>{labels.tabAll}</button>
        <button className={scope === 'following' ? 'on' : ''} onClick={() => switchScope('following')}>{labels.tabFollowing}</button>
      </div>

      <section className="feed-stream">
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
          <article className="entry entry-photo">
            <a className="entry-head" href={`/${item.owner.handle || ''}`}>
              <span className="entry-ava" style={{ background: item.owner.avatar_color || 'var(--orange)' }}>
                {item.owner.avatar_url ? <img src={item.owner.avatar_url} alt="" /> : (item.owner.name || '?')[0]}
              </span>
              <span className="entry-id"><b>{item.owner.name}</b></span>
            </a>
            <MidiaGaleria item={item} labels={labels} />
            <div className="entry-actions feed-acts">
              <EncourageBar mediaId={item.mediaId} initialActive={item.encouraged} labelIdle={labels.supportIdle} labelActive={labels.supportActive} supportersLabel={labels.supporters} supportersLoading={labels.supportersLoading} supportersEmpty={labels.supportersEmpty} />
              <Comments mediaId={item.mediaId} labels={labels.comments} />
              <FeedShare slug={item.owner.handle || ''} title={item.owner.name} label={labels.share} copiedLabel={labels.linkCopied} />
              {item.challengeable && labels.ch && <ChallengeButton icon toId={item.owner.id} toName={item.owner.name} labels={labels.ch} />}
            </div>
            {item.challenge && <ChallengeStrip challenge={item.challenge} labels={labels.ch} />}
          </article>
          ) : (
          <article className={`entry ${item.kind || 'step'}${item.demo ? ' is-demo' : ''}`}>
            <div className="entry-head">
              <a className="entry-person" href={`/${item.owner.handle || item.journey.slug}`}>
                <span className="entry-ava" style={{ background: item.owner.avatar_color || 'var(--orange)', ...(item.owner.mood && MOODS[item.owner.mood] ? { boxShadow: moodGlow(MOODS[item.owner.mood]) } : {}) }}>
                  {item.owner.avatar_url ? <img src={item.owner.avatar_url} alt="" /> : (item.owner.name || '?')[0]}
                </span>
                <span className="entry-id">
                  <b>{item.owner.name}{item.historia && <span className="hist-selo">{labels.histSelo}</span>}{item.owner.mood && (labels.moods || {})[item.owner.mood] && <span className="entry-mood" style={{ color: MOODS[item.owner.mood] }}> · {labels.moods[item.owner.mood]}</span>}</b>
                  <small><span className="entry-journey">{item.journey.title}</span> · {dayLabel(item.day_number)}</small>
                </span>
              </a>
              {item.owner.id && !item.own && <FollowUserButton profileId={item.owner.id} labelFollow={labels.follow} labelFollowing={labels.following} labelBack={labels.followBack} />}
              {item.own && !item.demo && !item.days && <EditUpdate update={{ id: item.id, text: item.text, alt: item.alt, photo_url: item.photo_url, day: item.day_number }} labels={labels.editUpdate}
                onChanged={(patch) => setItems((prev) => patch === null ? prev.filter((x) => x.id !== item.id) : prev.map((x) => x.id === item.id ? { ...x, ...patch } : x))} />}
            </div>
            {item.days && !item.demo ? (
              <DayPager item={item} labels={labels} dayLabel={dayLabel} dark={idx % 3 === 2} />
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
              const total = item.journey.total_days || 0;
              const day = item.journey.current_day || 0;
              const pct = total ? Math.min(100, Math.max(3, item.journey.progress_pct || Math.round((day / total) * 100))) : 0;
              const left = Math.max(0, total - day);
              // a barra vive FORA do card, entre ele e os ícones
              const progressEl = total > 0 ? (
                <div className="progress-under" aria-hidden="true">
                  <div className="mp-bar"><span style={{ width: pct + '%' }} /></div>
                  <div className="mp-meta">
                    <span>{(labels.progressFmt || '').replace('{d}', day).replace('{r}', left)}</span>
                    <span className="mp-pct">{pct}%</span>
                  </div>
                </div>
              ) : null;
              const trackFloat = item.track ? <TrackTag track={item.track} float hasBar={false} /> : null;
              if (!hasMedia) {
                // Sem mídia e sem relato: o dia foi marcado por botão.
                // O cartão continua existindo — apagar o registro seria
                // apagar o dia — mas mostra selo, não frase.
                return (
                  <>
                    <a href={`/${item.journey.slug}`} className={`entry-textcard dp-card${cleanText ? '' : ' so-selo'}`}>
                      {cleanText
                        ? <CardText text={cleanText} labels={labels} />
                        : <SeloDoDia kind={item.kind} dia={item.day_number} labels={labels.selo} />}
                      {trackFloat}
                    </a>
                    {progressEl}
                  </>
                );
              }
              return (
                <>
                  <MidiaComLegenda item={item} labels={labels} cleanText={cleanText}
                    hasMedia={hasMedia} trackFloat={trackFloat} />
                  {progressEl}
                </>
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
                <EncourageBar updateId={item.id} initialActive={item.encouraged} labelIdle={labels.supportIdle} labelActive={labels.supportActive} supportersLabel={labels.supporters} supportersLoading={labels.supportersLoading} supportersEmpty={labels.supportersEmpty} />
                <Comments updateId={item.id} own={item.own} labels={labels.comments} />
                <Percepcao updateId={item.id} toId={item.owner.id} own={item.own} labels={labels.pc} />
                <FeedShare slug={item.journey.slug} title={item.journey.title} label={labels.share} copiedLabel={labels.linkCopied} />
                {item.challengeable && labels.ch && <ChallengeButton icon toId={item.owner.id} toName={item.owner.name} labels={labels.ch} />}
              </ActionsRow>
            )}
            </>
            )}
            {item.challenge && !item.demo && <ChallengeStrip challenge={item.challenge} labels={labels.ch} />}
          </article>
          )}
          {idx === 0 && momentos.amanha.length > 0 && (
            <Amanha people={momentos.amanha} labels={labels.amanha} />
          )}
          {idx === 1 && needs.length > 0 && (
            <NeedsSupport people={needs} labels={labels.needs} />
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
