'use client';

// O amanhã dos outros: hora marcada pra voltar.
// Quem começou hoje, quem termina amanhã, quem chega num marco.
export default function Amanha({ people, labels }) {
  const L = labels || {};
  const list = people || [];
  if (!list.length) return null;

  const frase = (x) => {
    const nome = (x.owner.name || '').split(' ')[0];
    if (x.tipo === 'comecou') return (L.comecou || '{name} começou hoje').replace('{name}', nome);
    if (x.tipo === 'chegou') return (L.chegou || '{name} chegou ao dia {t}').replace('{name}', nome).replace('{t}', x.total);
    if (x.tipo === 'termina') return (L.termina || '{name} termina amanhã').replace('{name}', nome);
    return (L.marco || '{name} chega ao dia {d} amanhã').replace('{name}', nome).replace('{d}', x.dia);
  };

  return (
    <article className="entry aux-post am-block">
      <header className="aux-post-head"><span className="aux-post-mark" aria-hidden="true">↗</span><div><b>{L.title || 'Tomorrow around here'}</b><small>{L.sub || 'Some journeys continue tomorrow.'}</small></div></header>
      <div className="am-list">
        {list.map((x, i) => {
          const p = x.owner || {};
          const first = (p.name || '?').split(' ')[0];
          return (
            <a className={`am-row ${x.tipo}`} key={i} href={`/${x.journeySlug}`}>
              <span className="am-ava" style={{ background: p.avatar_color || 'var(--orange)' }}>
                {p.avatar_url ? <img src={p.avatar_url} alt="" /> : first[0]}
              </span>
              <span className="am-txt">
                <b>{frase(x)}</b>
                <small>{x.journeyTitle}</small>
              </span>
              <span className="am-go" aria-hidden="true">›</span>
            </a>
          );
        })}
      </div>
    </article>
  );
}
