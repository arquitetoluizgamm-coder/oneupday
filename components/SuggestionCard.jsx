'use client';
import FollowUserButton from '../app/[slug]/FollowUserButton';

// Carrossel de pessoas pra caminhar junto.
// Anti-Instagram: a ordem prioriza quem precisa de companhia
// (menos seguidores, começando agora) — nunca quem é popular.
export default function SuggestionCard({ people, labels }) {
  const L = labels || {};
  if (!people || !people.length) return null;
  return (
    <section className="suggest-card">
      <div className="sg-head">
        <b>{L.title}</b>
        <span>{L.sub}</span>
      </div>
      <div className="sg-carousel">
        {people.map((p) => (
          <div className="sgc-item" key={p.ownerId}>
            {p.newcomer && <span className="sgc-badge">{L.newcomer}</span>}
            <a className="sgc-top" href={`/${p.handle || p.journeySlug}`}>
              <span className="sgc-ava" style={{ background: p.avatar_color || 'var(--muted)' }}>
                {p.avatar_url ? <img src={p.avatar_url} alt="" /> : (p.name || '?')[0]}
              </span>
              <b>{(p.name || '').split(' ')[0]}</b>
              <small>{p.journeyTitle}</small>
              {p.day > 0 && <span className="sgc-day">{(L.dayFmt || 'Dia {d}').replace('{d}', p.day)}</span>}
            </a>
            <FollowUserButton profileId={p.ownerId} labelFollow={L.follow} labelFollowing={L.following} labelBack={L.followBack} />
          </div>
        ))}
      </div>
    </section>
  );
}
