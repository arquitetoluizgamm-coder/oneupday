'use client';
import { useState } from 'react';

export default function DeleteJourney({ journeyId, title, labels }) {
  const L = labels || {};
  const [busy, setBusy] = useState(false);

  async function del() {
    if (busy) return;
    if (!window.confirm((L.confirm || '').replace('{title}', title))) return;
    setBusy(true);
    // pelo servidor: o delete pelo navegador podia apagar zero linhas
    // sem devolver erro nenhum — a pessoa clicava e nada acontecia
    const r = await fetch('/api/journey/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: journeyId }),
    }).catch(() => null);
    setBusy(false);
    if (!r || !r.ok) { alert(L.error || 'Não foi possível excluir. Tente de novo.'); return; }
    // recarga completa: router.refresh() nem sempre repinta a lista do perfil
    window.location.href = '/perfil';
  }

  return (
    <button type="button" className="view-link danger-link" onClick={del} disabled={busy}>
      {busy ? '…' : L.btn}
    </button>
  );
}
