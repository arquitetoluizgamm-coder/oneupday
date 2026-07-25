'use client';
import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function CompanionCard({ userId, title, btn, loading, initialOff, labels }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [off, setOff] = useState(!!initialOff);
  const [saving, setSaving] = useState(false);

  async function setPref(v) {
    setSaving(true);
    try {
      const sb = createClient();
      await sb.from('profiles').update({ ai_opt_out: v }).eq('id', userId);
      try { v ? localStorage.setItem('oud_ai_off', '1') : localStorage.removeItem('oud_ai_off'); } catch { }
    } catch { }
    location.reload();
  }

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
        <button className="link-btn" onClick={() => setPref(false)} disabled={saving}>{labels.reactivate}</button>
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
      <p className="companion-consent">{labels.consent} <button className="link-btn" onClick={() => setPref(true)} disabled={saving}>{labels.off}</button></p>
    </section>
  );
}
