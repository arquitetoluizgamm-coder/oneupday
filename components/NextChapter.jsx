'use client';
import { useState } from 'react';
import { createClient } from '../lib/supabase/client';

// Próximo Capítulo — antecipação, nunca ansiedade.
// mode: 'sealed'  (postou hoje: cartão fechado pra amanhã)
//       'reveal'  (voltou no dia seguinte: capítulo pronto)
//       'return'  (voltou depois de uma pausa: nada expirou)
export default function NextChapter({ mode, line, env, labels }) {
  const L = labels || {};
  const [open, setOpen] = useState(false);
  if (!mode) return null;

  if (mode === 'sealed') {
    return (
      <section className="nc nc-sealed" aria-label={L.title}>
        <span className="nc-eyebrow">{L.title}</span>
        <p className="nc-sealed-text">{L.sealed}</p>
        <p className="nc-blur" aria-hidden="true">{L.blur}</p>
      </section>
    );
  }

  if (!open) {
    return (
      <section className="nc nc-closed" aria-label={L.title}>
        <span className="nc-eyebrow">{L.title}</span>
        <p className="nc-closed-text">{mode === 'return' ? L.returnTitle : L.ready}</p>
        <button type="button" className="nc-open-btn" onClick={() => {
          setOpen(true);
          if (env?.id) { try { createClient().from('envelopes').update({ opened_at: new Date().toISOString() }).eq('id', env.id).then(() => {}); } catch {} }
        }}>{L.open}</button>
      </section>
    );
  }

  return (
    <section className="nc nc-openned" aria-label={L.title}>
      <span className="nc-eyebrow">{L.title}</span>
      <p className="nc-lead">{mode === 'return' ? L.returnLead : L.lead}</p>
      {env && env.text && (
        <div className="nc-env">
          <small>{mode === 'return' ? L.envLeadReturn : L.envLead}</small>
          <p>“{env.text}”</p>
        </div>
      )}
      <div className="nc-step"><small>{L.stepLabel}</small><b>{L.step}</b></div>
      <p className="nc-identity">{L.identity}</p>
      {line && line.days && line.days.length > 0 && (
        <div className="nc-linewrap" aria-label={L.lineLabel} title={L.lineLabel}>
          <svg viewBox="0 0 320 26" width="100%" height="26">
            <line x1="6" y1="13" x2="314" y2="13" stroke="rgba(255,255,255,.14)" strokeWidth="2" strokeLinecap="round" />
            {line.days.map((d) => {
              const span = Math.max(1, (line.total || Math.max(...line.days)) - 1);
              const x = 6 + ((Math.min(d, line.total || d) - 1) / span) * 308;
              const gold = (line.gold || []).includes(d);
              return (
                <g key={d}>
                  {gold && <circle cx={x} cy="13" r="7" fill="#f2b34c" opacity=".25" />}
                  <circle cx={x} cy="13" r={gold ? 4.2 : 2.8} fill={gold ? '#f2b34c' : '#9fd0ff'} />
                </g>
              );
            })}
          </svg>
        </div>
      )}
      <a className="nc-cta" href="/perfil">{L.cta}</a>
    </section>
  );
}
