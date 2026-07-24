'use client';
import { MOODS } from '../lib/moods';

export default function NeedsSupport({ people, labels }) {
  if (!people || !people.length) return null;
  return (
    <section className="needs">
      <span className="needs-title">{labels.title}</span>
      <div className="needs-list">
        {people.map((p) => (
          <a key={p.id} className="needs-person" href={`/${p.handle || ''}`}>
            <span className="needs-ava" style={{ background: p.avatar_color || 'var(--muted)', boxShadow: MOODS[p.mood] ? `0 0 0 2px #fff, 0 0 0 4px ${MOODS[p.mood]}99, 0 0 12px ${MOODS[p.mood]}88` : undefined }}>
              {p.avatar_url ? <img src={p.avatar_url} alt="" /> : (p.name || '?')[0]}
            </span>
            <b>{(p.name || '').split(' ')[0]}</b>
            <small>{labels.cta}</small>
          </a>
        ))}
      </div>
    </section>
  );
}
