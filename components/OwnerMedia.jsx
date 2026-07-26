'use client';
import { useState } from 'react';
import { createClient } from '../lib/supabase/client';
import { comCapa } from '../lib/media';

// Foto/vídeo de um post da jornada, com remoção visível para o dono.
export default function OwnerMedia({ updateId, url, kind, labels }) {
  const L = labels || {};
  const [busy, setBusy] = useState(false);
  const [gone, setGone] = useState(false);
  if (gone) return null;

  async function remove() {
    if (busy) return;
    if (!window.confirm(L.confirm)) return;
    setBusy(true);
    const sb = createClient();
    const patch = kind === 'video' ? { video_url: null } : { photo_url: null };
    const { error } = await sb.from('updates').update(patch).eq('id', updateId);
    setBusy(false);
    if (error) { alert(L.error); return; }
    setGone(true);
  }

  return (
    <div className="update-photo owner-media">
      {kind === 'video'
        ? <video src={comCapa(url)} controls playsInline preload="metadata" />
        : <img src={url} alt="" />}
      <button type="button" className="om-x" onClick={remove} disabled={busy} aria-label={L.remove} title={L.remove}>
        {busy ? '…' : '✕'}
      </button>
    </div>
  );
}
