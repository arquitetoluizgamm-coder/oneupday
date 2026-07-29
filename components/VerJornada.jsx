// ============================================================
// "VER JORNADA COMPLETA"
//
// O card do feed já levava para a jornada por três caminhos — a
// foto, o cartão de texto e o nome de quem escreveu. Nenhum deles
// se anuncia: quem não tenta, não descobre. Este é o único com
// rótulo.
//
// Discreto de propósito. Ele não disputa com apoiar e comentar,
// que são as ações do feed; é uma saída, não uma chamada. Fica
// translúcido no canto e ganha corpo no toque.
//
// `stopPropagation` porque ele mora DENTRO de uma área que já é
// link. Sem isso, o clique acionaria os dois — e o de fora
// venceria, deixando este botão sem função própria.
// ============================================================
export default function VerJornada({ slug, label, claro = false }) {
  if (!slug) return null;
  return (
    <a
      href={`/${slug}`}
      className={`ver-jornada${claro ? ' claro' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
        strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12h14M13 6l6 6-6 6" />
      </svg>
      {label}
    </a>
  );
}
