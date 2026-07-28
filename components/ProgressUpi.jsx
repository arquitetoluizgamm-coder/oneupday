'use client';
import { useState } from 'react';

export default function ProgressUpi({ labels }) {
  const [text, setText] = useState(labels.prompt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function go() {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const r = await fetch('/api/companion', { method: 'POST' });
      const data = await r.json().catch(() => ({}));
      if (r.ok && data.text) setText(data.text); else setError(labels.error);
    } catch { setError(labels.error); }
    setBusy(false);
  }
  return <div className="pc-bar pc-progress-bar"><div className="pc-progress-upi"><img className="upi-char bob" src="/upi.svg" alt="Upi" /><button type="button" className="upi-bubble upi-open pc-progress-button" onClick={go} disabled={busy}><b className="upi-name">Upi</b><p>{busy ? labels.loading : text}</p>{error && <small>{error}</small>}</button></div></div>;
}
