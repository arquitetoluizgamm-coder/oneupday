import { ONE_VIEWBOX, ONE_CAMINHOS } from '../lib/marcaOne';

// ============================================================
// A MARCA NA INTERFACE: ONE
//
// "One Up Day" continua sendo o nome oficial. ONE é a abreviação,
// e ela vive só DENTRO do app — onde quem olha já sabe o que ela
// abrevia.
//
// A regra que decide onde cada uma aparece tem um critério só:
//
//   Peça que SAI do app  →  nome completo.
//   Peça vista só por quem já está dentro  →  ONE.
//
// Por isso os três cards compartilháveis, a imagem de prévia do
// link, a landing, a Play Store e os institucionais continuam
// escrevendo "One Up Day": eles caem na frente de gente que nunca
// ouviu falar do app, e abreviação só funciona para quem já sabe
// o que ela abrevia. Nenhum deles foi alterado.
//
// ------------------------------------------------------------
// POR QUE VETOR E NÃO PNG
//
// O wordmark era `/logo-name.png`: 19 KB de bitmap que borra em
// tela retina. Em vetor são 4 KB, nítidos em qualquer tamanho.
//
// As cores vêm do próprio arquivo da marca e são as MESMAS nos
// dois fundos. Conferido antes de decidir: sálvia e terracota dão
// 6,02 e 5,31 sobre o azul-noite, 3,18 e 3,60 sobre branco. Não
// precisa de versão clara e versão escura — e menos variantes é
// menos coisa para sair do lugar com o tempo.
// ============================================================
export function Wordmark({ height = 26, title = 'One Up Day' }) {
  return (
    <svg className="one-mark" viewBox={ONE_VIEWBOX} height={height} role="img" aria-label={title}>
      {ONE_CAMINHOS.map((p) => (
        <path key={p.chave} d={p.d} fill={p.cor} />
      ))}
    </svg>
  );
}

// ============================================================
// O SÍMBOLO — o "1" com o movimento ascendente
//
// Este NÃO mudou de ideia: já era isso em public/logo-icon.svg, e
// é o ícone do aplicativo. Só deixou de ser PNG para poder herdar
// a cor da tinta da página.
// ============================================================
export function Symbol({ size = 32 }) {
  return (
    <svg className="one-symbol" width={size} height={size} viewBox="0 0 1024 1024" aria-hidden="true">
      <defs>
        <linearGradient id="oneSymUp" x1="220" y1="700" x2="790" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f02f87" />
          <stop offset=".54" stopColor="#ff7a45" />
          <stop offset="1" stopColor="#ffd33d" />
        </linearGradient>
      </defs>
      <path d="M420 650V250L285 354V220L468 78h132v572z" fill="var(--ink,#090c2a)" />
      <path d="M220 700c255-44 430-188 590-565" fill="none" stroke="url(#oneSymUp)" strokeWidth="86" strokeLinecap="round" />
      <path d="M735 160l112-66 62 118" fill="none" stroke="#ffd33d" strokeWidth="86" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ href = '/', size = 26, showText = false }) {
  const inner = (
    <>
      <Wordmark height={size} />
      {showText && <span className="oud-word">One <b>Up</b> Day</span>}
    </>
  );
  if (href === false) return <span className="brand-logo">{inner}</span>;
  return <a className="brand-logo" href={href} aria-label="One Up Day">{inner}</a>;
}
