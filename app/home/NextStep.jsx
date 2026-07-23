'use client';
import { useState, useEffect } from 'react';

export default function NextStep({ journeyId, label, thinking, errLabel, rateLabel }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [off, setOff] = useState(false);
  useEffect(() => { try { setOff(localStorage.getItem('oud_ai_off') === '1'); } catch { } }, []);
  if (off) return null;

  async function go() {
    if (busy) return; setBusy(true); setErr(''); setText('');
    try {
      const r = await fetch('/api/assist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'nextstep', journeyId }) });
      if (r.status === 429) { setErr(rateLabel); setBusy(false); return; }
      if (!r.ok) { setErr(errLabel); setBusy(false); return; }
      const j = await r.json();
      setText(j.text || '');
    } catch { setErr(errLabel); }
    setBusy(false);
  }
  return (
    <div className="nextstep">
      <button className="tiny-link" onClick={go} disabled={busy}>{busy ? thinking : label}</button>
      {text && <p className="nextstep-text">💡 {text}</p>}
      {err && <p className="nextstep-text" style={{ color: '#e11d48' }}>{err}</p>}
    </div>
  );
}
