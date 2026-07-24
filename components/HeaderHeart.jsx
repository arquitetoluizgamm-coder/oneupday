'use client';
import { useState, useEffect, useRef } from 'react';

export default function HeaderHeart({ likes = 0, follows = 0, labels }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const has = (likes + follows) > 0;

  useEffect(() => {
    if (!has) return;
    const t = setTimeout(() => setOpen(true), 600);
    const h = setTimeout(() => setOpen(false), 5200);
    return () => { clearTimeout(t); clearTimeout(h); };
  }, [has]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [open]);

  return (
    <div className="header-heart" ref={ref}>
      <button type="button" className="icon-btn heart-btn" aria-label={labels.title} onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20.5C12 20.5 3.5 15.5 3.5 9.2 3.5 6.4 5.6 4.5 8 4.5c1.7 0 3.1 1 4 2.4.9-1.4 2.3-2.4 4-2.4 2.4 0 4.5 1.9 4.5 4.7 0 6.3-8.5 11.3-8.5 11.3z" />
        </svg>
        {has && <i className="heart-dot" />}
      </button>
      {open && (
        <div className="heart-pop" role="dialog">
          <span className="hp-title">{labels.title}</span>
          {has ? (
            <div className="hp-lines">
              {likes > 0 && <p><b>{likes}</b> {labels.likes}</p>}
              {follows > 0 && <p><b>{follows}</b> {labels.follows}</p>}
            </div>
          ) : <p className="hp-empty">{labels.empty}</p>}
          <a className="hp-all" href="/notifications">{labels.seeAll}</a>
        </div>
      )}
    </div>
  );
}
