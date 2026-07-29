'use client';
import { useState, useEffect } from 'react';

const KEY = 'oud-heart-seen';

// Mostra só o que chegou de novo desde a última olhada.
// Depois de ver, some — e só volta quando houver algo novo de verdade.
export default function HeaderHeart({ likes = 0, follows = 0, unread = 0, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const [novo, setNovo] = useState({ likes: 0, follows: 0 });

  function marcarVisto() {
    try { localStorage.setItem(KEY, JSON.stringify({ likes, follows })); } catch {}
  }

  useEffect(() => {
    let visto = { likes: 0, follows: 0 };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) visto = JSON.parse(raw) || visto;
    } catch {}

    const nLikes = Math.max(0, likes - (visto.likes || 0));
    const nFollows = Math.max(0, follows - (visto.follows || 0));

    // nada novo: acerta o marcador (caso o total tenha caído) e fica quieto
    if (nLikes === 0 && nFollows === 0) {
      try { localStorage.setItem(KEY, JSON.stringify({ likes, follows })); } catch {}
      return;
    }

    setNovo({ likes: nLikes, follows: nFollows });
    const t = setTimeout(() => setOpen(true), 600);
    const h = setTimeout(() => {
      setOpen(false);
      try { localStorage.setItem(KEY, JSON.stringify({ likes, follows })); } catch {}
    }, 5200);
    return () => { clearTimeout(t); clearTimeout(h); };
  }, [likes, follows]);

  function dispensar() {
    setOpen(false);
    marcarVisto();
  }

  const has = (novo.likes + novo.follows) > 0;

  return (
    <div className="header-heart">
      <a href="/notifications" className={`icon-btn heart-btn upi-sino${unread > 0 ? ' tem' : ''}`}
        aria-label={ariaLabel} onClick={marcarVisto}>
        {/* ============================================================
            O UPI NO LUGAR DO SINO

            Antes era um sino neutro com uma bolinha vermelha colada do
            lado: um selo genérico num ícone genérico. O Upi já tem um
            pingo — então o indicador deixa de ser um crachá pregado no
            ícone e passa a ser uma parte do personagem.

              pingo parado ..... nada novo
              pingo pulsando ... tem coisa

            ------------------------------------------------------------
            SEM ROSTO, E O MOTIVO É ARITMÉTICO

            Os olhos têm 1,7 unidades de largura num desenho de 24. Nos
            30px em que este ícone vive, isso vira 2,1px reais, e a boca
            1,7. Não existe traço fino que sobreviva a esse tamanho — o
            que sobrevive é a silhueta. Com rosto, o ícone só começa a
            ler a partir de 34px; sem rosto, lê a 26.

            E há um ganho que não é de legibilidade: sem os olhos e o
            sorriso, o pingo passa a ser a única coisa viva no ícone.
            Ele não compete com mais nada — que é exatamente o que este
            botão precisa dizer.

            O Upi de rosto continua existindo inteiro em `public/upi.svg`,
            nos tamanhos onde ele cabe: a saudação da tela inicial, o
            Diário, o progresso do perfil.
            ============================================================ */}
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" aria-hidden="true" className="upi-mini">
          <path className="um-corpo" d="M7.4 5.2 L7.4 13 A4.6 4.6 0 0 0 16.6 13 L16.6 9.4"
            stroke="currentColor" strokeWidth="2.3" />
          {/* o brilho por baixo e o anel por cima: só aparecem com novidade */}
          <circle className="um-brilho" cx="16.6" cy="6.1" r="2.5" fill="var(--upi-pingo,#C16F54)" />
          <circle className="um-halo" cx="16.6" cy="6.1" r="2.5" fill="none"
            stroke="var(--upi-pingo,#C16F54)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          <circle className="um-pingo" cx="16.6" cy="6.1" r="2.5" fill="var(--upi-pingo,#C16F54)" />
        </svg>
      </a>
      {open && has && (
        <div className="heart-pop" role="status" onClick={dispensar}>
          {novo.likes > 0 && (
            <span className="hp-stat likes">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M12 20.5S3.5 15.5 3.5 9.2C3.5 6.4 5.6 4.5 8 4.5c1.7 0 3.1 1 4 2.4.9-1.4 2.3-2.4 4-2.4 2.4 0 4.5 1.9 4.5 4.7 0 6.3-8.5 11.3-8.5 11.3z" /></svg>
              {novo.likes}
            </span>
          )}
          {novo.follows > 0 && (
            <span className="hp-stat follows">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.4" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
              {novo.follows}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
