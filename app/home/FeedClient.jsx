'use client';
import { useEffect, useRef, useState, Fragment } from 'react';
import EncourageBar from '../[slug]/EncourageBar';
import FeedShare from './FeedShare';
import Comments from '../../components/Comments';
import SupportStrip from '../../components/SupportStrip';
import SuggestionCard from '../../components/SuggestionCard';
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
  return (
    <div className="entry-actions">
      <button type="button" className={`support-pill${liked ? ' on' : ''}`} onClick={() => setLiked((v) => !v)} aria-label={labels.supportIdle}>
        <svg className="sp-heart" viewBox="0 0 24 24" width="22" height="22" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1 7.8 7.8 7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        <span className="action-label">{labels.supportIdle}</span>
      </button>
      <button type="button" className="comment-toggle" aria-label={labels.comments.comment}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12 7.6L3 21l1.9-5.7A8.4 8.4 0 1 1 21 11.5z"/></svg>
        <span className="action-label">{labels.comments.comment}</span>
      </button>
      <FeedShare slug={item.journey.slug} title={item.journey.title} label={labels.share} copiedLabel={labels.linkCopied} />
    </div>
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
              {item.owner.id && <FollowUserButton profileId={item.owner.id} labelFollow={labels.follow} labelFollowing={labels.following} labelBack={labels.followBack} />}
            </div>
            {item.kind === 'setback' && <div className="entry-kindline setback">{labels.tagSetback}</div>}
            {item.kind === 'win' && <div className="entry-kindline win">{labels.tagWin}</div>}

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
                <FeedShare slug={item.journey.slug} title={item.journey.title} label={labels.share} copiedLabel={labels.linkCopied} />
                <Comments updateId={item.id} labels={labels.comments} />
              </div>
            )}
          </article>
          {(idx === 5 || idx === 15) && suggestions.length > 0 && (
            <SuggestionCard people={idx === 5 ? suggestions.slice(0, 5) : suggestions.slice(5, 10)} labels={labels.suggest} />
          )}
          </Fragment>
        ))}

        {!done && <div ref={sentinel} className="feed-sentinel">{loading ? labels.loading : ''}</div>}
      </section>
    </>
  );
}
