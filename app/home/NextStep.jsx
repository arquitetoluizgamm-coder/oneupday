'use client';
import { useState } from 'react';

export default function NextStep({ journeyId, label, thinking }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  async function go() {
    if (busy) return; setBusy(true);
    try {
      const r = await fetch('/api/assist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'nextstep', journeyId }) });
      const j = await r.json();
      setText(j.text || '');
    } catch { }
    setBusy(false);
  }
  return (
    <div className="nextstep">
      <button className="tiny-link" onClick={go} disabled={busy}>{busy ? thinking : label}</button>
      {text && <p className="nextstep-text">💡 {text}</p>}
    </div>
  );
}
