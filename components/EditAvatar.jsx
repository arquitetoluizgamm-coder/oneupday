'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';

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
export default function EditAvatar({ userId, label, uploadingLabel, modo }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function onPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const supabase = createClient();
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `avatars/${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('photos').upload(path, file, { upsert: false });
    if (!error) {
      const url = supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId);
      router.refresh();
    }
    setBusy(false);
    if (ref.current) ref.current.value = '';
  }
  if (modo === 'linha') {
    return (
      <>
        <button type="button" className="ghost-btn" onClick={() => ref.current?.click()} disabled={busy}>
          {busy ? (uploadingLabel || label) : label}
        </button>
        <input ref={ref} type="file" accept="image/*" hidden onChange={onPick} />
      </>
    );
  }

  return (
    <>
      <button className="edit-avatar" onClick={() => ref.current?.click()} disabled={busy} title={label} aria-label={label}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
      </button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={onPick} />
    </>
  );
}
