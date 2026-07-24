'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

const MAX_VIDEO = 60 * 1024 * 1024;

export default function AddMediaForm({ userId, journeys, t }) {
  const L = t || {};
  const list = journeys || [];
  const dayFor = (j) => Math.max(1, Math.floor((Date.now() - new Date(j.created_at).getTime()) / 86400000) + 1);
  const [dest, setDest] = useState(list.length ? 'journey' : 'album');
  const [journeyId, setJourneyId] = useState(list[0]?.id || '');
  const [day, setDay] = useState(list[0] ? String(dayFor(list[0])) : '1');
  const [visibility, setVisibility] = useState('public');
  const [url, setUrl] = useState('');
  const [kind, setKind] = useState('photo');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);
  const router = useRouter();

  function onJourney(id) {
    setJourneyId(id);
    const j = list.find((x) => x.id === id);
    if (j) setDay(String(dayFor(j)));
  }
  async function onFile(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const isVideo = file.type.startsWith('video');
    if (isVideo && file.size > MAX_VIDEO) { alert(L.videoTooBig); e.target.value = ''; return; }
    setUploading(true);
    const supabase = createClient();
    const ext = (file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg')).toLowerCase();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('photos').upload(path, file, { upsert: false });
    setUploading(false);
    if (error) { alert(L.error); return; }
    setUrl(supabase.storage.from('photos').getPublicUrl(path).data.publicUrl);
    setKind(isVideo ? 'video' : 'photo');
  }
  async function submit() {
    if (!url || saving) return;
    setSaving(true);
    const supabase = createClient();
    let error;
    if (dest === 'journey' && journeyId) {
      const d = Math.max(1, parseInt(day || '1', 10) || 1);
      ({ error } = await supabase.from('updates').insert({
        journey_id: journeyId, day_number: d, kind: 'step',
        text: kind === 'video' ? '🎥' : '📷',
        photo_url: kind === 'photo' ? url : null, video_url: kind === 'video' ? url : null,
      }));
    } else {
      ({ error } = await supabase.from('media').insert({ user_id: userId, url, kind, visibility }));
    }
    setSaving(false);
    if (error) { alert(L.error); return; }
    router.push('/perfil'); router.refresh();
  }

  return (
    <div className="media-form">
      {!url ? (
        <button type="button" className="media-drop" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? L.uploading : L.pick}
        </button>
      ) : (
        <div className="media-preview">
          {kind === 'video' ? <video src={url} controls playsInline /> : <img src={url} alt="" />}
          <button type="button" className="tiny-link" onClick={() => setUrl('')}>{L.replace}</button>
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

          <button className="cta wide grow" onClick={submit} disabled={saving || uploading}>{saving ? L.saving : L.save}</button>
        </>
      )}
    </div>
  );
}
