'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

const ORDER = ['step', 'win', 'setback', 'learned'];

export default function Composer({ journeyId, nextDay, labels, t }) {
  const [text, setText] = useState('');
  const [kind, setKind] = useState('step');
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const router = useRouter();

  async function onPickPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${journeyId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('photos').upload(path, file, { upsert: false });
    if (error) { setUploading(false); alert(t.error); return; }
    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    setPhotoUrl(data.publicUrl);
    setUploading(false);
  }

  async function post() {
    const value = text.trim();
    if ((!value && !photoUrl) || saving) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('updates').insert({
      journey_id: journeyId, day_number: nextDay, kind,
      text: value || (photoUrl ? '📷' : ''), photo_url: photoUrl,
    });
    setSaving(false);
    if (error) { alert(t.error); return; }
    setText(''); setKind('step'); setPhotoUrl(null);
    if (fileRef.current) fileRef.current.value = '';
    router.refresh();
  }

  const ph = t.placeholder.replace('{n}', nextDay);

  return (
    <div className="composer2">
      <input value={text} onChange={e => setText(e.target.value)} maxLength={180} placeholder={ph}
        onKeyDown={e => { if (e.key === 'Enter') post(); }} />
      {photoUrl && <div className="photo-preview"><img src={photoUrl} alt="" /></div>}
      <div className="composer2-row">
        <div className="kinds">
          {ORDER.map(k => (
            <button key={k} type="button"
              className={`kind${kind === k ? ' active' : ''}${k === 'setback' ? ' setback' : ''}`}
              onClick={() => setKind(k)}>{labels[k]}</button>
          ))}
          <button type="button" className="kind photo" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? t.uploading : (photoUrl ? t.photoAdded : t.addPhoto)}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickPhoto} />
        </div>
        <button className="post-btn" onClick={post} disabled={saving || (!text.trim() && !photoUrl)}>
          {saving ? t.posting : t.post}
        </button>
      </div>
      {kind === 'setback' && <p className="setback-note">{t.setbackNote}</p>}
    </div>
  );
}
