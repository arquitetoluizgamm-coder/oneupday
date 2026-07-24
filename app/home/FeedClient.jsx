'use client';
import { useEffect, useRef, useState } from 'react';
import EncourageBar from '../[slug]/EncourageBar';
import FeedShare from './FeedShare';
import Comments from '../../components/Comments';
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
  return (
    <div className="entry-actions">
      <a className="support-pill" href={`/${item.journey.slug}`}><span>♡</span><span>{labels.supportIdle}</span></a>
      <a className="comment-toggle demo-action-link" href={`/${item.journey.slug}`}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-5 4v-4.2A2.5 2.5 0 0 1 4 13.5z" />
        </svg>
        <span className="action-label">{labels.comments.comment}</span>
      </a>
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
        <button type="button" className={`feed-filter-trigger${kind ? ' active' : ''}`} onClick={() => setFilterOpen((value) => !value)}>
          {labels.filterLabel}{kind ? ` · ${labels.kinds[kind]}` : ''}
        </button>
      </div>

      {filterOpen && (
        <div className="feed-filter-menu">
          <span>{labels.filterLabel}</span>
          {['', 'step', 'win', 'setback', 'learned'].map((value) => (
            <button key={value} className={kind === value ? 'on' : ''} onClick={() => switchKind(value)}>
              {value === '' ? labels.filterAll : labels.kinds[value]}
            </button>
          ))}
        </div>
      )}

      <section className="feed-stream">
        {started && items.length === 0 && (
          <div className="feed-invite">
            <b>{emptyTitle}</b>
            <p>{emptySub}</p>
            <a className="cta grow" href="/explore">{labels.inviteCta}</a>
          </div>
        )}

        {items.map((item) => (
          <article className={`entry ${item.kind || 'step'}${item.demo ? ' is-demo' : ''}`} key={item.id}>
            <div className="entry-head">
              <a className="entry-person" href={`/${item.owner.handle || item.journey.slug}`}>
                <span className="entry-ava" style={{ background: item.owner.avatar_color || 'var(--orange)' }}>
                  {item.owner.avatar_url ? <img src={item.owner.avatar_url} alt="" /> : (item.owner.name || '?')[0]}
                </span>
                <span className="entry-id">
                  <b>{item.owner.name}</b>
                  <small>{dayLabel(item.day_number)} · <b className="entry-journey">{item.journey.title}</b></small>
                </span>
              </a>
              {item.owner.id && <FollowUserButton profileId={item.owner.id} labelFollow={labels.follow} labelFollowing={labels.following} labelBack={labels.followBack} />}
              {item.kind === 'setback' && <span className="entry-tag setback">{labels.tagSetback}</span>}
              {item.kind === 'win' && <span className="entry-tag win">{labels.tagWin}</span>}
            </div>

            {(() => {
              const hasMedia = !!(item.photo_url || item.video_url);
              const cleanText = item.text && item.text !== '📷' && item.text !== '🎥' ? item.text : '';
              if (!hasMedia && cleanText) {
                return (
                  <a href={`/${item.journey.slug}`} className={`entry-textcard${cleanText.length > 130 ? ' long' : ''}`}
                    style={{ background: `linear-gradient(150deg, ${item.journey.cover_color || '#1b1f45'}, #10132D 90%)` }}>
                    <span className="etc-day">{dayLabel(item.day_number)}</span>
                    <p>{cleanText}</p>
                  </a>
                );
              }
              return (
                <>
                  {cleanText && <EntryText text={cleanText} labels={labels} />}
                  {item.photo_url && <a href={`/${item.journey.slug}`} className="entry-media"><img src={item.photo_url} alt="" /></a>}
                  {item.video_url && !item.photo_url && <div className="entry-media"><video src={item.video_url} controls playsInline preload="metadata" /></div>}
                </>
              );
            })()}
            {item.track && <TrackTag track={item.track} />}

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
        ))}

        {!done && <div ref={sentinel} className="feed-sentinel">{loading ? labels.loading : ''}</div>}
      </section>
    </>
  );
}
