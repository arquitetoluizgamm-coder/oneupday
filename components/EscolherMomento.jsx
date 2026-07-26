'use client';
import { useState } from 'react';
import { createClient } from '../lib/supabase/client';

// O "momento" saiu do wizard e virou convite depois do dia 1.
// Perguntar em que fase da vida a pessoa está é abstrato antes de
// escrever qualquer coisa — e concreto logo depois.
export default function EscolherMomento({ journeyId, momentos, labels }) {
  const L = labels || {};
  const [sel, setSel] = useState('');
  const [pronto, setPronto] = useState(false);
  const [busy, setBusy] = useState(false);

  async function salvar(v) {
    if (busy) return;
    setBusy(true); setSel(v);
    try {
      const sb = createClient();
      await sb.from('journeys').update({ moment: v }).eq('id', journeyId);
      setPronto(true);
    } catch {}
    setBusy(false);
  }

  if (pronto) {
    return (
      <div className="mom-done">
        <b>{L.done || 'Pronto.'}</b>
        <a className="ghost-btn wide" href={`/grupo/${sel}`}>{L.see || 'Ver quem está no mesmo momento'}</a>
      </div>
    );
  }

  return (
    <section className="mom-invite">
      <b>{L.title || 'Quer caminhar com quem está no mesmo momento?'}</b>
      <p>{L.sub || 'Opcional. Serve só para você encontrar gente parecida.'}</p>
      <div className="mom-chips">
        {(momentos || []).map(([v, l]) => (
          <button type="button" key={v} className={`chip moment${sel === v ? ' on' : ''}`}
            onClick={() => salvar(v)} disabled={busy}>{l}</button>
        ))}
      </div>
    </section>
  );
}
