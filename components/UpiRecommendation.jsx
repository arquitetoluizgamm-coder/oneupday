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
      <a href={`/${item.journeySlug}`} className="upi-recommendation-link">
        <span className="upi-rec-body">
          <span className="upi-rec-line">{fill(line, { name })}</span>
          {item.trecho && <span className="upi-rec-quote">“{item.trecho}”</span>}
          <span className="upi-rec-journey">
            <strong>{item.journeyTitle}</strong>
            <small>{fill(labels.day, { d: item.dia, t: item.total })}</small>
          </span>
        </span>
        <span className="upi-rec-arrow" aria-hidden="true">›</span>
      </a>
    </aside>
  );
}
