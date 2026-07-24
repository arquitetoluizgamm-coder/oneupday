'use client';
import { useState } from 'react';
import { MOODS } from '../lib/moods';
import { createClient } from '../lib/supabase/client';

export default function NeedsSupport({ people, labels }) {
  const L = labels || {};
  const [sent, setSent] = useState({});
  const [busy, setBusy] = useState('');
  if (!people || !people.length) return null;

  async function send(p) {
    if (sent[p.id] || busy) return;
    setBusy(p.id);
    try {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      await sb.from('hugs').insert({ from_id: user.id, to_id: p.id, update_id: null });
      setSent((s) => ({ ...s, [p.id]: true }));
    } catch {}
    setBusy('');
  }

  return (
    <section className="needs">
      <span className="needs-title">{L.title}</span>
      <div className="needs-list">
        {people.map((p) => (
          <div key={p.id} className="needs-person">
            <a className="needs-ava" href={`/${p.handle || ''}`} style={{ background: p.avatar_color || 'var(--muted)', boxShadow: MOODS[p.mood] ? `0 0 0 2px #fff, 0 0 0 4px ${MOODS[p.mood]}99, 0 0 12px ${MOODS[p.mood]}88` : undefined }}>
              {p.avatar_url ? <img src={p.avatar_url} alt="" /> : (p.name || '?')[0]}
            </a>
            <b>{(p.name || '').split(' ')[0]}</b>
            <button type="button" className={`needs-send${sent[p.id] ? ' done' : ''}`} onClick={() => send(p)} disabled={!!sent[p.id] || busy === p.id}>
              {sent[p.id] ? (L.sent || 'apoio enviado 💛') : (busy === p.id ? '…' : L.cta)}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
