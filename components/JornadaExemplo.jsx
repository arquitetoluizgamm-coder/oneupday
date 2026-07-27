// ============================================================
// A JORNADA DE EXEMPLO — desenhada, não fotografada
//
// Reproduz a página de uma jornada com o visual do app. Preferi
// isto a uma captura de tela por quatro razões:
//   1. fica nítida em qualquer tela, sem imagem de 2x pesando
//   2. muda junto com a marca — captura envelhece sozinha
//   3. o texto continua sendo TEXTO: buscador lê, leitor de tela
//      lê, e a história é o melhor conteúdo desta página
//   4. dá para destacar o dia difícil, que é o argumento
//
// ---- TRÊS CAPÍTULOS, NÃO SETE ----
// Os sete de uma vez viravam uma parede de texto no celular.
// Aparecem três — começo, dificuldade, significado — que contam
// o arco inteiro em segundos. Os outros quatro ficam atrás de um
// <details>, que é HTML puro: abre sem JavaScript, funciona com
// leitor de tela e não custa um byte de script.
//
// O selo "exemplo" fica visível de propósito: a pessoa não é
// real, e o app não finge que é.
// ============================================================
export default function JornadaExemplo({ j, t }) {
  const pct = Math.round((j.dia / j.total) * 100);
  const destaques = j.dias.filter((d) => d.destaque);
  const resto = j.dias.filter((d) => !d.destaque);

  const Dia = ({ d, comRotulo }) => (
    <li className={d.k}>
      <span className="jex-ponto" aria-hidden="true" />
      <div className="jex-corpo">
        <div className="jex-cab">
          <b>{t.dayShort.replace('{d}', d.d)}</b>
          {comRotulo && d.rotulo && <em className="jex-rotulo">{d.rotulo}</em>}
          {d.k === 'setback' && <span className="jex-tag setback">{j.tagDificil}</span>}
        </div>
        {d.foto && <img className="jex-foto" src={d.foto} alt="" loading="lazy" />}
        <p>{d.t}</p>
      </div>
    </li>
  );

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
          <span>{j.handle} · {t.dayShort.replace('{d}', j.dia)} {t.cardOf} {j.total}</span>
        </div>
        <span className="jex-cat">{j.categoria}</span>
      </div>

      {/* Números qualitativos. "1 pausa" e "1 retorno" contados como
          conquista — e não uma porcentagem de perfeição — dizem mais
          sobre o produto do que qualquer barra cheia. */}
      <ul className="jex-nums">
        {j.nums.map((n) => <li key={n.r}><b>{n.n}</b><span>{n.r}</span></li>)}
      </ul>

      <div className="jex-barra"><i style={{ width: pct + '%' }} /></div>

      <ol className="jex-dias">
        {destaques.map((d) => <Dia key={d.d} d={d} comRotulo />)}
      </ol>

      <details className="jex-mais">
        <summary>{j.verTudo}</summary>
        <ol className="jex-dias jex-dias-resto">
          {resto.map((d) => <Dia key={d.d} d={d} />)}
        </ol>
      </details>

      {/* O que deixa a história em aberto. É também o mecanismo real do
          produto: ninguém termina o dia sem deixar algo para o próximo. */}
      <div className="jex-proximo">
        <b>{j.proximoT}</b>
        <p>{j.proximo}</p>
      </div>
    </div>
  );
}
