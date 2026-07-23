'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';

export default function EditBanner({ userId, label, uploadingLabel }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function onPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const supabase = createClient();
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `banners/${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('photos').upload(path, file, { upsert: false });
    if (!error) {
      const url = supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
      await supabase.from('profiles').update({ banner_url: url }).eq('id', userId);
      router.refresh();
    }
    setBusy(false);
    if (ref.current) ref.current.value = '';
  }

  return (
    <>
      <button className="edit-banner" onClick={() => ref.current?.click()} disabled={busy}>
        {busy ? uploadingLabel : label}
      </button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={onPick} />
    </>
  );
}
