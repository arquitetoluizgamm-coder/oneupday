'use client';
import { useState } from 'react';
import { createClient } from '../lib/supabase/client';

export const TIPOS = ['coragem', 'voltar', 'honestidade', 'sem_perfeicao', 'adaptar', 'limite', 'mudanca'];

// Reação de percepção: em vez de "curti", dizer o que se percebeu.
// É o segundo gesto — o coração continua sendo o toque rápido.
export default function Percepcao({ updateId, toId, own, labels }) {
  const L = labels || {};
  const [aberto, setAberto] = useState(false);
  const [feito, setFeito] = useState('');
  const [busy, setBusy] = useState(false);
  if (own) return null;

  async function reconhecer(tipo) {
    if (busy) return;
    setBusy(true);
    try {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      await sb.from('percepcoes').insert({ update_id: updateId, to_id: toId, from_id: user.id, tipo });
      setFeito(tipo);
      setTimeout(() => setAberto(false), 900);
    } catch {}
    setBusy(false);
  }

  return (
    <>
      <button type="button" className={`pc-btn${feito ? ' on' : ''}`}
        onClick={() => setAberto((v) => !v)} aria-label={L.title} title={L.title}>
        <svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor"
          strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
          <circle cx="12" cy="12" r="2.6" />
        </svg>
      </button>

      {aberto && (
        <div className="pc-sheet" role="dialog">
          <div className="pc-card" onClick={(e) => e.stopPropagation()}>
            <span className="pc-eyebrow">{L.title}</span>
            <p className="pc-sub">{L.sub}</p>
            <div className="pc-list">
              {TIPOS.map((tp) => (
                <button type="button" key={tp} className={`pc-opt${feito === tp ? ' on' : ''}`}
                  onClick={() => reconhecer(tp)} disabled={busy || !!feito}>
                  {(L.tipos || {})[tp] || tp}
                </button>
              ))}
            </div>
            {feito
              ? <p className="pc-done">{L.done}</p>
              : <button type="button" className="pc-close" onClick={() => setAberto(false)}>{L.cancel}</button>}
          </div>
          <button type="button" className="pc-backdrop" onClick={() => setAberto(false)} aria-label={L.cancel} />
        </div>
      )}
    </>
  );
}

// O que as pessoas têm percebido — agregado, sem contagem de popularidade.
export function PercebidoEm({ itens, labels }) {
  const L = labels || {};
  if (!itens || !itens.length) return null;
  return (
    <section className="pv-block">
      <h3 className="pv-title">{L.blockTitle}</h3>
      <div className="pv-list">
        {itens.map((x, i) => (
          <span className="pv-item" key={i}>
            <b>{(L.tipos || {})[x.tipo] || x.tipo}</b>
            {x.n > 1 && <i>{(L.byN || 'por {n} pessoas').replace('{n}', x.n)}</i>}
          </span>
        ))}
      </div>
    </section>
  );
}
