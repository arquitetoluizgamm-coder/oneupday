'use client';

// Capacidades em construção.
// Nem toda jornada tem número — mas toda jornada constrói capacidade.
// O app mostra a evidência com data; a conclusão é da pessoa.
export default function Capacidades({ lista, labels }) {
  const L = labels || {};
  if (!lista || !lista.length) return null;

  const conteudo = (c) => {
    if (c.id === 'voltar') {
      return {
        titulo: L.voltarTitulo || 'Sua capacidade de voltar está crescendo.',
        provas: [
          (L.voltarAntes || 'Antes, uma pausa durava em média {d} dias.').replace('{d}', c.antesDias),
          (L.voltarAgora || 'Nas últimas {n} vezes, você voltou em até {d} dias.').replace('{n}', c.quantas).replace('{d}', c.agoraDias),
          (L.voltarMaior || 'A maior pausa que você já atravessou foi de {d} dias — e você voltou.').replace('{d}', c.maiorPausa),
        ],
      };
    }
    if (c.id === 'dificil') {
      return {
        titulo: L.dificilTitulo || 'Você está aprendendo a continuar no dia ruim.',
        provas: [
          (L.dificilProva || 'Depois de {t} dias difíceis registrados, você voltou no dia seguinte em {n} deles.').replace('{t}', c.total).replace('{n}', c.seguidos),
        ],
      };
    }
    return {
      titulo: L.presencaTitulo || 'Sua constância está virando rotina.',
      provas: [
        (L.presencaProva || '{d} dias seguidos sem uma única pausa.').replace('{d}', c.corridos),
      ],
    };
  };

  return (
    <section className="cap-block">
      <h3 className="cap-title">{L.title || 'Capacidades em construção'}</h3>
      {lista.map((c, i) => {
        const x = conteudo(c);
        return (
          <article className={`cap-card cap-${c.id}`} key={i}>
            <span className="cap-mark" aria-hidden="true">
              {c.id === 'voltar' ? '↺' : c.id === 'dificil' ? '△' : '•'}
            </span>
            <div className="cap-body">
              <b>{x.titulo}</b>
              <ul>
                {x.provas.map((p, k) => <li key={k}>{p}</li>)}
              </ul>
            </div>
          </article>
        );
      })}
      <p className="cap-note">{L.note || 'Isto vem dos seus próprios registros. Nada aqui é comparado com outra pessoa.'}</p>
    </section>
  );
}
