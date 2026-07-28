'use client';
import { useEffect, useState } from 'react';

// ============================================================
// MENU DE CRIAR
//
// Era código solto dentro do BottomNav. Virou componente porque
// agora abre em dois lugares — rodapé e perfil — e duas cópias do
// mesmo menu é como um deles fica para trás na próxima mudança.
// ============================================================

const ICONES = {
  hoje: <path d="M4 19h16M6 15.5 15.5 6a2.1 2.1 0 0 1 3 3L9 18.5l-4 1z" />,
  midia: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m4 18 5-5 4 4 3-3 4 4" /></>,
  jornada: <path d="M5 12h14M12 5v14" />,
  citacao: <><path d="M4 6h16M4 11h11" /><path d="M7 20c-1.6 0-2.6-1-2.6-2.6 0-1.5 1-2.6 2.4-2.6 1.3 0 2.2.9 2.2 2.2 0 1.9-1.4 3.4-3.4 4.2" /><path d="M15 20c-1.6 0-2.6-1-2.6-2.6 0-1.5 1-2.6 2.4-2.6 1.3 0 2.2.9 2.2 2.2 0 1.9-1.4 3.4-3.4 4.2" /></>,
  diario: <><path d="M6 4.5A2.5 2.5 0 0 1 8.5 2H19v17H8.5A2.5 2.5 0 0 0 6 21.5z" /><path d="M6 4.5v17M10 6h5M10 10h5" /></>,
};

export default function CriarMenu({ t, className = 'bn-create', tamanho = 26, rotulo }) {
  const [aberto, setAberto] = useState(false);

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

      {aberto && (
        <div className="create-backdrop" onClick={() => setAberto(false)}>
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
        </div>
      )}
    </>
  );
}
