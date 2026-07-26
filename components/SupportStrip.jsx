'use client';
import { useRef } from 'react';

export default function SupportStrip({ people, title, inline }) {
  const ref = useRef(null);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  if (!people || !people.length) return null;

  function onDown(e) { const el = ref.current; if (!el) return; drag.current = { down: true, x: e.clientX, left: el.scrollLeft, moved: false }; el.classList.add('grabbing'); }
  function onMove(e) { const el = ref.current; if (!el || !drag.current.down) return; const dx = e.clientX - drag.current.x; if (Math.abs(dx) > 3) drag.current.moved = true; el.scrollLeft = drag.current.left - dx; }
  function onUp() { drag.current.down = false; ref.current?.classList.remove('grabbing'); }
  function onClickCapture(e) { if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); } }

  return (
    <div className={`support-strip${inline ? ' inline' : ''}`}>
      <span className="ss-title">{title}</span>
      <div className="ss-scroll" ref={ref} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} onClickCapture={onClickCapture}>
        {people.map((p, idx) => {
          const first = (p.name || '?').split(' ')[0];
          const inner = (
            <span className="ss-ava" style={{ background: p.avatar_color || 'var(--muted)' }}>
              {p.avatar_url ? <img src={p.avatar_url} alt="" draggable="false" /> : first[0]}
            </span>
          );
          return p.handle
            ? <a key={idx} href={`/${p.handle}`} className="ss-person" title={p.name} aria-label={p.name}>{inner}</a>
            : <span key={idx} className="ss-person" title={p.name}>{inner}</span>;
        })}
      </div>
    </div>
  );
}
