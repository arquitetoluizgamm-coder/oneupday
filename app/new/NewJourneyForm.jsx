'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

const COLORS = { art: '#6c5ce7', body: '#0ea5e9', home: '#ff7a45', work: '#111827', life: '#16a34a' };

function slugify(title) {
  const base = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'journey';
  return `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function NewJourneyForm({ userId }) {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

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
    const { data: journey, error } = await supabase.from('journeys').insert({
      owner_id: userId,
      slug: slugify(title),
      title,
      category,
      goal,
      total_days,
      cover_color: COLORS[category] || '#ff7a45',
      is_public: true,
    }).select().single();

    if (error || !journey) {
      setSaving(false);
      alert('Could not create the journey. Try again.');
      return;
    }

    await supabase.from('updates').insert({
      journey_id: journey.id, day_number: 1, kind: 'step', text: first,
    });

    router.push('/home');
    router.refresh();
  }

  return (
    <form className="create-form" onSubmit={onSubmit}>
      <label>Journey name
        <input name="title" required maxLength={60} placeholder="Ex.: 30 days drawing again" />
      </label>
      <div className="form-grid">
        <label>Category
          <select name="category" defaultValue="art">
            <option value="art">Art</option>
            <option value="life">Life</option>
            <option value="body">Body</option>
            <option value="home">Home</option>
            <option value="work">Work</option>
          </select>
        </label>
        <label>Duration
          <select name="duration" defaultValue="30">
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="60">60 days</option>
            <option value="100">100 days</option>
          </select>
        </label>
      </div>
      <label>Why are you starting?
        <textarea name="goal" required maxLength={180} placeholder="What do you want to build, change or overcome?" />
      </label>
      <label>First update
        <textarea name="firstUpdate" required maxLength={180} placeholder="What is the first small step you can post today?" />
      </label>
      <button className="cta wide" type="submit" disabled={saving}>
        {saving ? 'Creating…' : 'Create journey'}
      </button>
    </form>
  );
}
