'use client';
import { useState } from 'react';

export default function CompanionCard({ title, btn, loading }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  async function go() {
    if (busy) return; setBusy(true);
    try {
      const r = await fetch('/api/companion', { method: 'POST' });
      const j = await r.json();
      setText(j.text || '');
    } catch { }
    setBusy(false);
  }
  return (
    <section className="companion">
      <div className="companion-head">
        <b>{title}</b>
        <button className="ghost-btn" onClick={go} disabled={busy}>{busy ? loading : btn}</button>
      </div>
      {text && <p className="companion-text">{text}</p>}
    </section>
  );
}
