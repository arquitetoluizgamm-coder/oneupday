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
import Retornos from '../../components/Retornos';
import { StepOpen, StepResult } from '../../components/StepChapter';
import Percepcao from '../../components/Percepcao';
import { MOODS, moodGlow } from '../../lib/moods';
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

// ---- Um card por jornada: mostra o dia mais recente. Sem slides. ----
function DayPager({ item, labels, dayLabel, dark }) {
  const [days, setDays] = useState(item.days || []);
  if (!days.length) return null;
  const d = days[days.length - 1];
  const total = item.journey.total_days || 0;
  const pct = total ? Math.min(100, Math.max(3, Math.round(((d.day_number || 0) / total) * 100))) : 0;
  const left = Math.max(0, total - (d.day_number || 0));
  const cleanText = d.text && d.text !== '📷' && d.text !== '🎥' ? d.text : '';
  const hasMedia = !!(d.photo_url || d.video_url);
  const trackEl = d.track ? <TrackTag key={'t' + d.id} track={d.track} float hasBar={false} /> : null;

  return (
    <>
      {d.closes && d.closes.step && (
        <StepResult decided={d.closes.step} name={(item.owner.name || '').split(' ')[0]} labels={labels.step} />
      )}

      <div className={`dp-stage${hasMedia ? '' : ' is-text'}`}>
        <div className="dp-slide" key={d.id}>
          {hasMedia ? (
            <>
              {d.photo_url && <a href={`/${item.journey.slug}`} className="entry-media"><img src={d.photo_url} alt="" />{trackEl}</a>}
              {d.video_url && !d.photo_url && <div className="entry-media"><video src={d.video_url} controls playsInline preload="metadata" />{trackEl}</div>}
            </>
          ) : (
            <a href={`/${item.journey.slug}`} className={`entry-textcard dp-card${dark ? ' dark' : ''}`}>
              <CardText text={cleanText} labels={labels} />
              {trackEl}
            </a>
          )}
        </div>
      </div>

      {hasMedia && cleanText && (
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
        <Comments key={'c' + d.id} updateId={d.id} labels={labels.comments} />
        <Percepcao updateId={d.id} toId={item.owner.id} own={item.own} labels={labels.pc} />
        <FeedShare slug={item.journey.slug} title={item.journey.title} label={labels.share} copiedLabel={labels.linkCopied} />
        {item.challengeable && labels.ch && <ChallengeButton icon toId={item.owner.id} toName={item.owner.name} labels={labels.ch} />}
        {item.own && <EditUpdate key={'ed' + d.id} update={{ id: d.id, text: d.text, photo_url: d.photo_url, day: d.day_number }} labels={labels.editUpdate}
          onChanged={(patch) => setDays((prev) => patch === null ? prev.filter((x) => x.id !== d.id) : prev.map((x) => x.id === d.id ? { ...x, ...patch } : x))} />}
      </ActionsRow>
    </>
  );
}

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
  const [needs, setNeeds] = useState([]);
  useEffect(() => { fetch('/api/needs').then((r) => r.json()).then((j) => setNeeds(j.people || [])).catch(() => {}); }, []);
  useEffect(() => { fetch('/api/suggestions').then((r) => r.json()).then((j) => setSuggestions(j.people || [])).catch(() => {}); }, []);
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
      <div className="feed-tabs">
        <button className={scope === 'all' ? 'on' : ''} onClick={() => switchScope('all')}>{labels.tabAll}</button>
        <button className={scope === 'following' ? 'on' : ''} onClick={() => switchScope('following')}>{labels.tabFollowing}</button>
      </div>

      <section className="feed-stream">
        {started && items.length === 0 && (
          <div className="feed-invite">
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
            <div className="entry-media">
              {item.kind === 'video' ? <video src={item.url} controls playsInline preload="metadata" /> : <img src={item.url} alt="" />}
            </div>
            {item.caption && <div className="dp-text under"><EntryText text={item.caption} labels={labels} limit={100} /></div>}
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
                  <b>{item.owner.name}{item.owner.mood && (labels.moods || {})[item.owner.mood] && <span className="entry-mood" style={{ color: MOODS[item.owner.mood] }}> · {labels.moods[item.owner.mood]}</span>}</b>
                  <small><span className="entry-journey">{item.journey.title}</span> · {dayLabel(item.day_number)}</small>
                </span>
              </a>
              {item.owner.id && !item.own && <FollowUserButton profileId={item.owner.id} labelFollow={labels.follow} labelFollowing={labels.following} labelBack={labels.followBack} />}
              {item.own && !item.demo && !item.days && <EditUpdate update={{ id: item.id, text: item.text, photo_url: item.photo_url, day: item.day_number }} labels={labels.editUpdate}
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
            {item.kind === 'setback' && <div className="entry-kindline setback">{labels.tagSetback}</div>}
            {item.kind === 'win' && <div className="entry-kindline win">{labels.tagWin}</div>}
            {[7, 30, 60, 100].includes(item.day_number) && <div className="entry-milestone">{(labels.milestoneFmt || '').replace('{d}', item.day_number)}</div>}

            {(() => {
              const hasMedia = !!(item.photo_url || item.video_url);
              const cleanText = item.text && item.text !== '📷' && item.text !== '🎥' ? item.text : '';
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
              if (!hasMedia && cleanText) {
                return (
                  <>
                    <a href={`/${item.journey.slug}`} className="entry-textcard dp-card">
                      <CardText text={cleanText} labels={labels} />
                      {trackFloat}
                    </a>
                    {progressEl}
                  </>
                );
              }
              return (
                <>
                  {item.photo_url && <a href={`/${item.journey.slug}`} className="entry-media"><img src={item.photo_url} alt="" />{trackFloat}</a>}
                  {item.video_url && !item.photo_url && <div className="entry-media"><video src={item.video_url} controls playsInline preload="metadata" />{trackFloat}</div>}
                  {!hasMedia && !cleanText && item.track && <TrackTag track={item.track} />}
                  {cleanText && <div className="dp-text under"><EntryText text={cleanText} labels={labels} limit={100} /></div>}
                  {progressEl}
                </>
              );
            })()}

            {item.nextStep && (
              <StepOpen updateId={item.id} step={item.nextStep} when={item.nextWhen}
                name={(item.owner.name || '').split(' ')[0]} following={item.stepFollowing} own={item.own} labels={labels.step} />
            )}
            {item.demo ? (
              <DemoActions item={item} labels={labels} />
            ) : (
              <ActionsRow people={item.supporters} title={(labels.supporting || '').replace('{name}', (item.owner.name || '').split(' ')[0])}>
                <EncourageBar updateId={item.id} initialActive={item.encouraged} labelIdle={labels.supportIdle} labelActive={labels.supportActive} supportersLabel={labels.supporters} supportersLoading={labels.supportersLoading} supportersEmpty={labels.supportersEmpty} />
                <Comments updateId={item.id} labels={labels.comments} />
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
