'use client';
import { useState } from 'react';
import { MOODS } from '../lib/moods';
import { createClient } from '../lib/supabase/client';

export default function NeedsSupport({ people, labels }) {
  const L = labels || {};
  const [gone, setGone] = useState({});
  const [sent, setSent] = useState({});
  const [busy, setBusy] = useState('');
  const list = (people || []).filter((p) => !gone[p.id] || sent[p.id]);
  if (!list.length) return null;

  async function send(p) {
    if (sent[p.id] || busy) return;
    setBusy(p.id);
    try {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      await sb.from('hugs').insert({ from_id: user.id, to_id: p.id, update_id: null });
      setSent((s) => ({ ...s, [p.id]: true }));
      // Depois do apoio enviado, a pessoa sai da lista com carinho.
      setTimeout(() => {
        setGone((g) => ({ ...g, [p.id]: true }));
        setSent((s) => { const n = { ...s }; delete n[p.id]; return n; });
      }, 1400);
    } catch {}
    setBusy('');
  }

  return (
    <article className="entry aux-post needs">
      <header className="aux-post-head">
        <span className="aux-post-mark" aria-hidden="true">♥</span>
        <div><b>{L.title}</b><small>{L.sub}</small></div>
      </header>
      <div className="needs-list">
        {list.map((p) => {
          const name = p.name || p.handle || 'Alguém';
          return (
            <div key={p.id} className={`needs-person${sent[p.id] ? ' leaving' : ''}`}>
              <a
                className="needs-ava"
                href={`/${p.handle || ''}`}
                aria-label={`Abrir perfil de ${name}`}
                style={{
                  background: p.avatar_color || 'var(--muted)',
                  boxShadow: MOODS[p.mood] ? `0 0 0 2px #fff, 0 0 0 4px ${MOODS[p.mood]}99, 0 0 12px ${MOODS[p.mood]}88` : undefined,
                }}
              >
                {p.avatar_url ? <img src={p.avatar_url} alt="" /> : name[0]}
              </a>
              <div className="needs-copy">
                <b>{name}</b>
                <p>{L.context || 'Pode estar precisando de uma presença hoje.'}</p>
                <button
                  type="button"
                  className={`needs-send${sent[p.id] ? ' done' : ''}`}
                  onClick={() => send(p)}
                  disabled={!!sent[p.id] || busy === p.id}
                  aria-label={`${L.cta || 'Deixar um apoio'} para ${name}`}
                >
                  {sent[p.id] ? (L.sent || 'apoio enviado 💛') : (busy === p.id ? '…' : L.cta)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
