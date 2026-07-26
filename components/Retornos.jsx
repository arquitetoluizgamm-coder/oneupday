'use client';
import { useState } from 'react';
import { createClient } from '../lib/supabase/client';

// Quem voltou depois de parar. O coração da marca, com palco próprio.
export default function Retornos({ people, labels }) {
  const L = labels || {};
  const [sent, setSent] = useState({});
  const [busy, setBusy] = useState('');
  const list = people || [];
  if (!list.length) return null;

  async function apoiar(x, e) {
    e.preventDefault(); e.stopPropagation();
    const id = x.owner.id;
    if (!id || sent[id] || busy) return;
    setBusy(id);
    try {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      await sb.from('hugs').insert({ from_id: user.id, to_id: id, update_id: null });
      setSent((s) => ({ ...s, [id]: true }));
    } catch {}
    setBusy('');
  }

  return (
    <section className="rt-block">
      <h3 className="rt-title">{L.title || 'Voltaram esta semana'}</h3>
      {list.map((x, i) => {
        const p = x.owner || {};
        const first = (p.name || '?').split(' ')[0];
        return (
          <a className="rt-row" key={i} href={`/${x.journeySlug}`}>
            <span className="rt-ava" style={{ background: p.avatar_color || 'var(--orange)' }}>
              {p.avatar_url ? <img src={p.avatar_url} alt="" /> : first[0]}
              <i className="rt-mark" aria-hidden="true">↺</i>
            </span>
            <span className="rt-body">
              <b>{(L.came || '{name} voltou depois de {d} dias').replace('{name}', first).replace('{d}', x.dias)}</b>
              {x.frase && <q>{x.frase}</q>}
            </span>
            <button type="button" className={`rt-btn${sent[p.id] ? ' on' : ''}`} onClick={(e) => apoiar(x, e)} disabled={!!sent[p.id]}>
              {sent[p.id] ? (L.sent || 'enviado 💛') : (L.cta || 'dar as boas-vindas')}
            </button>
          </a>
        );
      })}
    </section>
  );
}
