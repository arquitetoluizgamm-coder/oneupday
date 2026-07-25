'use client';

// Linha do desafio no feed: raio + avatar → linha se desenha → avatar + título
export default function ChallengeStrip({ challenge, labels }) {
  const c = challenge || {};
  const L = labels || {};
  const Ava = ({ p }) => (
    <span className="ch-sava" style={{ background: (p && p.avatar_color) || 'var(--orange)' }}>
      {p && p.avatar_url ? <img src={p.avatar_url} alt="" /> : ((p && p.name) || '?')[0]}
    </span>
  );
  return (
    <a className="ch-strip" href={`/desafio/${c.id}`}>
      <svg className="ch-sbolt" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" /></svg>
      <Ava p={c.from} />
      <span className="ch-sline" aria-hidden="true"><i /></span>
      <Ava p={c.to} />
      <span className="ch-sbody">
        <span className="ch-stag">{L.stripTag || 'Desafio'}</span>
        <span className="ch-stitle">{c.title}</span>
      </span>
      <span className="ch-ssee">{L.stripSee || ''} ›</span>
    </a>
  );
}
