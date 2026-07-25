'use client';

// Linha do desafio no feed: avatar → linha se desenha → avatar + título
export default function ChallengeStrip({ challenge }) {
  const c = challenge || {};
  const Ava = ({ p }) => (
    <span className="ch-sava" style={{ background: (p && p.avatar_color) || 'var(--orange)' }}>
      {p && p.avatar_url ? <img src={p.avatar_url} alt="" /> : ((p && p.name) || '?')[0]}
    </span>
  );
  return (
    <a className="ch-strip" href={`/desafio/${c.id}`}>
      <Ava p={c.from} />
      <span className="ch-sline" aria-hidden="true"><i /></span>
      <Ava p={c.to} />
      <span className="ch-stitle">{c.title}</span>
    </a>
  );
}
