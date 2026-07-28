'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';
import ImageCropper from './ImageCropper';

// ============================================================
// TROCAR FOTO DO PERFIL
//
// Era uma camerinha grudada na borda do avatar. Ficava por cima
// da foto da pessoa, competindo com ela, e num toque errado
// abria o seletor de arquivo sem querer.
//
// Agora mora atras da engrenagem, na mesma lista de "trocar
// capa" e "editar perfil" — que é onde a pessoa procura quando
// quer mudar alguma coisa dela.
//
// `modo="linha"` desenha como item de menu; sem ele, continua
// sendo o botao redondo (nada mais usa hoje, mas nao custa).
// ============================================================
export default function EditAvatar({ userId, label, uploadingLabel, modo, errorLabel, dialogLabel, cropLabels }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');
  const [rawUrl, setRawUrl] = useState('');
  const [rawFile, setRawFile] = useState(null);
  const router = useRouter();
  async function onPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro('');
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
    try {
      const supabase = createClient();
      const path = `avatars/${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('photos').upload(path, toUpload, { upsert: false });
      if (error) throw error;
      const url = supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
      const { error: profileError } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId);
      if (profileError) throw profileError;
      window.dispatchEvent(new CustomEvent('oud:profile-updated', { detail: { userId, avatar_url: url } }));
      router.refresh();
    } catch (e) {
      console.error('[perfil] avatar:', e);
      setErro(errorLabel || 'Could not update the photo. Try again.');
    }
    setBusy(false);
    if (ref.current) ref.current.value = '';
  }
  function onCropCancel() {
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawUrl(''); setRawFile(null);
    if (ref.current) ref.current.value = '';
  }
  return (
    <>
      {modo === 'linha' ? (
        <button type="button" className="ghost-btn" onClick={() => ref.current?.click()} disabled={busy}>
          {busy ? (uploadingLabel || label) : label}
        </button>
      ) : (
        <button type="button" className="edit-avatar" onClick={() => ref.current?.click()} disabled={busy} title={label} aria-label={label}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" hidden onChange={onPick} />
      {erro && <span className="profile-upload-error" role="alert">{erro}</span>}
      {rawUrl && (
        <div className="crop-modal" role="dialog" aria-modal="true" aria-label={dialogLabel || 'Adjust profile photo'}>
          <div className="crop-modal-card">
            <ImageCropper src={rawUrl} labels={cropLabels || {}} aspects={[['square', 1], ['original', null]]} onDone={onCropDone} onCancel={onCropCancel} />
          </div>
        </div>
      )}
    </>
  );
}
