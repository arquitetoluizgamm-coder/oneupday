'use client';
import { useState } from 'react';
import { createClient } from '../lib/supabase/client';

// ============================================================
// O QUE SE PODE RECONHECER
//
// A lista foi reescrita para soar como amigo, não como terapeuta:
// "Persistência sem perfeccionismo" virou "Continuar sem ser
// perfeito". Mesma ideia, língua de gente.
//
// Os TRÊS últimos são novos e mudam de sujeito de propósito. Os
// sete primeiros dizem algo sobre QUEM RECEBE ("percebi coragem em
// você"). Estes dizem algo sobre QUEM MANDA ("estou acompanhando",
// "isso me inspirou").
//
// Essa diferença é o que os deixa entrar sem quebrar a regra de voz
// do app — "presença, não pressão; nunca 'parabéns guerreiro'".
// "Você consegue!" e "Não desista" seriam veredito e cobrança;
// "estou acompanhando" é presença, que é o que o produto promete.
//
// As chaves antigas foram MANTIDAS. A tabela `percepcoes` já tem
// linhas com elas, e renomear apagaria o que as pessoas já
// reconheceram umas nas outras.
// ============================================================
export const TIPOS = [
  'coragem', 'voltar', 'honestidade', 'sem_perfeicao',
  'adaptar', 'limite', 'mudanca',
  'presenca', 'acompanho', 'inspirou',
];

// Ícone de cada um, no traço da marca. Os dois últimos são
// terracota porque falam de quem manda, não de quem recebe.
const ICONE = {
  coragem:      <path d="M12 20V8m0 0L7 13m5-5 5 5M5 4h14" />,
  voltar:       <path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5" />,
  honestidade:  <><circle cx="12" cy="12" r="8.5" /><path d="M12 8v5M12 16.2v.2" /></>,
  sem_perfeicao:<path d="M4 15s2.4-3 4.4-3 2.6 3 4.6 3 2.4-3 4.4-3 2.6 2 2.6 2M5 20h14" />,
  adaptar:      <path d="M4 18c5 0 5-12 10-12h6m0 0-3-3m3 3-3 3" />,
  limite:       <path d="M4 12h9M17 5v14M20 5v14" />,
  mudanca:      <path d="M4 18l5-5 3 3 7.5-7.5M20 5v5h-5" />,
  presenca:     <><circle cx="12" cy="8" r="3.2" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  acompanho:    <><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="2.6" /></>,
  inspirou:     <path d="M12 20.5S3.5 15.5 3.5 9.2C3.5 6.4 5.6 4.5 8 4.5c1.7 0 3.1 1 4 2.4.9-1.4 2.3-2.4 4-2.4 2.4 0 4.5 1.9 4.5 4.7 0 6.3-8.5 11.3-8.5 11.3z" />,
};
const DE_QUEM_MANDA = new Set(['acompanho', 'inspirou']);

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
                <button type="button" key={tp}
                  className={`pc-opt${feito === tp ? ' on' : ''}${DE_QUEM_MANDA.has(tp) ? ' de-quem-manda' : ''}`}
                  onClick={() => reconhecer(tp)} disabled={busy || !!feito}>
                  <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {ICONE[tp]}
                  </svg>
                  {/* se o rótulo faltar, mostra nada em vez da chave crua:
                      "sem_perfeicao" na tela é pior que um espaço vazio */}
                  <span>{(L.tipos || {})[tp] || ''}</span>
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
