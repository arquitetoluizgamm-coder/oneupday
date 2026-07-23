'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

const ORDER = ['step', 'win', 'setback', 'learned'];

export default function Composer({ journeyId, nextDay, labels, t }) {
  const [text, setText] = useState('');
  const [kind, setKind] = useState('step');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function post() {
    const value = text.trim();
    if (!value || saving) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('updates').insert({ journey_id: journeyId, day_number: nextDay, kind, text: value });
    setSaving(false);
    if (error) { alert(t.error); return; }
    setText(''); setKind('step'); router.refresh();
  }

  const ph = t.placeholder.replace('{n}', nextDay);

  return (
    <div className="composer2">
      <input value={text} onChange={e => setText(e.target.value)} maxLength={180} placeholder={ph}
        onKeyDown={e => { if (e.key === 'Enter') post(); }} />
      <div className="composer2-row">
        <div className="kinds">
          {ORDER.map(k => (
            <button key={k} type="button"
              className={`kind${kind === k ? ' active' : ''}${k === 'setback' ? ' setback' : ''}`}
              onClick={() => setKind(k)}>{labels[k]}</button>
          ))}
        </div>
        <button className="post-btn" onClick={post} disabled={saving || !text.trim()}>{saving ? t.posting : t.post}</button>
      </div>
      {kind === 'setback' && <p className="setback-note">{t.setbackNote}</p>}
    </div>
  );
}
