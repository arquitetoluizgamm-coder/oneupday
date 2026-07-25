'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Carimbo do dia: clica → expande; dono pode remover a foto (a presença fica)
export default function ChallengeStamp({ challengeId, dayKey, photo, today, canRemove, labels }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const L = labels || {};

  async function removePhoto(e) {
    e.stopPropagation();
    if (busy) return;
    if (!window.confirm(L.confirm)) return;
    setBusy(true);
    await fetch('/api/challenge/check', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: challengeId, removePhoto: true, dayKey }),
    }).catch(() => {});
    setOpen(false);
    router.refresh();
    setBusy(false);
  }

  return (
    <>
      <button type="button" className={`chp-stamp${today ? ' today' : ''}`} style={{ backgroundImage: `url(${photo})` }} onClick={() => setOpen(true)} aria-label={dayKey} title={dayKey} />
      {open && (
        <div className="chs-view" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <img src={photo} alt="" onClick={(e) => e.stopPropagation()} />
          <button type="button" className="chs-close" onClick={() => setOpen(false)} aria-label="✕">✕</button>
          {canRemove && (
            <button type="button" className="chs-remove" onClick={removePhoto} disabled={busy}>{L.remove}</button>
          )}
        </div>
      )}
    </>
  );
}
