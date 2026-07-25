'use client';
import { useState } from 'react';

// Lançar um desafio no perfil de alguém que você segue / te segue
export default function ChallengeButton({ toId, toName, labels }) {
  const L = labels || {};
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [days, setDays] = useState(7);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

  async function send() {
    if (title.trim().length < 3 || busy) return;
    setBusy(true); setErr('');
    const r = await fetch('/api/challenge', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toId, title: title.trim(), days }),
    });
    if (r.status === 401) { window.location.href = '/login'; return; }
    if (r.status === 409) setErr(L.errExists);
    else if (r.status === 403) setErr(L.errConn);
    else if (!r.ok) setErr(L.err);
    else setSent(true);
    setBusy(false);
  }

  return (
    <>
      <button type="button" className="ghost-btn ch-btn" onClick={() => setOpen(true)}>{L.btn}</button>
      {open && (
        <div className="crop-modal" role="dialog" aria-modal="true" onClick={() => !busy && setOpen(false)}>
          <div className="crop-modal-card ep-card" onClick={(e) => e.stopPropagation()}>
            {sent ? (
              <>
                <b className="ep-title">{L.modalTitle}</b>
                <p className="ch-sent">{(L.sent || '').replace('{name}', (toName || '').split(' ')[0])}</p>
                <div className="crop-actions"><button type="button" className="cta grow" onClick={() => setOpen(false)}>OK</button></div>
              </>
            ) : (
              <>
                <b className="ep-title">{L.modalTitle}</b>
                <label className="ep-field">{L.what}
                  <input value={title} maxLength={80} placeholder={L.ph} onChange={(e) => setTitle(e.target.value)} />
                </label>
                <div className="ch-days">
                  {[7, 14, 30].map((d) => (
                    <button key={d} type="button" className={`chip${days === d ? ' on' : ''}`} onClick={() => setDays(d)}>{(L.daysFmt || '{d}').replace('{d}', d)}</button>
                  ))}
                </div>
                <p className="ep-hint">{L.together}</p>
                {err && <p className="ep-err">{err}</p>}
                <div className="crop-actions">
                  <button type="button" className="ghost-btn" onClick={() => setOpen(false)} disabled={busy}>{L.cancel}</button>
                  <button type="button" className="cta grow" onClick={send} disabled={busy || title.trim().length < 3}>{busy ? L.sending : L.send}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
