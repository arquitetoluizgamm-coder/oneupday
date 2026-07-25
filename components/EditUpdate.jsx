'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';
import ImageCropper from './ImageCropper';

// Editar um dia da jornada: texto + foto (adicionar/trocar/remover) + excluir post.
export default function EditUpdate({ update, labels, onChanged }) {
  const L = labels || {};
  const isPlaceholder = (tx) => tx === '📷' || tx === '🎥';
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(isPlaceholder(update.text) ? '' : (update.text || ''));
  const [photoUrl, setPhotoUrl] = useState(update.photo_url || '');
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
    const path = `updates/${update.id}/${crypto.randomUUID()}.jpg`;
    const { error } = await sb.storage.from('photos').upload(path, result, { upsert: false });
    setBusy(false);
    if (error) { setErr(L.errSave); return; }
    setPhotoUrl(sb.storage.from('photos').getPublicUrl(path).data.publicUrl);
  }

  async function save() {
    if (busy) return;
    setErr('');
    const value = text.trim();
    if (!value && !photoUrl) { setErr(L.errEmpty); return; }
    setBusy(true);
    const sb = createClient();
    const { error } = await sb.from('updates')
      .update({ text: value || '📷', photo_url: photoUrl || null })
      .eq('id', update.id);
    setBusy(false);
    if (error) { setErr(L.errSave); return; }
    setOpen(false);
    if (onChanged) onChanged({ text: value || '📷', photo_url: photoUrl || null });
    router.refresh();
  }

  async function del() {
    if (busy) return;
    if (!window.confirm(L.deleteConfirm)) return;
    setBusy(true);
    const sb = createClient();
    const { error } = await sb.from('updates').delete().eq('id', update.id);
    setBusy(false);
    if (error) { setErr(L.errSave); return; }
    setOpen(false);
    if (onChanged) onChanged(null);
    router.refresh();
  }

  return (
    <>
      <button type="button" className="view-link" onClick={() => setOpen(true)}>{L.btn}</button>
      {open && (
        <div className="crop-modal" role="dialog" aria-modal="true" onClick={() => !busy && !rawUrl && setOpen(false)}>
          <div className="crop-modal-card ep-card" onClick={(e) => e.stopPropagation()}>
            {rawUrl ? (
              <ImageCropper src={rawUrl}
                labels={{ original: L.cropOriginal, square: L.cropSquare, portrait: L.cropPortrait, landscape: L.cropLandscape, use: L.cropUse, cancel: L.cropCancel, hint: L.cropHint, hintOriginal: L.cropHintOriginal, zoom: L.cropZoom }}
                onDone={onCropDone} onCancel={() => { URL.revokeObjectURL(rawUrl); setRawUrl(''); }} />
            ) : (
              <>
                <b className="ep-title">{(L.title || '').replace('{d}', update.day)}</b>
                <label className="ep-field">{L.text}
                  <textarea className="ej-goal" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} rows={4} />
                </label>
                <div className="ep-field">{L.photo}
                  {photoUrl ? (
                    <div className="ej-cover eu-photo" style={{ backgroundImage: `url(${photoUrl})` }}>
                      <div className="ej-cover-actions">
                        <button type="button" className="ej-cover-btn" onClick={() => fileRef.current?.click()} disabled={busy}>{L.photoChange}</button>
                        <button type="button" className="ej-cover-btn ej-cover-del" onClick={() => setPhotoUrl('')} disabled={busy}>{L.photoRemove}</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" className="eu-add-photo" onClick={() => fileRef.current?.click()} disabled={busy}>+ {L.photoAdd}</button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
                </div>
                {err && <p className="ep-err">{err}</p>}
                <div className="crop-actions">
                  <button type="button" className="ghost-btn" onClick={() => setOpen(false)} disabled={busy}>{L.cancel}</button>
                  <button type="button" className="cta grow" onClick={save} disabled={busy}>{busy ? L.saving : L.save}</button>
                </div>
                <button type="button" className="danger-link eu-del" onClick={del} disabled={busy}>{L.deletePost}</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
