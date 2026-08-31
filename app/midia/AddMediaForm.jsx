'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import ImageCropper from '../../components/ImageCropper';
import TrackPicker from '../home/TrackPicker';
import { duracaoDoVideo } from '../../lib/media';

const MAX_VIDEO = 60 * 1024 * 1024;

function trackFields(track) {
  if (!track) return {};
  return {
    track_title: track.title,
    track_artist: track.artist,
    track_audio_url: track.audio_url,
    track_id: track.id,
    track_start_seconds: Number(track.start_seconds) || 0,
    track_duration_seconds: Number(track.duration_seconds) || 30,
    track_full: !!track.full,
  };
}

function removeTrackFields(row, keepLegacy = false) {
  const clean = { ...row };
  const fields = keepLegacy
    ? ['track_id', 'track_start_seconds', 'track_duration_seconds', 'track_full']
    : ['track_title', 'track_artist', 'track_audio_url', 'track_id', 'track_start_seconds', 'track_duration_seconds', 'track_full'];
  fields.forEach((key) => delete clean[key]);
  return clean;
}

export default function AddMediaForm({ userId, journeys, t }) {
  const L = t || {};
  const list = journeys || [];
  const dayFor = (j) => Math.max(1, Math.floor((Date.now() - new Date(j.created_at).getTime()) / 86400000) + 1);
  const [dest, setDest] = useState(list.length ? 'journey' : 'album');
  const [journeyId, setJourneyId] = useState(list[0]?.id || '');
  const [day, setDay] = useState(list[0] ? String(dayFor(list[0])) : '1');
  const [visibility, setVisibility] = useState('public');
  const [desc, setDesc] = useState('');
  const [url, setUrl] = useState('');
  const [kind, setKind] = useState('photo');
  const [videoDuration, setVideoDuration] = useState(0);
  const [track, setTrack] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rawFile, setRawFile] = useState(null);
  const [rawUrl, setRawUrl] = useState('');
  const fileRef = useRef(null);
  const router = useRouter();

  function onJourney(id) {
    setJourneyId(id);
    const j = list.find((x) => x.id === id);
    if (j) setDay(String(dayFor(j)));
  }

  async function store(fileOrBlob, ext) {
    const supabase = createClient();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('photos').upload(path, fileOrBlob, { upsert: false });
    if (error) return null;
    return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
  }

  async function onFile(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const isVideo = file.type.startsWith('video');
    if (isVideo) {
      if (file.size > MAX_VIDEO) { alert(L.videoTooBig); e.target.value = ''; return; }
      const duration = await duracaoDoVideo(file);
      setUploading(true);
      const u = await store(file, (file.name.split('.').pop() || 'mp4').toLowerCase());
      setUploading(false);
      if (!u) { alert(L.error); return; }
      setUrl(u); setKind('video'); setVideoDuration(duration); return;
    }
    // foto → abre o enquadrador antes de subir
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
    const u = await store(toUpload, ext);
    setUploading(false);
    if (!u) { alert(L.error); return; }
    setUrl(u); setKind('photo'); setVideoDuration(0); // mantém rawFile p/ reeditar enquadramento
  }
  function onCropCancel() {
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawUrl('');
    if (!url) { setRawFile(null); if (fileRef.current) fileRef.current.value = ''; }
  }
  function reframe() {
    if (!rawFile) return;
    setRawUrl(URL.createObjectURL(rawFile));
  }
  async function submit() {
    if (!url || saving) return;
    setSaving(true);
    const supabase = createClient();
    let error;
    if (dest === 'journey' && journeyId) {
      const d = Math.max(1, parseInt(day || '1', 10) || 1);
      const updateRow = {
        journey_id: journeyId, day_number: d, kind: 'step',
        text: desc.trim() || (kind === 'video' ? '🎥' : '📷'),
        photo_url: kind === 'photo' ? url : null, video_url: kind === 'video' ? url : null,
        ...trackFields(track),
      };
      ({ error } = await supabase.from('updates').insert(updateRow));
      if (error && /track_/.test(error.message || '')) {
        ({ error } = await supabase.from('updates').insert(removeTrackFields(updateRow, true)));
      }
    } else {
      let mediaRow = { user_id: userId, url, kind, visibility, caption: desc.trim() || null, ...trackFields(track) };
      for (let attempt = 0; attempt < 3; attempt += 1) {
        ({ error } = await supabase.from('media').insert(mediaRow));
        if (!error) break;
        const message = error.message || '';
        if (/track_/.test(message) && mediaRow.track_audio_url) {
          mediaRow = removeTrackFields(mediaRow);
          continue;
        }
        if (/caption|column/i.test(message) && 'caption' in mediaRow) {
          const { caption: _caption, ...withoutCaption } = mediaRow;
          mediaRow = withoutCaption;
          continue;
        }
        break;
      }
    }
    setSaving(false);
    if (error) { alert((L.error || 'Erro') + (error.message ? '\n\n' + error.message : '')); return; }
    router.push('/perfil'); router.refresh();
  }

  return (
    <div className="media-form">
      {rawUrl ? (
        <ImageCropper src={rawUrl} labels={L.crop || {}} onDone={onCropDone} onCancel={onCropCancel} />
      ) : !url ? (
        <button type="button" className="media-drop" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? L.uploading : L.pick}
        </button>
      ) : (
        <div className="media-preview">
          {kind === 'video' ? <video src={url} controls playsInline /> : <img src={url} alt="" />}
          <div className="media-preview-actions">
            {rawFile && kind === 'photo' && <button type="button" className="tiny-link" onClick={reframe}>{(L.crop || {}).edit || 'Editar enquadramento'}</button>}
            <button type="button" className="tiny-link" onClick={() => { setUrl(''); setRawFile(null); }}>{L.replace}</button>
          </div>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={onFile} />

      {url && (
        <>
          <div className="field-label" style={{ marginTop: 16 }}>{L.destTitle}</div>
          <div className="vis-pick">
            {list.length > 0 && (
              <button type="button" className={`vis-opt${dest === 'journey' ? ' on' : ''}`} onClick={() => setDest('journey')}>
                <b>{L.destJourney}</b><span>{L.destJourneySub}</span>
              </button>
            )}
            <button type="button" className={`vis-opt${dest === 'album' ? ' on' : ''}`} onClick={() => setDest('album')}>
              <b>{L.destAlbum}</b><span>{L.destAlbumSub}</span>
            </button>
          </div>

          {dest === 'journey' && list.length > 0 && (
            <div className="media-row2">
              <label>{L.whichJourney}
                <select value={journeyId} onChange={(e) => onJourney(e.target.value)}>
                  {list.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
                </select>
              </label>
              <label>{L.whichDay}
                <input type="number" min="1" value={day} onChange={(e) => setDay(e.target.value)} />
              </label>
            </div>
          )}

          {dest === 'album' && (
            <div className="media-row2">
              <label>{L.whoSees}
                <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                  <option value="public">{L.pubPublic}</option>
                  <option value="followers">{L.pubFollowers}</option>
                  <option value="private">{L.pubPrivate}</option>
                </select>
              </label>
            </div>
          )}

          <div className="field-label" style={{ marginTop: 16 }}>{L.captionLabel}</div>
          <textarea className="media-caption" value={desc} onChange={e => setDesc(e.target.value)} maxLength={300} placeholder={L.captionPh} rows={3} />
          <div className="media-music-field">
            <span className="field-label">{L.musicTitle}</span>
            <div className="composer-toolbar"><div className="tools">
              <TrackPicker selected={track} onSelect={setTrack} videoDuration={videoDuration} labels={L.music} />
            </div></div>
          </div>
          <button className="cta wide grow" onClick={submit} disabled={saving || uploading} style={{ marginTop: 14 }}>{saving ? L.saving : L.save}</button>
        </>
      )}
    </div>
  );
}
