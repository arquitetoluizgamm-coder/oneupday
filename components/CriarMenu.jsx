'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const ICONES = {
  hoje: <path d="M4 19h16M6 15.5 15.5 6a2.1 2.1 0 0 1 3 3L9 18.5l-4 1z" />,
  midia: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m4 18 5-5 4 4 3-3 4 4" /></>,
  jornada: <path d="M5 12h14M12 5v14" />,
  rotina: <><path d="M12 3v18M5 7c2.5 0 4.5 1.5 7 4 2.5-2.5 4.5-4 7-4M5 17c2.5 0 4.5-1.5 7-4 2.5 2.5 4.5 4 7 4" /></>,
  citacao: <><path d="M4 6h16M4 11h11" /><path d="M7 20c-1.6 0-2.6-1-2.6-2.6 0-1.5 1-2.6 2.4-2.6 1.3 0 2.2.9 2.2 2.2 0 1.9-1.4 3.4-3.4 4.2" /><path d="M15 20c-1.6 0-2.6-1-2.6-2.6 0-1.5 1.1-2.6 2.4-2.6 1.3 0 2.2.9 2.2 2.2 0 1.9-1.4 3.4-3.4 4.2" /></>,
  biblia: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v18H7.5A3.5 3.5 0 0 0 4 23z" /><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v18h4.5a3.5 3.5 0 0 1 3.5 3z" /><path d="M8 7h1.5M14.5 7H16" /></>,
  diario: <><path d="M6 4.5A2.5 2.5 0 0 1 8.5 2H19v17H8.5A2.5 2.5 0 0 0 6 21.5z" /><path d="M6 4.5v17M10 6h5M10 10h5" /></>,
  futuro: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2M5 4 3 2M19 4l2-2" /></>,
};

export default function CriarMenu({ t, className = 'bn-create', tamanho = 26, rotulo }) {
  const [aberto, setAberto] = useState(false);
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  useEffect(() => {
    if (!aberto) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') setAberto(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [aberto]);
  const opcoes = [
    { href: '/perfil', icone: 'hoje', texto: t.navToday, principal: true },
    { href: '/midia', icone: 'midia', texto: t.navMedia },
    { href: '/citacao', icone: 'citacao', texto: t.navQuote },
    { href: '/mensagem-biblica', icone: 'biblia', texto: t.navBible },
    { href: '/diario', icone: 'diario', texto: t.navDiary },
    { href: '/futuro', icone: 'futuro', texto: t.futureTitle },
    { href: '/new', icone: 'jornada', texto: t.navJourney },
    { href: '/rotinas', icone: 'rotina', texto: t.navRoutine || 'Nova rotina' },
  ];
  return <>
    <button type="button" className={className} onClick={() => setAberto(true)} aria-label={rotulo || t.navCreate} title={rotulo || t.navCreate}>
      <svg viewBox="0 0 24 24" width={tamanho} height={tamanho} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
    </button>
    {aberto && montado && createPortal(<div className="create-backdrop" onClick={() => setAberto(false)} role="dialog" aria-modal="true" aria-label={rotulo || t.navCreate}>
      <div className="create-menu" onClick={(event) => event.stopPropagation()}>{opcoes.map((option) => <a key={option.href + option.icone} href={option.href} className={`cm-item${option.principal ? ' cm-main' : ''}`}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONES[option.icone]}</svg>{option.texto}</a>)}</div>
    </div>, document.body)}
  </>;
}
