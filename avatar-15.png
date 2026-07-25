'use client';
import { useState } from 'react';
import { createClient } from '../lib/supabase/client';

// "Eu também" — identificação, não admiração. Anônimo para o autor.
export default function MeTooButton({ updateId, labels }) {
  const L = labels || {};
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function send(msgKey) {
    if (busy || done) return;
    setBusy(true);
    try {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      await sb.from('me_too').insert({ update_id: updateId, user_id: user.id, msg_key: msgKey });
      setDone(true);
    } catch {}
    setBusy(false);
    setOpen(false);
  }

  return (
    <div className="metoo-wrap">
      <button type="button" className={`metoo-btn${done ? ' on' : ''}`} onClick={() => !done && setOpen((o) => !o)} aria-label={L.meToo}>
        {done ? L.meTooDone : L.meToo}
      </button>
      {open && !done && (
        <div className="metoo-pop">
          <b>{L.meTooQ}</b>
          <button type="button" onClick={() => send('back')} disabled={busy}>{L.meTooBack}</button>
          <button type="button" onClick={() => send('trying')} disabled={busy}>{L.meTooTrying}</button>
          <button type="button" onClick={() => send('hard')} disabled={busy}>{L.meTooHard}</button>
          <button type="button" className="metoo-just" onClick={() => send('metoo')} disabled={busy}>{L.meTooJust}</button>
        </div>
      )}
    </div>
  );
}
