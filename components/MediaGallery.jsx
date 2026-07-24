'use client';
import { useState, useEffect } from 'react';

export default function MediaGallery({ items, showVis, visLabels }) {
  const [open, setOpen] = useState(-1);
  useEffect(() => {
    if (open < 0) return;
    function onKey(e) { if (e.key === 'Escape') setOpen(-1); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  if (!items || !items.length) return null;
  const V = visLabels || {};
  return (
    <>
      <div className="album-grid">
        {items.map((m, i) => (
          <button type="button" className="album-item" key={m.id} onClick={() => setOpen(i)}>
            {m.kind === 'video' ? <video src={m.url} muted playsInline /> : <img src={m.url} alt="" />}
            {m.kind === 'video' && <span className="album-play">▶</span>}
            {showVis && <span className={`album-vis vis-${m.visibility}`}>{V[m.visibility] || ''}</span>}
          </button>
        ))}
      </div>
      {open >= 0 && items[open] && (
        <div className="lightbox" onClick={() => setOpen(-1)}>
          <button className="lb-close" onClick={() => setOpen(-1)} aria-label="Fechar">✕</button>
          <div className="lb-inner" onClick={(e) => e.stopPropagation()}>
            {items[open].kind === 'video'
              ? <video src={items[open].url} controls autoPlay playsInline />
              : <img src={items[open].url} alt="" />}
          </div>
          {items.length > 1 && (
            <>
              <button className="lb-nav prev" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + items.length) % items.length); }} aria-label="Anterior">‹</button>
              <button className="lb-nav next" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % items.length); }} aria-label="Próxima">›</button>
            </>
          )}
        </div>
      )}
    </>
  );
}
