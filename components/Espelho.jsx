'use client';
import { useEffect, useState } from 'react';

// O Espelho: o Upi aponta, a pessoa conclui.
// Nunca diagnostica — só mostra as palavras dela, com data.
export default function Espelho({ labels }) {
  const L = labels || {};
  const [dado, setDado] = useState(null);
  const [aberto, setAberto] = useState(false);
  const [fechado, setFechado] = useState(false);

  useEffect(() => {
    fetch('/api/espelho').then((r) => r.json()).then((j) => {
      if (j && j.espelho) setDado(j.espelho);
    }).catch(() => {});
  }, []);

  function fechar() {
    setFechado(true);
    fetch('/api/espelho', { method: 'POST' }).catch(() => {});
  }

  if (!dado || fechado) return null;

  const frase = () => {
    if (dado.tipo === 'palavra') {
      return (L.palavra || 'A palavra “{t}” aparecia em {n} dos seus primeiros dias. Não aparece há {d}.')
        .replace('{t}', dado.termo).replace('{n}', dado.vezes).replace('{d}', dado.diasSem);
    }
    if (dado.tipo === 'tempo') return L.tempo || 'Você escrevia no “queria”. Agora escreve no “fiz”.';
    if (dado.tipo === 'ritmo') {
      return (L.ritmo || 'No começo você aparecia a cada {a} dias. Agora é quase todo dia.')
        .replace('{a}', dado.antes);
    }
    return L.tom || 'O peso saiu das suas frases.';
  };

  if (!aberto) {
    return (
      <button type="button" className="esp-teaser" onClick={() => setAberto(true)}>
        <img src="/upi.svg" alt="" width="30" height="30" />
        <span>{L.teaser || 'Reparei numa coisa.'}</span>
      </button>
    );
  }

  return (
    <section className="esp-card" role="status">
      <header className="esp-head">
        <img src="/upi.svg" alt="" width="30" height="30" />
        <span>{L.eyebrow || 'Upi'}</span>
      </header>

      {dado.par && (
        <div className="esp-par">
          <div className="esp-linha">
            <em>{(L.dayFmt || 'Dia {d}').replace('{d}', dado.par.antes.dia)}</em>
            <q>{dado.par.antes.texto}</q>
          </div>
          <div className="esp-linha now">
            <em>{(L.dayFmt || 'Dia {d}').replace('{d}', dado.par.depois.dia)}</em>
            <q>{dado.par.depois.texto}</q>
          </div>
        </div>
      )}

      <p className="esp-fato">{frase()}</p>

      <div className="esp-acts">
        <button type="button" className="ghost-btn" onClick={fechar}>{L.close || 'fechar'}</button>
      </div>
    </section>
  );
}

// O porquê resgatado: aparece no dia difícil e na volta.
// Não é frase motivacional — é o que ela mesma escreveu no dia 1.
export function PorQue({ texto, labels }) {
  const L = labels || {};
  if (!texto) return null;
  return (
    <section className="pq-card">
      <img src="/upi.svg" alt="" width="28" height="28" />
      <div>
        <span className="pq-eyebrow">{L.eyebrow || 'No dia 1 você escreveu por que isso importava:'}</span>
        <q className="pq-text">{texto}</q>
      </div>
    </section>
  );
}
