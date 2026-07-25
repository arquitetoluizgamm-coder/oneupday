'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';

export default function EditProfileInfo({ userId, initialName, initialHandle, labels }) {
  const L = labels || {};
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName || '');
  const [handle, setHandle] = useState((initialHandle || '').replace(/^@/, ''));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const router = useRouter();

  async function save() {
    if (busy) return;
    setErr('');
    const cleanName = name.trim();
    const cleanHandle = handle.trim().toLowerCase().replace(/^@/, '');
    if (!cleanName) { setErr(L.errName); return; }
    if (!/^[a-z0-9._]{3,20}$/.test(cleanHandle)) { setErr(L.errHandle); return; }
    setBusy(true);
    const sb = createClient();
    const full = '@' + cleanHandle;
    if (full !== initialHandle) {
      const { data: taken } = await sb.from('profiles').select('id').eq('handle', full).neq('id', userId).maybeSingle();
      if (taken) { setErr(L.errTaken); setBusy(false); return; }
    }
    const { error } = await sb.from('profiles').update({ name: cleanName, handle: full }).eq('id', userId);
    setBusy(false);
    if (error) { setErr(L.errSave); return; }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button type="button" className="ghost-btn" onClick={() => setOpen(true)}>{L.btn}</button>
      {open && (
        <div className="crop-modal" role="dialog" aria-modal="true" onClick={() => !busy && setOpen(false)}>
          <div className="crop-modal-card ep-card" onClick={(e) => e.stopPropagation()}>
            <b className="ep-title">{L.title}</b>
            <label className="ep-field">{L.name}
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
            </label>
            <label className="ep-field">{L.handle}
              <div className="ep-handle"><span>@</span>
                <input value={handle} onChange={(e) => setHandle(e.target.value)} maxLength={20} autoCapitalize="none" autoCorrect="off" />
              </div>
            </label>
            <p className="ep-hint">{L.hint}</p>
            {err && <p className="ep-err">{err}</p>}
            <div className="crop-actions">
              <button type="button" className="ghost-btn" onClick={() => setOpen(false)} disabled={busy}>{L.cancel}</button>
              <button type="button" className="cta grow" onClick={save} disabled={busy}>{busy ? L.saving : L.save}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
