'use client';
import { useEffect, useRef, useState } from 'react';

// ============================================================
// O NÚMERO CHEGA PRIMEIRO. A BARRA ANIMA DEPOIS.
//
// Antes, o número do dia e a porcentagem subiam de zero junto com a
// barra, em 3,2 segundos. Numa leitura da página no ar, o primeiro
// segundo dizia "Dia 0 de 30 · 0%" numa jornada que estava no dia 1.
//
// Duas coisas erradas nisso:
//
//   1. Um visitante decide em três segundos se fica. O único número
//      que diz "esta jornada está viva" passava a janela inteira
//      subindo do zero.
//
//   2. Numa jornada de dia 1, animar de 0% a 3% em 3,2s não lê como
//      elegante — lê como travado.
//
// Agora o TEXTO é o valor real desde o primeiro quadro. Só a LARGURA
// da barra cresce, em 900ms.
//
// A diferença é de significado: animar o número faz a pessoa esperar
// por um dado; animar a barra desenha um percurso. O primeiro é
// atraso disfarçado de charme, o segundo é a metáfora do produto.
// ============================================================
export default function ProgressBar({ day = 0, total = 30, dayTpl = 'Day {d} of {t}', goalWord = 'Goal' }) {
  const alvo = Math.min(100, Math.round((100 * Math.min(day, total)) / (total || 1)));
  // O mínimo de 6% existe para a barra não sumir num dia 1 de 100:
  // um traço fino ainda diz "começou", largura zero diz "nada aqui".
  const cheio = alvo > 0 ? Math.max(alvo, 6) : 0;
  const [largura, setLargura] = useState(0);
  const jaAnimou = useRef(false);

  useEffect(() => {
    const calmo = typeof matchMedia === 'function'
      && matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Sem movimento para quem pediu sem movimento — e sem repetir a
    // animação quando o componente rerenderiza por outro motivo.
    if (calmo || jaAnimou.current) { setLargura(cheio); return; }
    jaAnimou.current = true;
    const id = requestAnimationFrame(() => setLargura(cheio));
    return () => cancelAnimationFrame(id);
  }, [cheio]);

  const label = String(dayTpl).replace('{d}', day).replace('{t}', total);

  return (
    <div className="progress">
      <div className="progress-track">
        <span className="progress-goal">{goalWord}</span>
        <div
          className="progress-fill"
          style={{ width: largura + '%', transition: 'width 900ms cubic-bezier(.32,.72,.3,1)' }}
        />
      </div>
      <div className="progress-meta">
        <span>{label}</span>
        <span className="progress-pct">{alvo}%</span>
      </div>
    </div>
  );
}
