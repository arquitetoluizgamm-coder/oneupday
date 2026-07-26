'use client';
import { useEffect, useState } from 'react';

// ============================================================
// MENU DO PERFIL
//
// A capa tinha três botões flutuando por cima da foto: editar
// perfil, ver público e sair. Além de sujar a imagem, misturava
// coisas de peso muito diferente — trocar o nome e encerrar a
// sessão lado a lado, do mesmo tamanho.
//
// Agora tudo mora atrás de uma engrenagem. O conteúdo vem de
// fora (children), então esta peça não sabe nada sobre perfil:
// ela só abre, fecha e organiza.
//
// "Sair" fica separado no rodapé, com distância dos outros —
// é a única ação daqui que não dá pra desfazer com um toque.
// ============================================================
export default function ProfileMenu({ label, closeLabel, children, sair }) {
  const [aberto, setAberto] = useState(false);

  // Esc fecha, e o fundo para de rolar enquanto o painel está aberto
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e) => { if (e.key === 'Escape') setAberto(false); };
    document.addEventListener('keydown', onKey);
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = antes;
    };
  }, [aberto]);

  return (
    <>
      <button
        type="button"
        className="pm-gear"
        onClick={() => setAberto(true)}
        aria-label={label}
        title={label}
      >
        <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor"
          strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {aberto && (
        <div className="pm-back" role="dialog" aria-modal="true" onClick={() => setAberto(false)}>
          <div className="pm-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="pm-head">
              <b>{label}</b>
              <button type="button" className="pm-x" onClick={() => setAberto(false)} aria-label={closeLabel}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                  strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="pm-body">{children}</div>

            {sair && <div className="pm-sair">{sair}</div>}
          </div>
        </div>
      )}
    </>
  );
}
