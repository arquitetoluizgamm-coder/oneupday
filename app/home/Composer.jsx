'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

const KINDS = [
  { id: 'step', label: 'Step' },
  { id: 'win', label: 'Small win' },
  { id: 'setback', label: 'Setback' },
  { id: 'learned', label: 'Learned' },
];

export default function Composer({ journeyId, nextDay }) {
  const [text, setText] = useState('');
  const [kind, setKind] = useState('step');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function post() {
    const value = text.trim();
    if (!value || saving) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('updates').insert({
      journey_id: journeyId,
      day_number: nextDay,
      kind,
      text: value,
    });
    setSaving(false);
    if (error) {
      alert('Could not post. Try again.');
      return;
    }
    setText('');
    setKind('step');
    router.refresh();
  }

  return (
    <div className="composer2">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        maxLength={180}
        placeholder={`Post day ${nextDay}: one honest step from today`}
        onKeyDown={e => { if (e.key === 'Enter') post(); }}
      />
      <div className="composer2-row">
        <div className="kinds">
          {KINDS.map(k => (
            <button
              key={k.id}
              type="button"
              className={`kind${kind === k.id ? ' active' : ''}${k.id === 'setback' ? ' setback' : ''}`}
              onClick={() => setKind(k.id)}
            >
              {k.label}
            </button>
          ))}
        </div>
        <button className="post-btn" onClick={post} disabled={saving || !text.trim()}>
          {saving ? 'Posting…' : 'Post'}
        </button>
      </div>
      {kind === 'setback' && (
        <p className="setback-note">A setback still counts as showing up. Your streak stays safe.</p>
      )}
    </div>
  );
}
