'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import TrackPicker from './TrackPicker';
import ImageCropper from '../../components/ImageCropper';
import { track as trackEvent } from '../../lib/track';

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

function ToolIcon({ type }) {
  const paths = {
    photo: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8" cy="9" r="1.4" /><path d="m4 17 4.5-4 3 2.5 2.2-2 6.3 5.5" /></>,
    video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3z" /></>,
    ai: <><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4z" /><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6z" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[type]}</svg>;
}

export default function Composer({ journeyId, startDate, labels, t, aiOn }) {
  const [text, setText] = useState('');
  const [kind, setKind] = useState('step');
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [track, setTrack] = useState(null);
  const [aiErr, setAiErr] = useState('');
  const [posted, setPosted] = useState(false);
  const [envText, setEnvText] = useState('');
  const [envBusy, setEnvBusy] = useState(false);
  const [rawFile, setRawFile] = useState(null);
  const [rawUrl, setRawUrl] = useState('');
  const photoRef = useRef(null);
  const videoRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const el = inputRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 220) + 'px'; }
  }, [text]);


  async function upload(file, extOverride) {
    const supabase = createClient();
    const ext = (extOverride || file.name?.split('.').pop() || 'bin').toLowerCase();
    const path = `${journeyId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('photos').upload(path, file, { upsert: false });
    if (error) return null;
    return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
  }

  function onPickPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawFile(file);
    setRawUrl(URL.createObjectURL(file));
  }
  async function onCropDone(result) {
    let toUpload, ext;
    if (result === 'original' || !result) { toUpload = rawFile; ext = (rawFile?.name.split('.').pop() || 'jpg').toLowerCase(); }
    else { toUpload = result; ext = 'jpg'; }
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawUrl('');
    if (!toUpload) return;
    setUploading(true);
    const url = await upload(toUpload, ext);
    setUploading(false);
    if (!url) { alert(t.error); return; }
    setPhotoUrl(url); setVideoUrl(null);
    if (videoRef.current) videoRef.current.value = '';
  }
  function onCropCancel() {
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawUrl('');
    if (!photoUrl) { setRawFile(null); if (photoRef.current) photoRef.current.value = ''; }
  }
  function reframe() { if (rawFile) setRawUrl(URL.createObjectURL(rawFile)); }

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
    trackEvent('update_posted', { journeyId, kind, quick: true });
    setPosted(true);
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
    trackEvent('update_posted', { journeyId, kind });
    setText(''); setKind('step'); setPhotoUrl(null); setVideoUrl(null); setTrack(null);
    if (photoRef.current) photoRef.current.value = '';
    if (videoRef.current) videoRef.current.value = '';
    setPosted(true);
  }

  async function doneEnvelope(save) {
    if (envBusy) return;
    setEnvBusy(true);
    if (save && envText.trim()) {
      try {
        const sb = createClient();
        const { data: { user } } = await sb.auth.getUser();
        if (user) await sb.from('envelopes').insert({ user_id: user.id, journey_id: journeyId, text: envText.trim().slice(0, 200) });
      } catch {}
    }
    setEnvBusy(false);
    setPosted(false); setEnvText('');
    router.refresh();
  }

  const showCare = looksRisky(text);
  const dayNumber = Math.max(1, Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000) + 1);
  const ph = t.placeholder.replace('{n}', dayNumber);

  if (posted) {
    return (
      <div className="composer2 env-box">
        <span className="env-eyebrow">💌 {t.env?.q}</span>
        <textarea className="env-input" value={envText} onChange={e => setEnvText(e.target.value)}
          maxLength={200} placeholder={t.env?.ph} rows={2} autoFocus />
        <div className="env-actions">
          <button type="button" className="ghost-btn" onClick={() => doneEnvelope(false)} disabled={envBusy}>{t.env?.skip}</button>
          <button type="button" className="cta" onClick={() => doneEnvelope(true)} disabled={envBusy || !envText.trim()}>{t.env?.save}</button>
        </div>
      </div>
    );
  }

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
      {!text.trim() && Array.isArray(t.prompts) && t.prompts.length > 0 && (
        <div className="composer-prompts">
          {t.prompts.map((pr, i) => (
            <button type="button" key={i} className="prompt-chip" onClick={() => { setText(pr + ' '); inputRef.current?.focus(); }}>{pr}</button>
          ))}
        </div>
      )}
      {photoUrl && (
        <div className="photo-preview">
          <img src={photoUrl} alt="" />
          {rawFile && <button type="button" className="tiny-link" onClick={reframe}>{(t.crop || {}).edit || 'Editar enquadramento'}</button>}
        </div>
      )}
      {videoUrl && <div className="photo-preview"><video src={videoUrl} controls playsInline /></div>}
      {rawUrl && (
        <div className="crop-modal" role="dialog" aria-modal="true">
          <div className="crop-modal-card">
            <ImageCropper src={rawUrl} labels={t.crop || {}} onDone={onCropDone} onCancel={onCropCancel} />
          </div>
        </div>
      )}

      <div className="kind-seg">
        {ORDER.map(k => (
          <button key={k} type="button" className={`kseg${kind === k ? ' on' : ''} k-${k}`} onClick={() => setKind(k)}>{labels[k]}</button>
        ))}
      </div>

      <div className="composer-toolbar">
        <div className="tools">
          <button type="button" className={`tool${photoUrl ? ' set' : ''}`} title={t.addPhoto} aria-label={t.addPhoto} onClick={() => photoRef.current?.click()} disabled={uploading}><ToolIcon type="photo" /></button>
          <button type="button" className={`tool${videoUrl ? ' set' : ''}`} title={t.addVideo} aria-label={t.addVideo} onClick={() => videoRef.current?.click()} disabled={uploading}><ToolIcon type="video" /></button>
          <input ref={photoRef} type="file" accept="image/*" hidden onChange={onPickPhoto} />
          <input ref={videoRef} type="file" accept="video/*" hidden onChange={onPickVideo} />
          <TrackPicker selected={track} onSelect={setTrack} labels={{ add: '🎵', title: t.musicTitle, use: t.musicUse, remove: t.musicRemove, empty: t.musicEmpty, searchPh: t.musicSearchPh, keyNeeded: t.musicKeyNeeded }} />
          {aiOn && <button type="button" className="tool ai" title={t.aiWrite} aria-label={t.aiWrite} onClick={aiWrite} disabled={saving || uploading}><ToolIcon type="ai" /></button>}
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
