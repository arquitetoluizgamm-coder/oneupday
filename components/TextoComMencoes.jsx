import { pedacosDoTexto } from '../lib/mencoes';

// ============================================================
// TEXTO COM MENÇÕES — o lado de mostrar
//
// Recebe o texto e o mapa de quem foi marcado, e devolve o texto com
// os @ virando link.
//
// ------------------------------------------------------------
// POR QUE NÃO EXISTE dangerouslySetInnerHTML AQUI
//
// A saída natural para "transformar @ana em link" seria montar uma
// string de HTML e injetar. É também a forma mais direta de abrir um
// XSS: o texto vem de qualquer pessoa do app, e basta um
// `<img onerror=...>` para executar código no navegador de quem lê.
//
// `pedacosDoTexto` devolve uma LISTA de pedaços, nunca HTML. O React
// escapa cada pedaço sozinho, e uma tag escrita no texto aparece
// como tag escrita — que é o que ela é.
//
// ------------------------------------------------------------
// UM @ SEM DONO CONTINUA SENDO TEXTO
//
// Só vira link quem está no mapa, e o mapa vem da tabela `mentions`,
// por id. Escrever "@qualquercoisa" não cria link para lugar nenhum,
// e uma pessoa que trocou de handle continua sendo encontrada — o
// que aparece na tela é o handle atual dela.
// ============================================================
export default function TextoComMencoes({ texto, porHandle, className }) {
  const pedacos = pedacosDoTexto(texto, porHandle || {});
  return (
    <>
      {pedacos.map((p, i) => (
        p.tipo === 'mencao'
          ? (
            <a key={i} className={`mencao ${className || ''}`.trim()}
              href={`/${p.valor}`}
              title={p.perfil?.name || undefined}
              onClick={(e) => e.stopPropagation()}>
              {p.valor}
            </a>
          )
          : <span key={i}>{p.valor}</span>
      ))}
    </>
  );
}
