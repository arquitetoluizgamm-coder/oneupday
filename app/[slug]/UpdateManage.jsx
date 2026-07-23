'use client';
import { useState, useRef } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function UpdateManage({ updateId, hasMedia, labels }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  async function replace(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    const isVideo = file.type.startsWith('video');
    const ext = (file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg')).toLowerCase();
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('photos').upload(path, file, { upsert: false });
    if (error) { setBusy(false); alert(labels.error); return; }
    const url = supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
    const patch = isVideo ? { video_url: url, photo_url: null } : { photo_url: url, video_url: null };
    await supabase.from('updates').update(patch).eq('id', updateId);
    location.reload();
  }

  async function removeMedia() {
    setBusy(true);
    const supabase = createClient();
    await supabase.from('updates').update({ photo_url: null, video_url: null }).eq('id', updateId);
    location.reload();
  }

  async function del() {
    if (!confirm(labels.deleteConfirm)) return;
    setBusy(true);
    const supabase = createClient();
    await supabase.from('updates').delete().eq('id', updateId);
    location.reload();
  }

  return (
    <div className="upd-manage">
      <button type="button" className="upd-dots" onClick={() => setOpen(o => !o)} disabled={busy} aria-label={labels.manage}>⋯</button>
      {open && (
        <div className="upd-menu">
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}>{labels.replace}</button>
          {hasMedia && <button type="button" onClick={removeMedia} disabled={busy}>{labels.remove}</button>}
          <button type="button" className="danger" onClick={del} disabled={busy}>{labels.delete}</button>
          <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={replace} />
        </div>
      )}
      {busy && <span className="upd-busy">{labels.uploading}</span>}
    </div>
  );
}
