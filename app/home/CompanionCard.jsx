'use client';
import { useState, useEffect } from 'react';

export default function CompanionCard({ title, btn, loading, labels }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [off, setOff] = useState(false);
  useEffect(() => { try { setOff(localStorage.getItem('oud_ai_off') === '1'); } catch { } }, []);
  function turnOff() { try { localStorage.setItem('oud_ai_off', '1'); } catch { } setOff(true); }
  function turnOn() { try { localStorage.removeItem('oud_ai_off'); } catch { } setOff(false); }

  async function go() {
    if (busy) return; setBusy(true); setErr(''); setText('');
    try {
      const r = await fetch('/api/companion', { method: 'POST' });
      if (r.status === 429) { setErr(labels.rateErr); setBusy(false); return; }
      if (!r.ok) { setErr(labels.err); setBusy(false); return; }
      const j = await r.json();
      if (j.error) setErr(labels.err); else setText(j.text || '');
    } catch { setErr(labels.err); }
    setBusy(false);
  }

  if (off) {
    return (
      <section className="companion companion-off">
        <span>{labels.offState}</span>
        <button className="link-btn" onClick={turnOn}>{labels.reactivate}</button>
      </section>
    );
  }
  return (
    <section className="companion">
      <div className="companion-head">
        <b>{title}</b>
        <button className="ghost-btn" onClick={go} disabled={busy}>{busy ? loading : btn}</button>
      </div>
      {text && <p className="companion-text">{text}</p>}
      {err && <p className="companion-err">{err}</p>}
      <p className="companion-consent">{labels.consent} <button className="link-btn" onClick={turnOff}>{labels.off}</button></p>
    </section>
  );
}
