'use client';
import { useState } from 'react';

// Liga/desliga o Primeiro Eco. A pessoa manda no que a IA faz na jornada dela.
export default function EcoToggle({ inicial = true, labels }) {
  const L = labels || {};
  const [on, setOn] = useState(!!inicial);
  const [busy, setBusy] = useState(false);

  async function alternar() {
    if (busy) return;
    setBusy(true);
    const novo = !on;
    const r = await fetch('/api/eco', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ on: novo }),
    }).catch(() => null);
    if (r && r.ok) setOn(novo);
    setBusy(false);
  }

  return (
    <div className="push-row">
      <div className="push-info">
        <b>{L.title}</b>
        <p>{L.sub}</p>
      </div>
      <button type="button" className={on ? 'ghost-btn' : 'cta'} onClick={alternar} disabled={busy}>
        {on ? L.off : L.on}
      </button>
    </div>
  );
}
