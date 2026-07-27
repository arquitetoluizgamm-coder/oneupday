// ============================================================
// A JORNADA DE EXEMPLO — desenhada, não fotografada
//
// Reproduz a página de uma jornada com o mesmo visual do app.
// Preferi isto a uma captura de tela por quatro razões:
//
//   1. fica nítida em qualquer tela, sem imagem de 2x pesando
//   2. muda junto com a marca — captura envelhece sozinha
//   3. o texto continua sendo TEXTO: buscador lê, leitor de tela
//      lê, e a história é o melhor conteúdo desta página
//   4. dá para destacar o dia da recaída, que é o argumento
//
// O selo "exemplo" fica visível de propósito: a pessoa não é
// real, e o app não finge que é.
// ============================================================
export default function JornadaExemplo({ j, t }) {
  const total = j.dias.length;
  const tag = (k) => (k === 'setback' ? t.tagSetback : k === 'win' ? t.tagWin : null);

  return (
    <div className="jex">
      <div className="jex-capa">
        <span className="jex-selo">{t.exemploSelo}</span>
        <h3>{j.titulo}</h3>
        <p>{j.motivo}</p>
      </div>

      <div className="jex-autor">
        <img src="/ex-ana.jpg" alt="" />
        <div>
          <b>{j.autor}</b>
          <span>{j.handle} · {t.dayShort.replace('{d}', total)} {t.cardOf} {total}</span>
        </div>
        <span className="jex-cat">{j.categoria}</span>
      </div>

      <div className="jex-nums">
        <div><b>{total}</b><span>{t.exemploDias}</span></div>
        <div><b>{total}</b><span>{t.exemploPresenca}</span></div>
        <div><b>100%</b><span>{t.exemploProgresso}</span></div>
      </div>

      <div className="jex-barra"><i /></div>
      <div className="jex-barra-leg">
        <span>{t.dayShort.replace('{d}', total)} {t.cardOf} {total}</span><b>100%</b>
      </div>

      <ol className="jex-dias">
        {j.dias.slice().reverse().map((d) => (
          <li key={d.d} className={d.k}>
            <span className="jex-ponto" aria-hidden="true" />
            <div className="jex-corpo">
              <div className="jex-cab">
                <b>{t.dayShort.replace('{d}', d.d)}</b>
                {tag(d.k) && <span className={`jex-tag ${d.k}`}>{tag(d.k)}</span>}
              </div>
              {d.foto && <img className="jex-foto" src={d.foto} alt="" loading="lazy" />}
              <p>{d.t}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
