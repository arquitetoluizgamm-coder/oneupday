'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';
import ImageCropper from './ImageCropper';
import { textoDaPessoa } from '../lib/registro';
import { ALT_MAX } from '../lib/alt';

// Editar um dia da jornada: texto + foto (adicionar/trocar/remover) + excluir post.
export default function EditUpdate({ update, labels, onChanged }) {
  const L = labels || {};
  const [open, setOpen] = useState(false);
  // Se o texto era do app (emoji de mídia ou frase de botão), o campo
  // abre VAZIO — senão a pessoa editaria uma frase que não escreveu.
  const [text, setText] = useState(textoDaPessoa(update.text));
  const [photoUrl, setPhotoUrl] = useState(update.photo_url || '');
  // A descrição da foto também se edita aqui. Quem publicou às pressas
  // com o rascunho da IA precisa de um lugar para corrigir depois.
  const [alt, setAlt] = useState(update.alt || '');
  const [rawUrl, setRawUrl] = useState('');
  const [rawFile, setRawFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef(null);
  const router = useRouter();

  function onPick(e) {
    const file = e.target.files?.[0]; if (!file) return;
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawFile(file);
    setRawUrl(URL.createObjectURL(file));
  }

  async function onCropDone(result) {
    const toUpload = result === 'original' || !result ? rawFile : result;
    const ext = result === 'original' || !result ? (rawFile?.name.split('.').pop() || 'jpg').toLowerCase() : 'jpg';
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawUrl('');
    setRawFile(null);
    if (!toUpload) return;
    setBusy(true);
    const sb = createClient();
    const path = `updates/${update.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await sb.storage.from('photos').upload(path, toUpload, { upsert: false });
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
    const campos = { text: value || '📷', photo_url: photoUrl || null };
    if (photoUrl) campos.alt = alt.trim().slice(0, ALT_MAX) || null;
    let { error } = await sb.from('updates').update(campos).eq('id', update.id);
    // Mesma rede do compositor: sem o supabase/alt-imagem.sql a coluna não
    // existe e a edição inteira falharia por causa de um campo opcional.
    if (error && /alt/.test(error.message || '') && 'alt' in campos) {
      console.warn('[alt] coluna ausente — rode supabase/alt-imagem.sql');
      const semAlt = { ...campos }; delete semAlt.alt;
      ({ error } = await sb.from('updates').update(semAlt).eq('id', update.id));
    }
    setBusy(false);
    if (error) { setErr(L.errSave); return; }
    setOpen(false);
    const changed = { text: value || '📷', photo_url: photoUrl || null, alt: alt.trim() };
    if (onChanged) onChanged(changed);
    window.dispatchEvent(new CustomEvent('oud:update-updated', { detail: { id: update.id, ...changed } }));
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
              // mesmo motivo do compositor: aqui o corte grava no arquivo
              <ImageCropper src={rawUrl} aspects={[['original', null], ['portrait', 4 / 5], ['square', 1], ['landscape', 16 / 9]]}
                labels={{ original: L.cropOriginal, square: L.cropSquare, portrait: L.cropPortrait, landscape: L.cropLandscape, use: L.cropUse, cancel: L.cropCancel, hint: L.cropHint, hintOriginal: L.cropHintOriginal, zoom: L.cropZoom }}
                onDone={onCropDone} onCancel={() => { URL.revokeObjectURL(rawUrl); setRawUrl(''); setRawFile(null); }} />
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
                {photoUrl && (
                  <label className="ep-field">{L.altLabel}
                    <textarea className="ej-goal" value={alt} maxLength={ALT_MAX} rows={2}
                      placeholder={L.altPh} onChange={(e) => setAlt(e.target.value)} />
                    <span className="alt-dica">{alt.trim() ? L.altOk : L.altVazio}</span>
                  </label>
                )}
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
