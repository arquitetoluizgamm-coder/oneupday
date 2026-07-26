'use client';
import { useEffect, useRef, useState, Fragment } from 'react';
import EncourageBar from '../[slug]/EncourageBar';
import FeedShare from './FeedShare';
import Comments from '../../components/Comments';
import SupportStrip from '../../components/SupportStrip';
import SuggestionCard from '../../components/SuggestionCard';
import HugButton from '../../components/HugButton';
import NeedsSupport from '../../components/NeedsSupport';
import MeTooButton from '../../components/MeTooButton';
import EditUpdate from '../../components/EditUpdate';
import ChallengeStrip from '../../components/ChallengeStrip';
import ChallengeButton from '../../components/ChallengeButton';
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

// ---- Linha de presença: os pontinhos do carrossel ----
function PresenceDots({ day, total }) {
  if (!total || total < 1) return null;
  const max = 10;
  const n = Math.min(total, max);
  const filled = Math.max(0, Math.min(n, Math.round((day / total) * n)));
  return (
    <div className="pdots" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => (
        <i key={i} className={i < filled ? (i === filled - 1 ? 'on now' : 'on') : ''} />
      ))}
    </div>
  );
}

// ---- A jornada é um post só: dias navegáveis dentro do card ----
function DayPager({ item, labels, dayLabel, dark }) {
  const [days, setDays] = useState(item.days || []);
  const [idx, setIdx] = useState((item.days || []).length - 1);
  const touch = useRef(null);
  if (!days.length) return null;
  const i = Math.max(0, Math.min(idx, days.length - 1));
  const d = days[i];
  const total = item.journey.total_days || 0;
  const pct = total ? Math.min(100, Math.max(3, Math.round(((d.day_number || 0) / total) * 100))) : 0;
  const left = Math.max(0, total - (d.day_number || 0));
  const cleanText = d.text && d.text !== '📷' && d.text !== '🎥' ? d.text : '';
  const hasMedia = !!(d.photo_url || d.video_url);
  const trackEl = d.track ? <TrackTag key={'t' + d.id} track={d.track} float hasBar={total > 0} /> : null;

  function go(next, e) { if (e) { e.preventDefault(); e.stopPropagation(); } setIdx(next); }
  function onTS(e) { touch.current = e.touches[0].clientX; }
  function onTE(e) {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    touch.current = null;
    if (dx > 44 && i > 0) setIdx(i - 1);
    else if (dx < -44 && i < days.length - 1) setIdx(i + 1);
  }

  return (
    <>
      <div className="dp-top">
        <PresenceDots day={d.day_number} total={total} />
        {total > 0 && <span className="dp-daymark">{(labels.dayOfShort || 'Dia {d} / {t}').replace('{d}', d.day_number).replace('{t}', total)}</span>}
      </div>

      <div className="dp-meta">
        {d.comeback && <span className="entry-comeback">{(labels.comebackFmt || '').replace('{d}', d.comeback)}</span>}
        {d.kind === 'setback' && <span className="entry-kindline setback">{labels.tagSetback}</span>}
        {d.kind === 'win' && <span className="entry-kindline win">{labels.tagWin}</span>}
        {[7, 30, 60, 100].includes(d.day_number) && <span className="entry-milestone">{(labels.milestoneFmt || '').replace('{d}', d.day_number)}</span>}
      </div>

      <div className={`dp-stage${hasMedia ? '' : ' is-text'}`} onTouchStart={onTS} onTouchEnd={onTE}>
        <div className="dp-slide" key={d.id}>
          {hasMedia ? (
            <>
              <div className="dp-text">
                {cleanText && <EntryText key={'x' + d.id} text={cleanText} labels={labels} limit={100} />}
              </div>
              {d.photo_url && <a href={`/${item.journey.slug}`} className="entry-media"><img src={d.photo_url} alt="" />{trackEl}</a>}
              {d.video_url && !d.photo_url && <div className="entry-media"><video src={d.video_url} controls playsInline preload="metadata" />{trackEl}</div>}
            </>
          ) : (
            // sem foto: o texto mora dentro do card, como no carrossel
            <a href={`/${item.journey.slug}`} className={`entry-textcard dp-card${dark ? ' dark' : ''}`}>
              <p className={`dpc-text${(cleanText || '').length > 120 ? ' long' : ''}`}>{cleanText}</p>
              {trackEl}
            </a>
          )}
        </div>
        {i > 0 && (
          <button type="button" className="dp-nav left" onClick={(e) => go(i - 1, e)} aria-label={(labels.dp || {}).prev || ''}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="butt"><path d="M15 5l-7 7 7 7" /></svg>
            <span>{dayLabel(days[i - 1].day_number)}</span>
          </button>
        )}
        {i < days.length - 1 && (
          <button type="button" className="dp-nav right" onClick={(e) => go(i + 1, e)} aria-label={(labels.dp || {}).next || ''}>
            <span>{dayLabel(days[i + 1].day_number)}</span>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="butt"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
        {total > 0 && (
          <div className="media-progress dp-progress" aria-hidden="true">
            <div className="mp-bar"><span style={{ width: pct + '%' }} /></div>
            <div className="mp-meta">
              <span>{(labels.progressFmt || '').replace('{d}', d.day_number).replace('{r}', left)}</span>
              <span className="mp-pct">{pct}%</span>
            </div>
          </div>
        )}
      </div>

      <SupportStrip people={item.supporters} title={(labels.supportStrip || '').replace('{name}', (item.owner.name || '').split(' ')[0])} />

      <div className="entry-actions">
        <EncourageBar key={'e' + d.id} updateId={d.id} initialActive={d.encouraged} labelIdle={labels.supportIdle} labelActive={labels.supportActive} supportersLabel={labels.supporters} supportersLoading={labels.supportersLoading} supportersEmpty={labels.supportersEmpty} />
        {(d.kind === 'setback' || d.comeback) && !item.own && <MeTooButton key={'m' + d.id} updateId={d.id} labels={labels.metoo} />}
        <FeedShare slug={item.journey.slug} title={item.journey.title} label={labels.share} copiedLabel={labels.linkCopied} />
        <Comments key={'c' + d.id} updateId={d.id} labels={labels.comments} />
        <HugButton key={'h' + d.id} toId={item.owner.id} updateId={d.id} name={(item.owner.name || '').split(' ')[0]} labels={labels.hug} />
        {item.challengeable && labels.ch && <ChallengeButton icon toId={item.owner.id} toName={item.owner.name} labels={labels.ch} />}
        {item.own && <EditUpdate key={'ed' + d.id} update={{ id: d.id, text: d.text, photo_url: d.photo_url, day: d.day_number }} labels={labels.editUpdate}
          onChanged={(patch) => setDays((prev) => patch === null ? prev.filter((x) => x.id !== d.id) : prev.map((x) => x.id === d.id ? { ...x, ...patch } : x))} />}
      </div>
    </>
  );
}

function EntryText({ text, labels, limit = 180 }) {
  const [expanded, setExpanded] = useState(false);
  const compact = text.length > limit;

  return (
    <>
      <p className={`entry-text${expanded ? ' expanded' : ''}`}>{text}</p>
      {compact && (
        <button type="button" className="entry-expand" onClick={() => setExpanded((value) => !value)}>
          {expanded ? labels.lessText : labels.moreText}
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
    <div className="entry-actions">
      <button type="button" className={`support-pill${liked ? ' on' : ''}`} onClick={() => setLiked((v) => !v)} aria-label={labels.supportIdle}>
        <svg className="sp-heart" viewBox="0 0 24 24" width="22" height="22" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1 7.8 7.8 7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        <span className="action-label">{labels.supportIdle}</span>
      </button>
      <button type="button" className="comment-toggle" aria-label={labels.comments.comment} onClick={() => setShowC((v) => !v)}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12 7.6L3 21l1.9-5.7A8.4 8.4 0 1 1 21 11.5z"/></svg>
        <span className="action-label">{labels.comments.comment}</span>
      </button>
      <FeedShare slug={item.journey.slug} title={item.journey.title} label={labels.share} copiedLabel={labels.linkCopied} />
      <HugButton demo name={(item.owner.name || '').split(' ')[0]} labels={labels.hug} />
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
  const [needs, setNeeds] = useState([]);
  useEffect(() => { fetch('/api/needs').then((r) => r.json()).then((j) => setNeeds(j.people || [])).catch(() => {}); }, []);
  useEffect(() => { fetch('/api/suggestions').then((r) => r.json()).then((j) => setSuggestions(j.people || [])).catch(() => {}); }, []);

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
            {item.caption && <p className="entry-text">{item.caption}</p>}
            <div className="entry-media">
              {item.kind === 'video' ? <video src={item.url} controls playsInline preload="metadata" /> : <img src={item.url} alt="" />}
            </div>
            <div className="entry-actions">
              <EncourageBar mediaId={item.mediaId} initialActive={item.encouraged} labelIdle={labels.supportIdle} labelActive={labels.supportActive} supportersLabel={labels.supporters} supportersLoading={labels.supportersLoading} supportersEmpty={labels.supportersEmpty} />
              <FeedShare slug={item.owner.handle || ''} title={item.owner.name} label={labels.share} copiedLabel={labels.linkCopied} />
              <Comments mediaId={item.mediaId} labels={labels.comments} />
              <HugButton toId={item.owner.id} mediaId={item.mediaId} name={(item.owner.name || '').split(' ')[0]} labels={labels.hug} />
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
              const progressEl = total > 0 ? (
                <div className="media-progress" aria-hidden="true">
                  <div className="mp-bar"><span style={{ width: pct + '%' }} /></div>
                  <span className="mp-label">{(labels.progressFmt || '').replace('{d}', day).replace('{r}', left)}</span>
                </div>
              ) : null;
              const trackFloat = item.track ? <TrackTag track={item.track} float hasBar={total > 0} /> : null;
              if (!hasMedia && cleanText) {
                return (
                  <a href={`/${item.journey.slug}`} className={`entry-textcard${cleanText.length > 130 ? ' long' : ''}`}>
                    <span className="etc-day">{dayLabel(item.day_number)}</span>
                    <p>{cleanText}</p>
                    {progressEl}
                    {trackFloat}
                  </a>
                );
              }
              return (
                <>
                  {cleanText && <EntryText text={cleanText} labels={labels} />}
                  {item.photo_url && <a href={`/${item.journey.slug}`} className="entry-media"><img src={item.photo_url} alt="" />{progressEl}{trackFloat}</a>}
                  {item.video_url && !item.photo_url && <div className="entry-media"><video src={item.video_url} controls playsInline preload="metadata" />{progressEl}{trackFloat}</div>}
                  {!hasMedia && !cleanText && item.track && <TrackTag track={item.track} />}
                </>
              );
            })()}

            <SupportStrip people={item.supporters} title={(labels.supportStrip || '').replace('{name}', (item.owner.name || '').split(' ')[0])} />

            {item.demo ? (
              <DemoActions item={item} labels={labels} />
            ) : (
              <div className="entry-actions">
                <EncourageBar updateId={item.id} initialActive={item.encouraged} labelIdle={labels.supportIdle} labelActive={labels.supportActive} supportersLabel={labels.supporters} supportersLoading={labels.supportersLoading} supportersEmpty={labels.supportersEmpty} />
                {(item.kind === 'setback' || item.comeback) && !item.demo && !item.own && <MeTooButton updateId={item.id} labels={labels.metoo} />}
                <FeedShare slug={item.journey.slug} title={item.journey.title} label={labels.share} copiedLabel={labels.linkCopied} />
                <Comments updateId={item.id} labels={labels.comments} />
                <HugButton toId={item.owner.id} updateId={item.id} name={(item.owner.name || '').split(' ')[0]} labels={labels.hug} />
                {item.challengeable && labels.ch && <ChallengeButton icon toId={item.owner.id} toName={item.owner.name} labels={labels.ch} />}
              </div>
            )}
            </>
            )}
            {item.challenge && !item.demo && <ChallengeStrip challenge={item.challenge} labels={labels.ch} />}
          </article>
          )}
          {idx === 1 && needs.length > 0 && (
            <NeedsSupport people={needs} labels={labels.needs} />
          )}
          {idx === 4 && suggestions.length > 0 && (
            <SuggestionCard people={suggestions} labels={labels.suggest} />
          )}
          </Fragment>
        ))}

        {items.length > 0 && items.length < 2 && needs.length > 0 && (
          <NeedsSupport people={needs} labels={labels.needs} />
        )}
        {items.length > 0 && items.length < 5 && suggestions.length > 0 && (
          <SuggestionCard people={suggestions} labels={labels.suggest} />
        )}

        {!done && <div ref={sentinel} className="feed-sentinel">{loading ? labels.loading : ''}</div>}
      </section>
    </>
  );
}
