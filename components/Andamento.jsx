'use client';

// EM ANDAMENTO — as histórias que você acompanha e ainda não terminaram.
// É a lista de séries que a pessoa está assistindo.
export default function Andamento({ itens, labels }) {
  const L = labels || {};
  if (!itens || !itens.length) return null;

  const linha = (x) => {
    const nome = (x.owner.name || '').split(' ')[0];
    if (x.tipo === 'voltou') return (L.voltou || '{name} voltou com o resultado').replace('{name}', nome);
    if (x.tipo === 'quase') return (L.quase || '{name} está no dia {d} de {t}').replace('{name}', nome).replace('{d}', x.dia).replace('{t}', x.total);
    return (L.esperando || '{name} ainda não voltou').replace('{name}', nome);
  };

  return (
    <article className="entry aux-post an-block">
      <header className="aux-post-head"><span className="aux-post-mark" aria-hidden="true">◌</span><div><b>{L.title || 'In progress'}</b><small>{L.sub || 'Stories people are still following.'}</small></div></header>
      <div className="an-scroll">
        {itens.map((x, i) => {
          const p = x.owner || {};
          const first = (p.name || '?').split(' ')[0];
          return (
            <a className={`an-card an-${x.tipo}`} key={i} href={`/${x.slug}`}>
              <span className="an-top">
                <span className="an-ava" style={{ background: p.avatar_color || 'var(--orange)' }}>
                  {p.avatar_url ? <img src={p.avatar_url} alt="" /> : first[0]}
                </span>
                <b>{linha(x)}</b>
              </span>
              {x.tipo === 'voltou' && x.resultado && <q>{x.resultado}</q>}
              {x.tipo !== 'voltou' && x.passo && <q>{x.passo}</q>}
              <span className="an-go">
                {x.tipo === 'voltou' ? (L.ver || 'ver resultado') : (L.acompanhar || 'acompanhar')} ›
              </span>
            </a>
          );
        })}
      </div>
    </article>
  );
}

// HOJE — a porta de entrada: o seu próprio capítulo esperando.
export function Hoje({ dado, nome, labels }) {
  const L = labels || {};
  if (!dado) return null;
  const primeiro = (nome || '').split(' ')[0];

  return (
    <section className="hj-block">
      <span className="hj-hi">{(L.oi || 'Bom dia, {name}.').replace('{name}', primeiro)}</span>
      {dado.postouHoje ? (
        <p className="hj-q done">{L.feito || 'Você já registrou hoje. O dia está guardado.'}</p>
      ) : dado.passo ? (
        <>
          <p className="hj-q">{L.disse || 'Você disse que hoje ia:'}</p>
          <p className="hj-step">{dado.passo}{dado.quando ? <em> · {dado.quando}</em> : null}</p>
          <a className="hj-cta" href="/perfil">{L.cta || 'Registrar o dia'}</a>
        </>
      ) : (
        <>
          <p className="hj-q">{L.pergunta || 'O que merece um passo seu hoje?'}</p>
          <a className="hj-cta" href="/perfil">{L.cta || 'Registrar o dia'}</a>
        </>
      )}
    </section>
  );
}
