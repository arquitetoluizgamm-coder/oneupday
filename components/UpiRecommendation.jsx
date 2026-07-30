'use client';

function fill(text, vars) {
  return String(text || '').replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

export default function UpiRecommendation({ item, labels }) {
  if (!item) return null;
  const line = item.tipo === 'comecou' ? labels.started
    : item.tipo === 'dificil' ? labels.hard
      : labels.moving;
  const name = item.owner?.name || 'alguém';

  return (
    <aside className="upi-recommendation" aria-label={labels.title}>
      <div className="upi-recommendation-head">
        <img src="/upi.svg" alt="Upi" />
        <div><b>Upi</b><span>{labels.title}</span></div>
      </div>
      <p>{fill(line, { name })}</p>
      {item.trecho && <blockquote>“{item.trecho}”</blockquote>}
      <a href={`/${item.journeySlug}`} className="upi-recommendation-link">
        <span><strong>{item.journeyTitle}</strong><small>{fill(labels.day, { d: item.dia, t: item.total })}</small></span>
        <span aria-hidden="true">›</span>
      </a>
    </aside>
  );
}
