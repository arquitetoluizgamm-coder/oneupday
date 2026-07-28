import { ONE_VIEWBOX_COM_NOME, ONE_CENTRO_X, ONE_CAMINHOS, ONE_LARGURAS } from '../lib/marcaOne';

// ============================================================
// A MARCA QUE SE DESENHA — agora ONE
//
// Motion oficial: tudo se desenha, nada pisca.
// cubic-bezier(.22,1,.36,1)
//
// O logo antigo era feito de TRAÇOS, e por isso dava para animar
// com stroke-dashoffset: a linha se desenhava sozinha. O ONE
// vetorizado é feito de CONTORNOS PREENCHIDOS — não existe traço
// para percorrer, e stroke-dash não faz nada neles.
//
// A tradução honesta de "se desenha" para forma preenchida é a
// máscara que abre: cada letra é revelada da esquerda para a
// direita, na ordem de leitura. Não é fade — fade é aparecer, e o
// motion da marca é aparecer FAZENDO.
//
// O E entra em duas partes porque ele É duas partes: o bojo de
// cima (o D) e o de baixo (o U). Revelar os dois juntos esconderia
// justamente o que a letra tem de próprio.
//
// A ordem das peças em lib/marcaOne.js é a ordem de LEITURA, não a
// do arquivo de origem. Ordenar só por x colocava o bojo de baixo
// antes do de cima — as duas metades do E começam quase na mesma
// coluna, e o desempate tem que ser por altura.
//
// ------------------------------------------------------------
// A PALAVRA FICA PERTO DA MARCA
//
// Na primeira versão eu usei o viewBox do arquivo (0 0 1024 672),
// que tem 38% de espaço vazio, e coloquei o texto em y=800. Deu
// uma distância enorme entre a marca e "ONE UP DAY" — as duas
// coisas pareciam de peças diferentes.
//
// Agora o viewBox é justo na tinta e o texto entra logo abaixo,
// a 0,38 da altura da marca: a mesma proporção do logo antigo,
// para a peça não mudar de respiração ao trocar de desenho.
//
// "ONE UP DAY" continua escrito, e aqui é obrigatório: esta peça
// aparece no login e na landing, que é onde alguém vê o app pela
// primeira vez. Abreviação diante de estranho precisa vir
// acompanhada do que ela abrevia.
// ============================================================
export default function AnimatedLogo() {
  return (
    <svg className="oud-anim one-anim" viewBox={ONE_VIEWBOX_COM_NOME} aria-label="ONE — One Up Day">
      <defs>
        {ONE_CAMINHOS.map((p) => (
          <clipPath key={p.chave} id={`oneCorte-${p.chave}`}>
            {/* A faixa cresce da esquerda para a direita na animação.
                Começa em 0 para a letra nascer do nada, e não de um
                retângulo aparecendo. O x é 160 porque é ali que o
                viewBox justo começa. */}
            <rect className={`oa-corte oa-${p.chave}`} x="160" y="214" width="0" height="263"
              style={{ '--ate': `${ONE_LARGURAS[p.chave]}px` }} />
          </clipPath>
        ))}
      </defs>
      {ONE_CAMINHOS.map((p) => (
        <path key={p.chave} d={p.d} fill={p.cor} clipPath={`url(#oneCorte-${p.chave})`} />
      ))}
      <text className="oa-word" x={ONE_CENTRO_X} y="570" textAnchor="middle">ONE UP DAY</text>
    </svg>
  );
}
