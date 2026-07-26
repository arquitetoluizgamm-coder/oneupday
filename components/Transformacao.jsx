'use client';

// Antes & Depois: a foto do primeiro dia ao lado da de hoje.
// É o que faz alguém olhar e pensar "eu quero ver o meu assim".
export default function Transformacao({ item, labels }) {
  const L = labels || {};
  if (!item) return null;
  const p = item.owner || {};
  const first = (p.name || '?').split(' ')[0];

  return (
    <article className="tr-card">
      <a className="tr-head" href={`/${p.handle || item.journeySlug}`}>
        <span className="tr-ava" style={{ background: p.avatar_color || 'var(--orange)' }}>
          {p.avatar_url ? <img src={p.avatar_url} alt="" /> : first[0]}
        </span>
        <span className="tr-who">
          <b>{p.name}</b>
          <small>{item.journeyTitle}</small>
        </span>
        <span className="tr-tag">{L.tag || 'Antes & depois'}</span>
      </a>

      <a className="tr-pair" href={`/${item.journeySlug}`}>
        <span className="tr-side">
          <img src={item.antes.url} alt="" />
          <em>{(L.dayFmt || 'Dia {d}').replace('{d}', item.antes.day)}</em>
        </span>
        <span className="tr-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="butt"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
        </span>
        <span className="tr-side">
          <img src={item.depois.url} alt="" />
          <em>{(L.dayFmt || 'Dia {d}').replace('{d}', item.depois.day)}</em>
        </span>
      </a>

      <a className="tr-foot" href={`/${item.journeySlug}`}>
        {(L.gap || '{n} dias de distância entre as duas').replace('{n}', item.salto)}
        <span className="tr-see">{L.see || 'ver a jornada'} ›</span>
      </a>
    </article>
  );
}
