'use client';
import { useState } from 'react';
import { createClient } from '../lib/supabase/client';

// Capítulo em aberto: o post não termina em si mesmo.
// Quem publicou diz o próximo passo; quem lê pede pra saber como foi.
export function StepOpen({ updateId, step, when, name, following, own, labels }) {
  const L = labels || {};
  const [on, setOn] = useState(!!following);
  const [busy, setBusy] = useState(false);
  if (!step) return null;

  async function seguir(e) {
    e.preventDefault(); e.stopPropagation();
    if (busy || own) return;
    setBusy(true);
    try {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      if (on) {
        await sb.from('step_follows').delete().eq('update_id', updateId).eq('user_id', user.id);
        setOn(false);
      } else {
        await sb.from('step_follows').insert({ update_id: updateId, user_id: user.id });
        setOn(true);
      }
    } catch {}
    setBusy(false);
  }

  return (
    <div className="step-open">
      <div className="so-body">
        <span className="so-eyebrow">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="butt" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
          {(L.back || '{name} volta com o resultado').replace('{name}', name)}
        </span>
        <p className="so-step">{step}{when ? <em> · {when}</em> : null}</p>
      </div>
      {!own && (
        <button type="button" className={`so-btn${on ? ' on' : ''}`} onClick={seguir} disabled={busy}>
          {on ? (L.following || 'acompanhando') : (L.follow || 'quero ver como foi')}
        </button>
      )}
    </div>
  );
}

// A continuação: ontem ela decidiu, hoje trouxe o resultado.
export function StepResult({ decided, name, labels }) {
  const L = labels || {};
  if (!decided) return null;
  return (
    <div className="step-result">
      <span className="sr-eyebrow">{(L.decided || 'Ontem {name} decidiu:').replace('{name}', name)}</span>
      <p className="sr-step">{decided}</p>
      <span className="sr-tag">{L.result || 'Resultado'}</span>
    </div>
  );
}
