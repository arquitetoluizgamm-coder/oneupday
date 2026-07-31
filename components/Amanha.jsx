'use client';

// O amanhã dos outros: hora marcada pra voltar.
// Quem começou hoje, quem termina amanhã, quem chega num marco.
export default function Amanha({ people, labels }) {
  const L = labels || {};
  const list = people || [];
  if (!list.length) return null;

  const numeroDoDia = (x) => {
    if (x.tipo === 'chegou' && x.total) return x.total;
    return x.dia || x.total || 1;
  };

  const selo = (x) => {
    const numero = numeroDoDia(x);
    if (x.tipo === 'chegou') return (L.doneDay || 'Dia {d} concluído').replace('{d}', numero);
    return (L.reachedDay || 'Chegou ao dia {d}').replace('{d}', numero);
  };

  return (
    <article className="entry aux-post am-block">
      <header className="aux-post-head am-head">
        <span className="aux-post-mark am-mark" aria-hidden="true"><span /></span>
        <div>
          <b>{L.title || 'Amanhã, a jornada continua.'}</b>
          <small>{L.sub || 'Hoje, essas pessoas deram mais um passo.'}</small>
        </div>
      </header>
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
                <span className="am-line">
                  <b>{first}</b>
                  <em>{selo(x)}</em>
                </span>
                <small>{x.journeyTitle}</small>
              </span>
              <span className="am-go" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </span>
            </a>
          );
        })}
      </div>
    </article>
  );
}
