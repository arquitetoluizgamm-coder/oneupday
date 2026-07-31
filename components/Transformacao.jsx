'use client';

// Antes e depois: a primeira foto da jornada ao lado da mais recente.
export default function Transformacao({ item, labels }) {
  const L = labels || {};
  if (!item) return null;
  const p = item.owner || {};
  const first = (p.name || '?').split(' ')[0];
  const gapLabel = item.salto === 1
    ? (L.gapOne || '1 dia entre esses dois capítulos')
    : (L.gap || '{n} dias entre esses dois capítulos').replace('{n}', item.salto);

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
        <span className="tr-tag">{L.tag || 'Antes e depois'}</span>
      </a>

      <a className="tr-pair" href={`/${item.journeySlug}`} aria-label={`${L.see || 'Ver a jornada'}: ${item.journeyTitle}`}>
        <span className="tr-side">
          <img src={item.antes.url} alt="" />
          <em>{(L.dayFmt || 'Dia {d}').replace('{d}', item.antes.day)}</em>
        </span>
        <span className="tr-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M14 7l5 5-5 5" /></svg>
        </span>
        <span className="tr-side">
          <img src={item.depois.url} alt="" />
          <em>{(L.dayFmt || 'Dia {d}').replace('{d}', item.depois.day)}</em>
        </span>
      </a>

      <a className="tr-foot" href={`/${item.journeySlug}`}>
        <span>{gapLabel}</span>
        <span className="tr-see">{L.see || 'Ver a jornada'} <span aria-hidden="true">›</span></span>
      </a>
    </article>
  );
}
