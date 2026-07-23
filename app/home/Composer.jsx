'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

const ORDER = ['step', 'win', 'setback', 'learned'];

// Frases que podem indicar sofrimento intenso — mostra apoio, nunca bloqueia.
const RISK = [
  'nao aguento mais', 'não aguento mais', 'quero morrer', 'não quero mais viver', 'nao quero mais viver',
  'me matar', 'tirar minha vida', 'acabar com tudo', 'quero sumir', 'quero desaparecer', 'me machucar',
  'sem saida', 'sem saída', 'desistir de tudo', 'nao vale a pena viver', 'não vale a pena viver',
  'i want to die', 'kill myself', 'end it all', 'hurt myself', 'cant go on', "can't go on", 'no reason to live',
];
function looksRisky(t) {
  const x = (t || '').toLowerCase();
  return RISK.some(w => x.includes(w));
}
const MAX_VIDEO = 60 * 1024 * 1024; // 60MB

export default function Composer({ journeyId, startDate, labels, t }) {
  const [text, setText] = useState('');
  const [kind, setKind] = useState('step');
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const photoRef = useRef(null);
  const videoRef = useRef(null);
  const router = useRouter();

  async function upload(file) {
    const supabase = createClient();
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
    const path = `${journeyId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('photos').upload(path, file, { upsert: false });
    if (error) return null;
    return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
  }

  async function onPickPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await upload(file);
    setUploading(false);
    if (!url) { alert(t.error); return; }
    setPhotoUrl(url); setVideoUrl(null);
    if (videoRef.current) videoRef.current.value = '';
  }

  async function onPickVideo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_VIDEO) { alert(t.videoTooBig); e.target.value = ''; return; }
    setUploading(true);
    const url = await upload(file);
    setUploading(false);
    if (!url) { alert(t.error); return; }
    setVideoUrl(url); setPhotoUrl(null);
    if (photoRef.current) photoRef.current.value = '';
  }

  async function post() {
    const value = text.trim();
    if ((!value && !photoUrl && !videoUrl) || saving) return;
    setSaving(true);
    const supabase = createClient();
    const fallback = photoUrl ? '📷' : (videoUrl ? '🎥' : '');
    const { error } = await supabase.from('updates').insert({
      journey_id: journeyId, day_number: dayNumber, kind,
      text: value || fallback, photo_url: photoUrl, video_url: videoUrl,
    });
    setSaving(false);
    if (error) { alert(t.error); return; }
    setText(''); setKind('step'); setPhotoUrl(null); setVideoUrl(null);
    if (photoRef.current) photoRef.current.value = '';
    if (videoRef.current) videoRef.current.value = '';
    router.refresh();
  }

  const showCare = looksRisky(text);
  const dayNumber = Math.max(1, Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000) + 1);
  const ph = t.placeholder.replace('{n}', dayNumber);

  return (
    <div className="composer2">
      {showCare && (
        <div className="care-box" role="note">
          <b>{t.crisisTitle}</b>
          <p>{t.crisisText}</p>
        </div>
      )}
      <input value={text} onChange={e => setText(e.target.value)} maxLength={180} placeholder={ph}
        onKeyDown={e => { if (e.key === 'Enter') post(); }} />
      {photoUrl && <div className="photo-preview"><img src={photoUrl} alt="" /></div>}
      {videoUrl && <div className="photo-preview"><video src={videoUrl} controls playsInline /></div>}
      <div className="composer2-row">
        <div className="kinds">
          {ORDER.map(k => (
            <button key={k} type="button"
              className={`kind${kind === k ? ' active' : ''}${k === 'setback' ? ' setback' : ''}`}
              onClick={() => setKind(k)}>{labels[k]}</button>
          ))}
          <button type="button" className="kind photo" onClick={() => photoRef.current?.click()} disabled={uploading}>
            {uploading ? t.uploading : (photoUrl ? t.photoAdded : t.addPhoto)}
          </button>
          <button type="button" className="kind photo" onClick={() => videoRef.current?.click()} disabled={uploading}>
            {uploading ? t.uploading : (videoUrl ? t.videoAdded : t.addVideo)}
          </button>
          <input ref={photoRef} type="file" accept="image/*" hidden onChange={onPickPhoto} />
          <input ref={videoRef} type="file" accept="video/*" hidden onChange={onPickVideo} />
        </div>
        <button className="post-btn" onClick={post} disabled={saving || (!text.trim() && !photoUrl && !videoUrl)}>
          {saving ? t.posting : t.post}
        </button>
      </div>
      {kind === 'setback' && <p className="setback-note">{t.setbackNote}</p>}
    </div>
  );
}
