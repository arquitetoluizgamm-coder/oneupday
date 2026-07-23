'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

const COLORS = { art: '#6c5ce7', body: '#0ea5e9', home: '#ff7a45', work: '#111827', life: '#16a34a' };

function slugify(title) {
  const base = title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'journey';
  return `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function NewJourneyForm({ userId, t, onCreated }) {
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);
  const router = useRouter();

  function pick(text) {
    if (titleRef.current) { titleRef.current.value = text; titleRef.current.focus(); }
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const form = e.target;
    const title = form.title.value.trim();
    const category = form.category.value;
    const total_days = parseInt(form.duration.value, 10);
    const goal = form.goal.value.trim();
    const first = form.firstUpdate.value.trim();

    const supabase = createClient();
    const slug = slugify(title);
    const { data: journey, error } = await supabase.from('journeys').insert({
      owner_id: userId, slug, title, category, goal, total_days,
      cover_color: COLORS[category] || '#ff7a45', is_public: true, visibility: 'public',
    }).select().single();

    if (error || !journey) { setSaving(false); alert(t.error); return; }
    await supabase.from('updates').insert({ journey_id: journey.id, day_number: 1, kind: 'step', text: first });
    router.push(`/created/${slug}`);
    router.refresh();
  }

  const suggestions = t.suggestions || [];

  return (
    <form className="create-form" onSubmit={onSubmit}>
      {suggestions.length > 0 && (
        <div className="sug-block">
          <span className="sug-title">{t.sugTitle}</span>
          <div className="sug-pills">
            {suggestions.map((sg, i) => (
              <button key={i} type="button" className="sug-pill" onClick={() => pick(sg)}>{sg}</button>
            ))}
          </div>
        </div>
      )}
      <label>{t.fName}
        <input ref={titleRef} name="title" required maxLength={60} placeholder={t.fNamePh} />
      </label>
      <div className="form-grid">
        <label>{t.fCategory}
          <select name="category" defaultValue="art">
            <option value="art">{t.catArt}</option>
            <option value="life">{t.catLife}</option>
            <option value="body">{t.catBody}</option>
            <option value="home">{t.catHome}</option>
            <option value="work">{t.catWork}</option>
          </select>
        </label>
        <label>{t.fDuration}
          <select name="duration" defaultValue="30">
            <option value="7">{t.dur7}</option>
            <option value="30">{t.dur30}</option>
            <option value="60">{t.dur60}</option>
            <option value="100">{t.dur100}</option>
          </select>
        </label>
      </div>
      <label>{t.fWhy}
        <textarea name="goal" required maxLength={180} placeholder={t.fWhyPh} />
      </label>
      <label>{t.fFirst}
        <textarea name="firstUpdate" required maxLength={180} placeholder={t.fFirstPh} />
      </label>
      <button className="cta wide grow" type="submit" disabled={saving}>{saving ? t.creating : t.createBtn}</button>
    </form>
  );
}
