'use client';
import { useEffect } from 'react';

// ============================================================
// MOTION — enriquecimento, nunca requisito
//
// A regra que governa este arquivo: o conteúdo NASCE VISÍVEL.
// O CSS só passa a esconder os blocos depois que esta peça
// carregou e marcou <html> com `motion-ready`.
//
// Por quê: se o estado inicial fosse `opacity:0` esperando o
// observador, qualquer falha de JavaScript — erro de rede, um
// bloqueador, um navegador antigo dentro da TWA — deixaria a
// landing em branco. Numa página cujo trabalho é converter,
// esse é o único defeito que custa tudo.
//
// Resultado por cenário:
//   · sem JavaScript ............ tudo aparece, sem animação
//   · erro no observador ........ tudo aparece, sem animação
//   · movimento reduzido ........ tudo aparece no estado final
//   · tudo funcionando .......... entrada progressiva
//
// O observador só ACRESCENTA `is-visible`. Ele nunca é
// responsável por tornar visível algo que já deveria estar.
// ============================================================
export default function Motion() {
  useEffect(() => {
    const raiz = document.documentElement;

    // quem pediu menos movimento recebe o estado final, e nada mais
    const menosMovimento = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (menosMovimento?.matches) return;
    if (!('IntersectionObserver' in window)) return;

    raiz.classList.add('motion-ready');

    const obs = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        const el = e.target;

        // o atraso em cascata vem do próprio elemento (data-atraso),
        // para o CSS não precisar saber quantos irmãos existem
        const atraso = Number(el.dataset.atraso || 0);
        if (atraso) el.style.transitionDelay = `${atraso}ms`;

        el.classList.add('is-visible');

        // uma vez só: para de observar. É isto que impede a linha de
        // reiniciar quando a pessoa sobe e desce a página.
        obs.unobserve(el);
      }
    }, {
      // dispara um pouco antes de entrar de fato, senão o movimento
      // acontece fora do campo de visão e a pessoa perde
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.15,
    });

    document.querySelectorAll('.reveal, .linha-tese').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return null;
}
