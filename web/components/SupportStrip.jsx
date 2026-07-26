'use client';
import { useState } from 'react';

// Linha discreta "Apoiando Fulano". Clicou, abre os avatares embaixo,
// no mesmo espírito do painel de comentários.
export default function SupportStrip({ people, title }) {
  const [open, setOpen] = useState(false);
  if (!people || !people.length) return null;

  return (
    <div className="support-line">
      <button type="button" className={`sl-title${open ? ' on' : ''}`} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {title}
        <span className="sl-count">{people.length}</span>
      </button>
      {open && (
        <div className="sl-people">
          {people.map((p, idx) => {
            const first = (p.name || '?').split(' ')[0];
            const inner = (
              <>
                <span className="sl-ava" style={{ background: p.avatar_color || 'var(--muted)' }}>
                  {p.avatar_url ? <img src={p.avatar_url} alt="" draggable="false" /> : first[0]}
                </span>
                <span className="sl-name">{first}</span>
              </>
            );
            return p.handle
              ? <a key={idx} href={`/${p.handle}`} className="sl-person" title={p.name}>{inner}</a>
              : <span key={idx} className="sl-person" title={p.name}>{inner}</span>;
          })}
        </div>
      )}
    </div>
  );
}
