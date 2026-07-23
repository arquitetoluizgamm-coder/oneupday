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
const STEPS = 4;

function slugify(title) {
  const base = title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'journey';
  return `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function NewJourneyForm({ userId, t }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [cat, setCat] = useState('art');
  const [moment, setMoment] = useState('');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const customRef = useRef(null);
  const durRef = useRef(null);
  const firstRef = useRef(null);
  const photoRef = useRef(null);
  const videoRef = useRef(null);
  const router = useRouter();

  const CATS = [
    ['art', t.catArt], ['body', t.catBody], ['health', t.catHealth], ['mind', t.catMind],
    ['study', t.catStudy], ['work', t.catWork], ['money', t.catMoney], ['relationship', t.catRelationship],
    ['habit', t.catHabit], ['creative', t.catCreative], ['home', t.catHome], ['life', t.catLife],
  ];
  const suggestions = [t.ex1, t.ex2, t.ex3, t.ex4, t.ex5];
  const MOMENTS = [
    ['starting', t.mStarting], ['notgiveup', t.mNotgiveup], ['rebuilding', t.mRebuilding],
    ['health', t.mHealth], ['courage', t.mCourage], ['hardphase', t.mHardphase], ['building', t.mBuilding],
  ];
  const heads = [
    [t.wizT1, t.wizS1], [t.wizT2, t.wizS2], [t.wizT3, t.wizS3], [t.wizT4, t.wizS4],
  ];

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

  const canNext = (step === 0 && title.trim()) || (step === 1) || (step === 2 && goal.trim()) || step === 3;
  function next() { if (canNext && step < STEPS - 1) setStep(step + 1); }
  function back() { if (step > 0) setStep(step - 1); }

  async function onSubmit(e) {
    e.preventDefault(); if (saving) return; setSaving(true);
    let category = cat;
    if (cat === 'other') category = (customRef.current?.value.trim().toLowerCase() || 'other').slice(0, 24);
    const total_days = parseInt(durRef.current?.value || '30', 10);
    const first = (firstRef.current?.value || '').trim();

    const supabase = createClient();
    const slug = slugify(title);
    const { data: journey, error } = await supabase.from('journeys').insert({
      owner_id: userId, slug, title: title.trim(), category, goal: goal.trim(), total_days,
      cover_color: COLORS[category] || '#ff7a45', is_public: true, visibility: 'public', moment: moment || null,
    }).select().single();
    if (error || !journey) { setSaving(false); alert(t.createError); return; }

    await supabase.from('updates').insert({
      journey_id: journey.id, day_number: 1, kind: 'step',
      text: first || (photoUrl ? '\u{1F4F7}' : (videoUrl ? '\u{1F3A5}' : '')),
      photo_url: photoUrl, video_url: videoUrl,
    });
    router.push(`/created/${slug}`); router.refresh();
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && step < STEPS - 1) { e.preventDefault(); next(); }
  }

  return (
    <form className="wizard" onSubmit={onSubmit} onKeyDown={onKeyDown}>
      <div className="wiz-top">
        <div className="wiz-dots">
          {Array.from({ length: STEPS }).map((_, i) => (
            <span key={i} className={`wiz-dot${i === step ? ' on' : ''}${i < step ? ' done' : ''}`} />
          ))}
        </div>
        <span className="wiz-count">{t.wizStep.replace('{n}', step + 1).replace('{t}', STEPS)}</span>
      </div>

      <div className="wiz-head">
        <h2>{heads[step][0]}</h2>
        <p>{heads[step][1]}</p>
      </div>

      {/* Step 0 — Nome */}
      <div className="wiz-step" style={{ display: step === 0 ? 'block' : 'none' }}>
        <input className="wiz-title" value={title} onChange={e => setTitle(e.target.value)}
          maxLength={80} placeholder={t.fNamePh} autoFocus />
        <div className="sug-pills">
          {suggestions.map((sg, i) => (
            <button key={i} type="button" className="sug-pill" onClick={() => setTitle(sg)}>{sg}</button>
          ))}
        </div>
      </div>

      {/* Step 1 — Categoria + momento */}
      <div className="wiz-step" style={{ display: step === 1 ? 'block' : 'none' }}>
        <div className="field-label">{t.fCategory}</div>
        <div className="cat-pick">
          {CATS.map(([v, l]) => (
            <button key={v} type="button" className={`chip${cat === v ? ' on' : ''}`} onClick={() => setCat(v)}>{l}</button>
          ))}
          <button type="button" className={`chip${cat === 'other' ? ' on' : ''}`} onClick={() => setCat('other')}>+ {t.catOther}</button>
        </div>
        {cat === 'other' && <input ref={customRef} className="custom-cat" maxLength={24} placeholder={t.customCatPh} />}
        <div className="field-label" style={{ marginTop: 16 }}>{t.momentQ} <span className="opt">({t.optional})</span></div>
        <div className="cat-pick">
          {MOMENTS.map(([v, l]) => (
            <button key={v} type="button" className={`chip moment${moment === v ? ' on' : ''}`} onClick={() => setMoment(moment === v ? '' : v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Step 2 — Duração + porquê */}
      <div className="wiz-step" style={{ display: step === 2 ? 'block' : 'none' }}>
        <label>{t.fDuration}
          <select ref={durRef} defaultValue="30">
            <option value="7">{t.dur7}</option>
            <option value="30">{t.dur30}</option>
            <option value="60">{t.dur60}</option>
            <option value="100">{t.dur100}</option>
          </select>
        </label>
        <label>{t.fWhy}
          <textarea value={goal} onChange={e => setGoal(e.target.value)} maxLength={300} placeholder={t.fWhyPh} />
        </label>
      </div>

      {/* Step 3 — Primeiro dia */}
      <div className="wiz-step" style={{ display: step === 3 ? 'block' : 'none' }}>
        <label>{t.fFirst}
          <textarea ref={firstRef} maxLength={500} placeholder={t.fFirstPh} />
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
      </div>

      <div className="wiz-nav">
        {step > 0
          ? <button type="button" className="ghost-btn" onClick={back}>{t.wizBack}</button>
          : <span />}
        {step < STEPS - 1
          ? <button type="button" className="cta grow" onClick={next} disabled={!canNext}>{t.wizNext}</button>
          : <button type="submit" className="cta grow" disabled={saving || uploading}>{saving ? t.creating : t.createBtn}</button>}
      </div>
    </form>
  );
}
