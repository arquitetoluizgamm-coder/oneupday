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
import { MOODS, moodGlow } from '../../lib/moods';
import FollowUserButton from '../[slug]/FollowUserButton';


function TrackTag({ track }) {
  const [playing, setPlaying] = useState(false);
  const audio = useRef(null);

  function toggle() {
    if (!audio.current) return;
    if (playing) {
      audio.current.pause();
      setPlaying(false);
    } else {
      audio.current.play().catch(() => {});
      setPlaying(true);
    }
  }

  return (
    <div className="feed-track">
      <button type="button" className="feed-track-btn" onClick={toggle}>{playing ? 'Pause' : 'Play'}</button>
      <span className="feed-track-name">{track.title}{track.artist ? ` · ${track.artist}` : ''}</span>
      <audio ref={audio} src={track.audio_url} onEnded={() => setPlaying(false)} />
    </div>
  );
}

function EntryText({ text, labels }) {
  const [expanded, setExpanded] = useState(false);
  const compact = text.length > 180;

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
            </div>
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
            </div>
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
              if (!hasMedia && cleanText) {
                return (
                  <a href={`/${item.journey.slug}`} className={`entry-textcard${cleanText.length > 130 ? ' long' : ''}`}>
                    <span className="etc-day">{dayLabel(item.day_number)}</span>
                    <p>{cleanText}</p>
                    {progressEl}
                  </a>
                );
              }
              return (
                <>
                  {cleanText && <EntryText text={cleanText} labels={labels} />}
                  {item.photo_url && <a href={`/${item.journey.slug}`} className="entry-media"><img src={item.photo_url} alt="" />{progressEl}</a>}
                  {item.video_url && !item.photo_url && <div className="entry-media"><video src={item.video_url} controls playsInline preload="metadata" />{progressEl}</div>}
                </>
              );
            })()}
            {item.track && <TrackTag track={item.track} />}

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
              </div>
            )}
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
