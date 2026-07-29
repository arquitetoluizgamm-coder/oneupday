'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// ============================================================
// MENU DE CRIAR
//
// Era código solto dentro do BottomNav. Virou componente porque
// agora abre em dois lugares — rodapé e perfil — e duas cópias do
// mesmo menu é como um deles fica para trás na próxima mudança.
//
// ------------------------------------------------------------
// POR QUE ELE VAI PARA O <body> E NÃO FICA ONDE FOI CHAMADO
//
// O menu do topo não abria: aparecia só a última opção, espremida
// no alto da tela. Medido no app no ar:
//
//   janela ............ 500 x 569
//   fundo do menu ..... 485 x  74   <- é o cabeçalho, não a janela
//   folha ............. y -246 a 98 (28% visível)
//
// A causa é uma regra de CSS a três arquivos de distância: o
// cabeçalho tem `backdrop-filter: blur(14px)`. Pela especificação,
// um elemento com backdrop-filter (assim como transform ou filter)
// vira o **bloco de contenção** dos descendentes `position:fixed`.
// O `inset:0` do fundo deixa de significar "a janela" e passa a
// significar "o cabeçalho", de 74px de altura. A folha, de 344px,
// alinhada pela base dessa caixa, sobe 246px para fora da tela.
//
// No computador a mesma conta dá outro resultado: acima de 520px a
// folha é centralizada em vez de alinhada embaixo, então metade
// dela cai dentro da tela e o menu "funciona". Por isso o defeito
// parecia ser só do celular — não era: era do alinhamento.
//
// A correção poderia ser tirar o `backdrop-filter` do cabeçalho.
// Não é o certo: aí eu conserto este menu e deixo a armadilha
// armada para o próximo `position:fixed` que alguém colocar ali
// dentro. O menu passa a ser filho do <body>, onde `fixed` volta a
// significar a janela — e nenhum ancestral futuro pode capturá-lo.
// ============================================================

const ICONES = {
  hoje: <path d="M4 19h16M6 15.5 15.5 6a2.1 2.1 0 0 1 3 3L9 18.5l-4 1z" />,
  midia: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m4 18 5-5 4 4 3-3 4 4" /></>,
  jornada: <path d="M5 12h14M12 5v14" />,
  citacao: <><path d="M4 6h16M4 11h11" /><path d="M7 20c-1.6 0-2.6-1-2.6-2.6 0-1.5 1-2.6 2.4-2.6 1.3 0 2.2.9 2.2 2.2 0 1.9-1.4 3.4-3.4 4.2" /><path d="M15 20c-1.6 0-2.6-1-2.6-2.6 0-1.5 1-2.6 2.4-2.6 1.3 0 2.2.9 2.2 2.2 0 1.9-1.4 3.4-3.4 4.2" /></>,
  diario: <><path d="M6 4.5A2.5 2.5 0 0 1 8.5 2H19v17H8.5A2.5 2.5 0 0 0 6 21.5z" /><path d="M6 4.5v17M10 6h5M10 10h5" /></>,
  futuro: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2M5 4 3 2M19 4l2-2" /></>,
};

export default function CriarMenu({ t, className = 'bn-create', tamanho = 26, rotulo }) {
  const [aberto, setAberto] = useState(false);
  // O portal precisa do document, que não existe na renderização do
  // servidor. Só depois de montar no navegador é que ele pode existir.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e) => { if (e.key === 'Escape') setAberto(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [aberto]);

  const opcoes = [
    { href: '/perfil', icone: 'hoje', texto: t.navToday, principal: true },
    { href: '/midia', icone: 'midia', texto: t.navMedia },
    { href: '/citacao', icone: 'citacao', texto: t.navQuote },
    { href: '/diario', icone: 'diario', texto: t.navDiary },
    { href: '/futuro', icone: 'futuro', texto: t.futureTitle },
    { href: '/new', icone: 'jornada', texto: t.navJourney },
  ];

  return (
    <>
      <button type="button" className={className} onClick={() => setAberto(true)}
        aria-label={rotulo || t.navCreate} title={rotulo || t.navCreate}>
        <svg viewBox="0 0 24 24" width={tamanho} height={tamanho} fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {aberto && montado && createPortal(
        <div className="create-backdrop" onClick={() => setAberto(false)}
          role="dialog" aria-modal="true" aria-label={rotulo || t.navCreate}>
          <div className="create-menu" onClick={(e) => e.stopPropagation()}>
            {opcoes.map((o) => (
              <a key={o.href + o.icone} href={o.href} className={`cm-item${o.principal ? ' cm-main' : ''}`}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
                  strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {ICONES[o.icone]}
                </svg>
                {o.texto}
              </a>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
