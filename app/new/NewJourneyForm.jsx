'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

const COLORS = {
  art: '#6c5ce7', body: '#0ea5e9', home: '#ff7a45', work: '#111827', life: '#16a34a',
  study: '#2563eb', health: '#16a34a', mind: '#6c5ce7', money: '#0e9f6e',
  relationship: '#f02f87', habit: '#ff7a45', creative: '#a855f7',
};
const MAX_VIDEO = 60 * 1024 * 1024;

function slugify(title) {
  const base = title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'journey';
  return `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function NewJourneyForm({ userId, t }) {
  const [saving, setSaving] = useState(false);
  const [cat, setCat] = useState('art');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const titleRef = useRef(null);
  const customRef = useRef(null);
  const photoRef = useRef(null);
  const videoRef = useRef(null);
  const router = useRouter();

  const CATS = [
    ['art', t.catArt], ['body', t.catBody], ['health', t.catHealth], ['mind', t.catMind],
    ['study', t.catStudy], ['work', t.catWork], ['money', t.catMoney], ['relationship', t.catRelationship],
    ['habit', t.catHabit], ['creative', t.catCreative], ['home', t.catHome], ['life', t.catLife],
  ];
  const suggestions = [t.ex1, t.ex2, t.ex3, t.ex4, t.ex5];

  function pick(text) { if (titleRef.current) { titleRef.current.value = text; titleRef.current.focus(); } }

  async function upload(file) {
    const supabase = createClient();
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('photos').upload(path, file, { upsert: false });
    if (error) return null;
    return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
  }
  async function onPhoto(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); const url = await upload(file); setUploading(false);
    if (!url) { alert(t.createError); return; }
    setPhotoUrl(url); setVideoUrl(null); if (videoRef.current) videoRef.current.value = '';
  }
  async function onVideo(e) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > MAX_VIDEO) { alert(t.videoTooBig); e.target.value = ''; return; }
    setUploading(true); const url = await upload(file); setUploading(false);
    if (!url) { alert(t.createError); return; }
    setVideoUrl(url); setPhotoUrl(null); if (photoRef.current) photoRef.current.value = '';
  }

  async function onSubmit(e) {
    e.preventDefault(); if (saving) return; setSaving(true);
    const form = e.target;
    const title = form.title.value.trim();
    let category = cat;
    if (cat === 'other') category = (customRef.current?.value.trim().toLowerCase() || 'other').slice(0, 24);
    const total_days = parseInt(form.duration.value, 10);
    const goal = form.goal.value.trim();
    const first = form.firstUpdate.value.trim();

    const supabase = createClient();
    const slug = slugify(title);
    const { data: journey, error } = await supabase.from('journeys').insert({
      owner_id: userId, slug, title, category, goal, total_days,
      cover_color: COLORS[category] || '#ff7a45', is_public: true, visibility: 'public',
    }).select().single();
    if (error || !journey) { setSaving(false); alert(t.createError); return; }

    await supabase.from('updates').insert({
      journey_id: journey.id, day_number: 1, kind: 'step',
      text: first || (photoUrl ? '\u{1F4F7}' : (videoUrl ? '\u{1F3A5}' : '')),
      photo_url: photoUrl, video_url: videoUrl,
    });
    router.push(`/created/${slug}`); router.refresh();
  }

  return (
    <form className="create-form" onSubmit={onSubmit}>
      <div className="sug-block">
        <span className="sug-title">{t.sugTitle}</span>
        <div className="sug-pills">
          {suggestions.map((sg, i) => (
            <button key={i} type="button" className="sug-pill" onClick={() => pick(sg)}>{sg}</button>
          ))}
        </div>
      </div>

      <label>{t.fName}
        <input ref={titleRef} name="title" required maxLength={60} placeholder={t.fNamePh} />
      </label>

      <div className="field-label">{t.fCategory}</div>
      <div className="cat-pick">
        {CATS.map(([v, l]) => (
          <button key={v} type="button" className={`chip${cat === v ? ' on' : ''}`} onClick={() => setCat(v)}>{l}</button>
        ))}
        <button type="button" className={`chip${cat === 'other' ? ' on' : ''}`} onClick={() => setCat('other')}>+ {t.catOther}</button>
      </div>
      {cat === 'other' && (
        <input ref={customRef} className="custom-cat" maxLength={24} placeholder={t.customCatPh} />
      )}

      <label>{t.fDuration}
        <select name="duration" defaultValue="30">
          <option value="7">{t.dur7}</option>
          <option value="30">{t.dur30}</option>
          <option value="60">{t.dur60}</option>
          <option value="100">{t.dur100}</option>
        </select>
      </label>

      <label>{t.fWhy}
        <textarea name="goal" required maxLength={180} placeholder={t.fWhyPh} />
      </label>

      <label>{t.fFirst}
        <textarea name="firstUpdate" maxLength={180} placeholder={t.fFirstPh} />
      </label>

      {photoUrl && <div className="photo-preview"><img src={photoUrl} alt="" /></div>}
      {videoUrl && <div className="photo-preview"><video src={videoUrl} controls playsInline /></div>}
      <div className="media-row">
        <button type="button" className="chip photo" onClick={() => photoRef.current?.click()} disabled={uploading}>
          {uploading ? t.uploading : (photoUrl ? t.photoAdded : t.addPhoto)}
        </button>
        <button type="button" className="chip photo" onClick={() => videoRef.current?.click()} disabled={uploading}>
          {uploading ? t.uploading : (videoUrl ? t.videoAdded : t.addVideo)}
        </button>
        <input ref={photoRef} type="file" accept="image/*" hidden onChange={onPhoto} />
        <input ref={videoRef} type="file" accept="video/*" hidden onChange={onVideo} />
      </div>

      <button className="cta wide grow" type="submit" disabled={saving || uploading}>{saving ? t.creating : t.createBtn}</button>
    </form>
  );
}
