'use client';
import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function TomorrowStep({ userId, journeyId, labels }) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState('');

  async function save() {
    const value = text.trim().slice(0, 200);
    if (!value || saving || saved) return;
    setSaving(true);
    setErr('');
    try {
      const supabase = createClient();
      const { error } = await supabase.from('envelopes').insert({
        user_id: userId,
        journey_id: journeyId,
        text: value,
      });
      if (error) throw error;
      setSaved(true);
    } catch {
      setErr(labels.error);
    }
    setSaving(false);
  }

  if (saved) {
    return (
      <section className="tomorrow-step saved">
        <img src="/upi.svg" alt="" aria-hidden="true" />
        <div>
          <b>{labels.savedTitle}</b>
          <p>{labels.savedSub}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="tomorrow-step">
      <div className="tomorrow-upi">
        <img src="/upi.svg" alt="" aria-hidden="true" />
        <div>
          <b>{labels.title}</b>
          <p>{labels.sub}</p>
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 200))}
        placeholder={labels.placeholder}
        rows={2}
      />
      <div className="tomorrow-actions">
        <a href="/home" className="ghost-btn">{labels.skip}</a>
        <button type="button" className="cta" onClick={save} disabled={saving || !text.trim()}>
          {saving ? labels.saving : labels.save}
        </button>
      </div>
      {err && <p className="tomorrow-error">{err}</p>}
    </section>
  );
}
