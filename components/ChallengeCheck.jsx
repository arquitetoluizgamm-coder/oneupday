'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';
import ImageCropper from './ImageCropper';

// "Fiz hoje" + carimbo do dia com foto (opcional)
export default function ChallengeCheck({ id, userId, label, photoLabel, cropLabels, checkedToday }) {
  const [busy, setBusy] = useState(false);
  const [rawUrl, setRawUrl] = useState('');
  const [rawFile, setRawFile] = useState(null);
  const fileRef = useRef(null);
  const router = useRouter();

  async function send(photoUrl) {
    setBusy(true);
    const r = await fetch('/api/challenge/check', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, photoUrl: photoUrl || null }),
    }).catch(() => null);
    if (r && r.status === 401) { window.location.href = '/login'; return; }
    router.refresh();
    setBusy(false);
  }

  function onPick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawFile(f);
    setRawUrl(URL.createObjectURL(f));
  }

  async function onCropDone(result) {
    const blob = result === 'original' || !result ? rawFile : result;
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawUrl(''); setRawFile(null);
    if (!blob) return;
    setBusy(true);
    const supabase = createClient();
    const path = `challenges/${userId}/${crypto.randomUUID()}.jpg`;
    const { error } = await supabase.storage.from('photos').upload(path, blob, { upsert: false });
    if (!error) {
      const url = supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
      await send(url);
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  function onCropCancel() {
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawUrl(''); setRawFile(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <>
      <div className="chp-checkrow">
        {!checkedToday && (
          <button type="button" className="cta grow chp-check" onClick={() => send(null)} disabled={busy}>{label}</button>
        )}
        <button type="button" className="ghost-btn chp-photo" onClick={() => fileRef.current?.click()} disabled={busy}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="butt" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.4" /></svg>
          {photoLabel}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
      </div>
      {rawUrl && (
        <div className="crop-modal" role="dialog" aria-modal="true">
          <div className="crop-modal-card">
            <ImageCropper src={rawUrl} aspects={[['square', 1]]} labels={cropLabels || {}} onDone={onCropDone} onCancel={onCropCancel} />
          </div>
        </div>
      )}
    </>
  );
}
