'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import TrackPicker from './TrackPicker';
import { track } from '../../lib/track';

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

export default function Composer({ journeyId, startDate, labels, t, aiOn }) {
  const [text, setText] = useState('');
  const [kind, setKind] = useState('step');
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [track, setTrack] = useState(null);
  const [aiErr, setAiErr] = useState('');
  const photoRef = useRef(null);
  const videoRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const el = inputRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 220) + 'px'; }
  }, [text]);


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

  async function aiSoftWrite() { await aiWrite(); }
  async function aiSmallStep() {
    if (saving || uploading) return;
    setSaving(true); setAiErr('');
    try {
      const r = await fetch('/api/assist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'nextstep', journeyId, draft: text }) });
      if (r.status === 429) { setAiErr(t.aiRateErr); setSaving(false); return; }
      if (!r.ok) { setAiErr(t.aiErr); setSaving(false); return; }
      const j = await r.json();
      if (j.text) setText(j.text); else setAiErr(t.aiErr);
    } catch { setAiErr(t.aiErr); }
    setSaving(false);
  }

  async function aiWrite() {
    if (saving || uploading) return;
    setSaving(true); setAiErr('');
    try {
      const r = await fetch('/api/assist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'write', journeyId, draft: text }) });
      if (r.status === 429) { setAiErr(t.aiRateErr); setSaving(false); return; }
      if (!r.ok) { setAiErr(t.aiErr); setSaving(false); return; }
      const j = await r.json();
      if (j.text) setText(j.text); else setAiErr(t.aiErr);
    } catch { setAiErr(t.aiErr); }
    setSaving(false);
  }

  async function quick(kind, defaultText) {
    if (saving || uploading) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('updates').insert({ journey_id: journeyId, day_number: dayNumber, kind, text: defaultText });
    setSaving(false);
    if (error) { alert(t.error); return; }
    track('update_posted', { journeyId, kind, quick: true });
    router.refresh();
  }

  async function post() {
    const value = text.trim();
    if ((!value && !photoUrl && !videoUrl) || saving) return;
    setSaving(true);
    const supabase = createClient();
    const fallback = photoUrl ? '📷' : (videoUrl ? '🎥' : '');
    const row = {
      journey_id: journeyId, day_number: dayNumber, kind,
      text: value || fallback, photo_url: photoUrl, video_url: videoUrl,
    };
    if (track) { row.track_title = track.title; row.track_artist = track.artist; row.track_audio_url = track.audio_url; }
    const { error } = await supabase.from('updates').insert(row);
    setSaving(false);
    if (error) { alert(t.error); return; }
    track('update_posted', { journeyId, kind });
    setText(''); setKind('step'); setPhotoUrl(null); setVideoUrl(null); setTrack(null);
    if (photoRef.current) photoRef.current.value = '';
    if (videoRef.current) videoRef.current.value = '';
    router.refresh();
  }

  const showCare = looksRisky(text);
  const dayNumber = Math.max(1, Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000) + 1);
  const ph = t.placeholder.replace('{n}', dayNumber);

  return (
    <div className="composer2">
      <div className="ritual">
        <span className="ritual-q">{t.ritualQ}</span>
        <div className="ritual-btns">
          <button type="button" className="ritual-btn did" onClick={() => quick('win', t.rDidText)} disabled={saving || uploading}>{t.rDid}</button>
          <button type="button" className="ritual-btn tried" onClick={() => quick('step', t.rTriedText)} disabled={saving || uploading}>{t.rTried}</button>
          <button type="button" className="ritual-btn paused" onClick={() => quick('setback', t.rPausedText)} disabled={saving || uploading}>{t.rPaused}</button>
        </div>
      </div>
      {showCare && (
        <div className="care-box" role="note">
          <b>{t.crisisTitle}</b>
          <p>{t.crisisText}</p>
        </div>
      )}
      <textarea ref={inputRef} className="composer2-input" value={text} onChange={e => setText(e.target.value)}
        maxLength={500} placeholder={ph} rows={1}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); post(); } }} />
      {photoUrl && <div className="photo-preview"><img src={photoUrl} alt="" /></div>}
      {videoUrl && <div className="photo-preview"><video src={videoUrl} controls playsInline /></div>}

      <div className="kind-seg">
        {ORDER.map(k => (
          <button key={k} type="button" className={`kseg${kind === k ? ' on' : ''} k-${k}`} onClick={() => setKind(k)}>{labels[k]}</button>
        ))}
      </div>

      <div className="composer-toolbar">
        <div className="tools">
          <button type="button" className={`tool${photoUrl ? ' set' : ''}`} title={t.addPhoto} aria-label={t.addPhoto} onClick={() => photoRef.current?.click()} disabled={uploading}>📷</button>
          <button type="button" className={`tool${videoUrl ? ' set' : ''}`} title={t.addVideo} aria-label={t.addVideo} onClick={() => videoRef.current?.click()} disabled={uploading}>🎬</button>
          <input ref={photoRef} type="file" accept="image/*" hidden onChange={onPickPhoto} />
          <input ref={videoRef} type="file" accept="video/*" hidden onChange={onPickVideo} />
          <TrackPicker selected={track} onSelect={setTrack} labels={{ add: '🎵', title: t.musicTitle, use: t.musicUse, remove: t.musicRemove, empty: t.musicEmpty, searchPh: t.musicSearchPh, keyNeeded: t.musicKeyNeeded }} />
          {aiOn && <button type="button" className="tool ai" title={t.aiWrite} aria-label={t.aiWrite} onClick={aiWrite} disabled={saving || uploading}>✨</button>}
        </div>
        <button className="post-btn" onClick={post} disabled={saving || uploading || (!text.trim() && !photoUrl && !videoUrl)}>
          {saving ? t.posting : t.post}
        </button>
      </div>
      {aiErr && <p className="ai-err">{aiErr}</p>}
      {kind === 'setback' && <p className="setback-note">{t.setbackNote}</p>}
      {aiOn && kind === 'setback' && (
        <div className="ai-context">
          <span className="ai-context-q">{t.aiCareQ}</span>
          <div className="ai-context-btns">
            <button type="button" onClick={aiSoftWrite} disabled={saving || uploading}>{t.aiCareLight}</button>
            <button type="button" onClick={aiSmallStep} disabled={saving || uploading}>{t.aiCareStep}</button>
          </div>
        </div>
      )}
    </div>
  );
}
