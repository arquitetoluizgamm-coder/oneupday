'use client';
import { useEffect, useRef, useState } from 'react';
import EncourageBar from '../[slug]/EncourageBar';
import FeedShare from './FeedShare';
import Comments from '../../components/Comments';
import FollowUserButton from '../[slug]/FollowUserButton';

function TrackTag({ track }) {
  const [playing, setPlaying] = useState(false);
  const a = useRef(null);
  function toggle() {
    if (!a.current) return;
    if (playing) { a.current.pause(); setPlaying(false); }
    else { a.current.play().catch(() => {}); setPlaying(true); }
  }
  return (
    <div className="feed-track">
      <button type="button" className="feed-track-btn" onClick={toggle}>{playing ? '❚❚' : '▶'}</button>
      <span className="feed-track-name">♪ {track.title}{track.artist ? ' · ' + track.artist : ''}</span>
      <audio ref={a} src={track.audio_url} onEnded={() => setPlaying(false)} />
    </div>
  );
}

function EntryText({ text, labels }) {
  const [expanded, setExpanded] = useState(false);
  const compact = text.length > 180;
  return <>{<p className={`entry-text${expanded ? ' expanded' : ''}`}>{text}</p>}{compact && <button type="button" className="entry-expand" onClick={() => setExpanded(value => !value)}>{expanded ? labels.lessText : labels.moreText}</button>}</>;
}

export default function FeedClient({ mutedCats, labels }) {
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
    busy.current = true; setLoading(true);
    try {
      const r = await fetch(`/api/feed?offset=${offsetRef.current}&scope=${scopeRef.current}&kind=${encodeURIComponent(kind)}`);
      const j = await r.json();
      const batch = j.items || [];
      setItems(prev => { const seen = new Set(prev.map(x => x.id)); return [...prev, ...batch.filter(x => !seen.has(x.id))]; });
      offsetRef.current += batch.length;
      if (batch.length < 8) { doneRef.current = true; setDone(true); }
    } catch { }
    setLoading(false); setStarted(true); busy.current = false;
  }

  function switchScope(s) {
    if (s === scopeRef.current) return;
    scopeRef.current = s; setScope(s);
    offsetRef.current = 0; doneRef.current = false;
    setItems([]); setDone(false); setStarted(false);
    load();
  }
  function switchKind(next) {
    if (next === kind) return;
    setKind(next); setFilterOpen(false); offsetRef.current = 0; doneRef.current = false; setItems([]); setDone(false); setStarted(false); busy.current = false;
  }

  useEffect(() => { load(); }, [kind]);
  useEffect(() => {
    const el = sentinel.current; if (!el) return;
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) load(); }, { rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }, [done, scope]);

  const dayLabel = d => labels.dayShort.replace('{d}', d);
  const emptyTitle = scope === 'following' ? labels.followingEmptyTitle : labels.inviteTitle;
  const emptySub = scope === 'following' ? labels.followingEmptySub : labels.inviteSub;

  return (
    <>
      <div className="feed-tabs">
        <button className={scope === 'all' ? 'on' : ''} onClick={() => switchScope('all')}>{labels.tabAll}</button>
        <button className={scope === 'following' ? 'on' : ''} onClick={() => switchScope('following')}>{labels.tabFollowing}</button>
        <button type="button" className={`feed-filter-trigger${kind ? ' active' : ''}`} onClick={() => setFilterOpen(value => !value)}>{labels.filterLabel}{kind ? ` · ${labels.kinds[kind]}` : ''}</button>
      </div>
      {filterOpen && <div className="feed-filter-menu"><span>{labels.filterLabel}</span>{['', 'step', 'win', 'setback', 'learned'].map(value => <button key={value} className={kind === value ? 'on' : ''} onClick={() => switchKind(value)}>{value === '' ? labels.filterAll : labels.kinds[value]}</button>)}</div>}

      {started && items.length === 0 && (
        <div className="feed-invite">
          <b>{emptyTitle}</b>
          <p>{emptySub}</p>
          <a className="cta grow" href="/explore">{labels.inviteCta}</a>
        </div>
      )}
      {items.map(f => (
        <article className={`entry ${f.kind || 'step'}`} key={f.id}>
          <a className="entry-head" href={`/${f.owner.handle || f.journey.slug}`}>
            <span className="entry-ava" style={{ background: f.owner.avatar_color || 'var(--orange)' }}>
              {f.owner.avatar_url ? <img src={f.owner.avatar_url} alt="" /> : (f.owner.name || '?')[0]}
            </span>
            <span className="entry-id">
              <b>{f.owner.name}</b>
              <small>{dayLabel(f.day_number)} · {f.journey.title}</small>
            </span>
            {f.owner.id && <FollowUserButton profileId={f.owner.id} labelFollow={labels.follow} labelFollowing={labels.following} labelBack={labels.followBack} />}
            {f.kind === 'setback' && <span className="entry-tag setback">{labels.tagSetback}</span>}
            {f.kind === 'win' && <span className="entry-tag win">{labels.tagWin}</span>}
          </a>
          {f.text && f.text !== '\u{1F4F7}' && f.text !== '\u{1F3A5}' && <EntryText text={f.text} labels={labels} />}
          {f.photo_url && <a href={`/${f.journey.slug}`} className="entry-media"><img src={f.photo_url} alt="" /></a>}
          {f.video_url && !f.photo_url && <div className="entry-media"><video src={f.video_url} controls playsInline preload="metadata" /></div>}
          {f.track && <TrackTag track={f.track} />}
          <div className="entry-actions">
              <EncourageBar updateId={f.id} initialActive={f.encouraged} labelIdle={labels.supportIdle} labelActive={labels.supportActive} supportersLabel={labels.supporters} supportersLoading={labels.supportersLoading} supportersEmpty={labels.supportersEmpty} />
              <FeedShare slug={f.journey.slug} title={f.journey.title} label={labels.share} copiedLabel={labels.linkCopied} />
              <Comments updateId={f.id} labels={labels.comments} />
            </div>
        </article>
      ))}
      {!done && <div ref={sentinel} className="feed-sentinel">{loading ? labels.loading : ''}</div>}
    </>
  );
}
