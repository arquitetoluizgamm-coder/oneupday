'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';
import ImageCropper from './ImageCropper';

export default function EditJourney({ journey, labels }) {
  const L = labels || {};
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(journey.title || '');
  const [goal, setGoal] = useState(journey.goal || '');
  const [coverUrl, setCoverUrl] = useState(journey.cover_url || '');
  const [rawUrl, setRawUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef(null);
  const router = useRouter();

  function onPick(e) {
    const file = e.target.files?.[0]; if (!file) return;
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawUrl(URL.createObjectURL(file));
  }

  async function onCropDone(result) {
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawUrl('');
    if (!result || result === 'original') return;
    setBusy(true);
    const sb = createClient();
    const path = `covers/${journey.id}/${crypto.randomUUID()}.jpg`;
    const { error } = await sb.storage.from('photos').upload(path, result, { upsert: false });
    setBusy(false);
    if (error) { setErr(L.errSave); return; }
    setCoverUrl(sb.storage.from('photos').getPublicUrl(path).data.publicUrl);
  }

  async function save() {
    if (busy) return;
    setErr('');
    const cleanTitle = title.trim();
    if (!cleanTitle) { setErr(L.errTitle); return; }
    setBusy(true);
    const sb = createClient();
    const patch = { title: cleanTitle, goal: goal.trim(), cover_url: coverUrl || null };
    let { error } = await sb.from('journeys').update(patch).eq('id', journey.id);
    if (error && /cover_url|column/i.test(error.message || '')) {
      const { cover_url: _c, ...noCover } = patch;
      ({ error } = await sb.from('journeys').update(noCover).eq('id', journey.id));
    }
    setBusy(false);
    if (error) { setErr(L.errSave); return; }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button type="button" className="view-link" onClick={() => setOpen(true)}>{L.btn}</button>
      {open && (
        <div className="crop-modal" role="dialog" aria-modal="true" onClick={() => !busy && !rawUrl && setOpen(false)}>
          <div className="crop-modal-card ep-card" onClick={(e) => e.stopPropagation()}>
            {rawUrl ? (
              <ImageCropper src={rawUrl} aspects={[['card', 16 / 10]]}
                labels={{ use: L.cropUse, cancel: L.cropCancel, hint: L.cropHint, zoom: L.cropZoom }}
                onDone={onCropDone} onCancel={() => { URL.revokeObjectURL(rawUrl); setRawUrl(''); }} />
            ) : (
              <>
                <b className="ep-title">{L.title}</b>
                <label className="ep-field">{L.name}
                  <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
                </label>
                <label className="ep-field">{L.goal}
                  <textarea className="ej-goal" value={goal} onChange={(e) => setGoal(e.target.value)} maxLength={300} rows={3} />
                </label>
                <div className="ep-field">{L.cover}
                  <div className="ej-cover" style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : { background: `linear-gradient(135deg, var(--night), ${journey.cover_color || '#84917A'})` }}>
                    <button type="button" className="ej-cover-btn" onClick={() => fileRef.current?.click()} disabled={busy}>{coverUrl ? L.coverChange : L.coverAdd}</button>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
                </div>
                {err && <p className="ep-err">{err}</p>}
                <div className="crop-actions">
                  <button type="button" className="ghost-btn" onClick={() => setOpen(false)} disabled={busy}>{L.cancel}</button>
                  <button type="button" className="cta grow" onClick={save} disabled={busy}>{busy ? L.saving : L.save}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
