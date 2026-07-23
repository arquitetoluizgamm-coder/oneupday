'use client';
import { useEffect, useRef, useState } from 'react';
import MuteTopic from './MuteTopic';

export default function FeedClient({ mutedCats, labels }) {
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const sentinel = useRef(null);
  const busy = useRef(false);

  async function load() {
    if (busy.current || done) return;
    busy.current = true; setLoading(true);
    try {
      const r = await fetch(`/api/feed?offset=${offset}`);
      const j = await r.json();
      const batch = j.items || [];
      setItems(prev => { const seen = new Set(prev.map(x => x.id)); return [...prev, ...batch.filter(x => !seen.has(x.id))]; });
      setOffset(o => o + batch.length);
      if (batch.length < 8) setDone(true);
    } catch { }
    setLoading(false); setStarted(true); busy.current = false;
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const el = sentinel.current; if (!el) return;
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) load(); }, { rootMargin: '600px' });
    io.observe(el);
    return () => io.disconnect();
  }, [offset, done, loading]);

  const dayLabel = d => labels.dayShort.replace('{d}', d);

  return (
    <>
      {started && items.length === 0 && (
        <div className="feed-invite">
          <b>{labels.inviteTitle}</b>
          <p>{labels.inviteSub}</p>
          <a className="cta grow" href="/explore">{labels.inviteCta}</a>
        </div>
      )}
      {items.map(f => (
        <article className="mcard" key={f.id}>
          {f.photo_url && <a href={`/${f.journey.slug}`} className="mcard-media"><img src={f.photo_url} alt="" /></a>}
          {f.video_url && !f.photo_url && <div className="mcard-media"><video src={f.video_url} controls playsInline preload="metadata" /></div>}
          <div className="mcard-body">
            <a className="mcard-who" href={`/${f.owner.handle || f.journey.slug}`}>
              <span className="mcard-ava" style={{ background: f.owner.avatar_color || 'var(--orange)' }}>
                {f.owner.avatar_url ? <img src={f.owner.avatar_url} alt="" /> : (f.owner.name || '?')[0]}
              </span>
              <span className="mcard-id"><b>{f.owner.name}</b><small>{dayLabel(f.day_number)} · {f.journey.title}</small></span>
            </a>
            {f.kind === 'setback' && <span className="post-tag setback">{labels.tagSetback}</span>}
            {f.kind === 'win' && <span className="post-tag win">{labels.tagWin}</span>}
            {f.text && f.text !== '\u{1F4F7}' && f.text !== '\u{1F3A5}' && <p>{f.text}</p>}
            <div className="mcard-actions">
              <a className="feed-open" href={`/${f.journey.slug}`}>{labels.viewPublic}</a>
              <MuteTopic category={f.journey.category} current={mutedCats} label={labels.muteTopic} />
            </div>
          </div>
        </article>
      ))}
      {!done && <div ref={sentinel} className="feed-sentinel">{loading ? labels.loading : ''}</div>}
    </>
  );
}
