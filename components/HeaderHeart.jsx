'use client';
import { useState, useEffect } from 'react';

export default function HeaderHeart({ likes = 0, follows = 0, unread = 0, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const has = (likes + follows) > 0;

  useEffect(() => {
    if (!has) return;
    const t = setTimeout(() => setOpen(true), 600);
    const h = setTimeout(() => setOpen(false), 5200);
    return () => { clearTimeout(t); clearTimeout(h); };
  }, [has]);

  return (
    <div className="header-heart">
      <a href="/notifications" className="icon-btn heart-btn" aria-label={ariaLabel}>
        <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20.5C12 20.5 3.5 15.5 3.5 9.2 3.5 6.4 5.6 4.5 8 4.5c1.7 0 3.1 1 4 2.4.9-1.4 2.3-2.4 4-2.4 2.4 0 4.5 1.9 4.5 4.7 0 6.3-8.5 11.3-8.5 11.3z" />
        </svg>
        {unread > 0 && <i className="heart-dot" />}
      </a>
      {open && has && (
        <div className="heart-pop" role="status">
          {likes > 0 && (
            <span className="hp-stat likes">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M12 20.5S3.5 15.5 3.5 9.2C3.5 6.4 5.6 4.5 8 4.5c1.7 0 3.1 1 4 2.4.9-1.4 2.3-2.4 4-2.4 2.4 0 4.5 1.9 4.5 4.7 0 6.3-8.5 11.3-8.5 11.3z" /></svg>
              {likes}
            </span>
          )}
          {follows > 0 && (
            <span className="hp-stat follows">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.4" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
              {follows}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
