'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';
import ImageCropper from './ImageCropper';

export default function EditBanner({ userId, label, uploadingLabel, cropLabels, modo, errorLabel }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [rawUrl, setRawUrl] = useState('');
  const [rawFile, setRawFile] = useState(null);
  const [erro, setErro] = useState('');
  const router = useRouter();

  function onPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro('');
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawFile(file);
    setRawUrl(URL.createObjectURL(file));
  }

  async function onCropDone(result) {
    let toUpload, ext;
    if (result === 'original' || !result) { toUpload = rawFile; ext = (rawFile?.name.split('.').pop() || 'jpg').toLowerCase(); }
    else { toUpload = result; ext = 'jpg'; }
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawUrl(''); setRawFile(null);
    if (!toUpload) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const path = `banners/${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('photos').upload(path, toUpload, { upsert: false });
      if (error) throw error;
      const url = supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
      const { error: profileError } = await supabase.from('profiles').update({ banner_url: url }).eq('id', userId);
      if (profileError) throw profileError;
      router.refresh();
    } catch (e) {
      console.error('[perfil] capa:', e);
      setErro(errorLabel || 'Could not update the cover. Try again.');
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
      <button type="button" className={modo === 'linha' ? 'ghost-btn' : 'edit-banner'} onClick={() => ref.current?.click()} disabled={busy}>
        {busy ? uploadingLabel : label}
      </button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={onPick} />
      {erro && <span className="profile-upload-error" role="alert">{erro}</span>}
      {rawUrl && (
        <div className="crop-modal" role="dialog" aria-modal="true">
          <div className="crop-modal-card">
            <ImageCropper src={rawUrl} labels={cropLabels || {}} aspects={[['cover', 16 / 6]]} onDone={onCropDone} onCancel={onCropCancel} />
          </div>
        </div>
      )}
    </>
  );
}
