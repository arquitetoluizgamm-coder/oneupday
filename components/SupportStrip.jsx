'use client';

export default function SupportStrip({ people, title }) {
  if (!people || !people.length) return null;
  const animate = people.length >= 4;
  const list = animate ? [...people, ...people] : people;
  const Avatar = (p, idx) => {
    const first = (p.name || '?').split(' ')[0];
    const inner = (
      <span className="ss-ava" style={{ background: p.avatar_color || 'var(--muted)' }}>
        {p.avatar_url ? <img src={p.avatar_url} alt="" /> : first[0]}
      </span>
    );
    return p.handle
      ? <a key={idx} href={`/${p.handle}`} className="ss-person" title={p.name} aria-label={p.name}>{inner}</a>
      : <span key={idx} className="ss-person" title={p.name}>{inner}</span>;
  };
  return (
    <div className="support-strip">
      <span className="ss-title">{title}</span>
      <div className="ss-viewport">
        <div className={`ss-track${animate ? ' anim' : ''}`}>
          {list.map((p, idx) => Avatar(p, idx))}
        </div>
      </div>
    </div>
  );
}
