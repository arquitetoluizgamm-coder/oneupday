'use client';
import { useState, useEffect } from 'react';

const KEY = 'oud-heart-seen';

// Mostra só o que chegou de novo desde a última olhada.
// Depois de ver, some — e só volta quando houver algo novo de verdade.
export default function HeaderHeart({ likes = 0, follows = 0, unread = 0, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const [novo, setNovo] = useState({ likes: 0, follows: 0 });

  function marcarVisto() {
    try { localStorage.setItem(KEY, JSON.stringify({ likes, follows })); } catch {}
  }

  useEffect(() => {
    let visto = { likes: 0, follows: 0 };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) visto = JSON.parse(raw) || visto;
    } catch {}

    const nLikes = Math.max(0, likes - (visto.likes || 0));
    const nFollows = Math.max(0, follows - (visto.follows || 0));

    // nada novo: acerta o marcador (caso o total tenha caído) e fica quieto
    if (nLikes === 0 && nFollows === 0) {
      try { localStorage.setItem(KEY, JSON.stringify({ likes, follows })); } catch {}
      return;
    }

    setNovo({ likes: nLikes, follows: nFollows });
    const t = setTimeout(() => setOpen(true), 600);
    const h = setTimeout(() => {
      setOpen(false);
      try { localStorage.setItem(KEY, JSON.stringify({ likes, follows })); } catch {}
    }, 5200);
    return () => { clearTimeout(t); clearTimeout(h); };
  }, [likes, follows]);

  function dispensar() {
    setOpen(false);
    marcarVisto();
  }

  const has = (novo.likes + novo.follows) > 0;

  return (
    <div className="header-heart">
      <a href="/notifications" className="icon-btn heart-btn" aria-label={ariaLabel} onClick={marcarVisto}>
        {/* mão segurando um coração: apoio recebido */}
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16" />
          <path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
          <path d="m2 15 6 6" />
          <path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z" />
        </svg>
        {unread > 0 && <i className="heart-dot" />}
      </a>
      {open && has && (
        <div className="heart-pop" role="status" onClick={dispensar}>
          {novo.likes > 0 && (
            <span className="hp-stat likes">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M12 20.5S3.5 15.5 3.5 9.2C3.5 6.4 5.6 4.5 8 4.5c1.7 0 3.1 1 4 2.4.9-1.4 2.3-2.4 4-2.4 2.4 0 4.5 1.9 4.5 4.7 0 6.3-8.5 11.3-8.5 11.3z" /></svg>
              {novo.likes}
            </span>
          )}
          {novo.follows > 0 && (
            <span className="hp-stat follows">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.4" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
              {novo.follows}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
